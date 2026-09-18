# CLAUDE.md

## 1. Project Overview

이 프로젝트는 Paldo Vina 공장들의 원부자재 공급업체 정보를 지도에 표시하고 관리하는 웹 애플리케이션이다. 순수 HTML/CSS/JS + Leaflet.js + OpenStreetMap이며 빌드 도구가 없다.

주요 목적:
- 공급업체 주소 관리
- 공급업체 위치를 지도에 표시
- Phú Thọ 공장 공급업체 관리 (88개)
- Tây Ninh 공장 공급업체 관리 (86개)
- 업체별 "공장 사용 구분" 관리 (푸토전용 / 떠이닌전용 / 양쪽 공용)
- 공급업체 주소의 지오코딩
- 위도/경도 데이터 관리
- 공급업체와 공장 간 실도로 경로·거리 확인 (OSRM)
- 지도에서 공급업체 상세정보 확인 및 수정

현재 주요 데이터 파일:
- `data/suppliers.json` — 원본(174개 업체), fetch 실패 시 `data/suppliers.js`(fallback, 동일 내용)를 사용

현재 주요 스크립트:
- `build_data.ps1` — Phú Thọ 88개를 **최초 1회** 생성한 스크립트. 재실행하면 전체를 처음부터 다시 지오코딩하게 되어 기존에 확보한 정밀 좌표/수동 보정이 초기화될 수 있으므로 **재실행 금지**(참고용 원본 기록으로만 유지).
- `regeocode_fallback.ps1` — `locationStatus == 'failed'`인 업체만 대상으로 주소를 단순화하며 재시도.
- `geocode_tayninh.ps1` — Tây Ninh 업체 중 `locationStatus == 'pending'`인 업체만 대상으로 지오코딩. 기존 Phú Thọ 88개는 건드리지 않음. **좌표 보완 시 기본으로 사용할 스크립트.**

로컬 실행: `지도_열기.bat` (내부적으로 `serve.ps1`로 로컬 서버 구동). 배포: https://lively-pithivier-ed4465.netlify.app (Netlify Drop, 폴더 평탄화 후 업로드).

---

## 2. Current Data

공급업체 데이터는 `data/suppliers.json`을 기준으로 한다 (`data/suppliers.js`는 완전히 동일한 내용의 fallback이므로 **항상 두 파일을 함께** 갱신한다).

- 전체 174개: Phú Thọ `id 1~88` + Tây Ninh `id 89~174`
- `sourceFactory`: `'phutho'` | `'tayninh'` — 이 행의 주소/거리(distanceKm)가 어느 공장 기준 데이터인지 (id 1~88은 항상 phutho, id 89~174는 항상 tayninh, 절대 재계산하지 않는다)
- `factoryUsage`: `'phutho'` | `'tayninh'` | `'both'` — 이 업체(법인)가 실제로 어느 공장에 납품하는지 분류
  - 업체명이 양쪽 리스트에서 정확히 일치하는 48쌍(96행)이 `'both'`
  - 지점/본사 표기 차이만 있던 애매한 2건(Ba Đình, Vĩnh Nam Anh)은 사용자 확인 결과 별개 업체로 처리되어 있음 — **재분류하려면 반드시 사용자에게 먼저 확인**한다
  - `both`인 경우에도 두 공장의 행을 병합하지 않는다. 같은 법인이라도 공장별로 주소·자재·거리가 다른 경우가 많아(실제 출고지가 다름) 행은 그대로 유지하고 분류 태그만 공유한다
- `locationStatus`: `'geocoded'` | `'pending'`(좌표 미확보, 지오코딩 대상) | `'overseas'`(한국 등 해외 소재, 베트남 도로거리 대상 아님 — 지오코딩 대상에서 제외) | `'failed'`(시도했으나 실패) | `'manual'`/`'verified'`(사람이 직접 입력/검증)

기존 Phú Thọ 데이터와 신규 Tây Ninh 데이터를 구분해서 관리한다. 기존 데이터를 임의로 삭제하거나 덮어쓰지 않는다. 특히 기존에 정상적으로 확보된 위도/경도 데이터(`locationStatus: 'geocoded'`, `'manual'`, `'verified'`)는 그대로 유지한다.

---

## 3. Geocoding Rules

지오코딩은 기본적으로 PowerShell 스크립트를 사용한다 (Nominatim은 이 리포를 다루는 클라우드 세션에서는 네트워크 정책상 접근이 막혀 있을 수 있으므로, 그런 경우 스크립트를 작성/수정만 하고 실제 실행은 사용자가 로컬 PC에서 한다).

대상별 스크립트:
- Tây Ninh 신규 업체 좌표 보완 → `geocode_tayninh.ps1` (대상: `locationStatus == 'pending'`)
- 기존에 실패했던 업체 재시도 → `regeocode_fallback.ps1` (대상: `locationStatus == 'failed'`)
- 처음부터 전체 재생성 → `build_data.ps1` (원칙적으로 재실행 금지, 2번 참고)

원칙:
1. 이미 정상적인 latitude/longitude가 있는 업체(`geocoded`/`manual`/`verified`)는 다시 지오코딩하지 않는다.
2. 좌표가 없는 업체(`pending`, `failed`)만 대상으로 한다.
3. 기존 Phú Thọ 좌표 데이터를 변경하지 않는다.
4. Tây Ninh 업체 중 `pending` 상태인 업체를 우선 처리한다.
5. Nominatim 등 외부 지오코딩 서비스를 사용할 경우 요청 간격을 최소 1.1초 이상 둔다.
6. 지오코딩 실패 시 주소를 단순화(괄호 태그·MST 제거 → 산업단지명 추출 → 앞 구간부터 순차 제거)하여 재시도할 수 있다.
7. 실패한 업체를 임의의 좌표로 입력하지 않는다.
8. 지오코딩 결과가 불확실한 경우 자동으로 확정하지 말고 `failed` 또는 `pending` 상태로 남긴다.
9. 지오코딩 결과를 저장할 때 기존 데이터 구조(필드 순서·타입)를 유지한다. 새 필드가 필요하면 끝에 추가하고, 기존 필드명/의미를 바꾸지 않는다.
10. `data/suppliers.json`을 갱신했다면 반드시 `data/suppliers.js`도 동일한 내용으로 함께 갱신한다.

---

## 4. Important Data Protection Rules

기존 데이터는 매우 중요하다. 코드를 수정할 때 다음을 금지한다.

- 기존 업체 삭제
- 기존 업체의 주소 임의 변경
- 기존 좌표 임의 변경
- 업체 ID 임의 변경
- `sourceFactory` 값 임의 변경 (원본 데이터 출처를 나타내는 고정값)
- `factoryUsage` 재분류를 사용자 확인 없이 임의로 변경
- 데이터 구조의 불필요한 변경
- 기존 정상 데이터를 새 데이터로 덮어쓰기
- 실제 데이터가 아닌 테스트 데이터를 production 데이터(`data/suppliers.json`)에 저장

데이터 구조를 변경해야 하는 경우 먼저 기존 구조와의 호환성을 확인한다 (예: `js/dataStore.js`의 `EDITABLE_FIELDS`, `js/csvIO.js`의 `CSV_COLUMNS`와 필드명이 일치해야 함).

---

## 5. Code Modification Rules

코드를 수정하기 전에 반드시 관련 파일을 먼저 확인한다. 전체 프로젝트를 불필요하게 읽지 않는다. 사용자의 요청과 관련된 파일을 우선적으로 확인한다.

예: 사용자가 지오코딩 문제를 요청하면
1. `geocode_tayninh.ps1` (또는 `regeocode_fallback.ps1`)
2. `data/suppliers.json`
3. `js/geocoder.js`, `js/main.js`(`wireGeocode`) 등 지오코딩 결과를 사용하는 JavaScript

예: 사용자가 지도/필터/패널 표시 문제를 요청하면
1. `js/mapView.js`, `js/panel.js`, `js/listView.js`, `js/filters.js`, `js/dashboard.js` 중 관련된 것
2. `js/config.js` (FACTORIES, CATEGORIES, FACTORY_USAGE_LABEL 등 설정)
3. `style.css`

관련 없는 UI 파일이나 다른 기능의 코드를 불필요하게 수정하지 않는다.

---

## 6. Preserve Existing Functionality

새로운 기능을 추가할 때 기존 기능을 유지한다. 특히 다음 기능이 정상적으로 작동하는지 확인한다.

- 지도 표시 (Leaflet, 베트남 영역 제한, 공장/업체 마커)
- 업체 검색 / 자재 카테고리 필터 / 거리 구간 필터 / 공장 사용 구분 필터
- 업체 상세정보 조회·수정 (Panel), CSV 내보내기/가져오기
- 지역별(Phú Thọ / Tây Ninh) 업체 표시
- 기존 Phú Thọ 데이터 표시
- Tây Ninh 데이터 표시
- 위도/경도 표시, 근사 위치(geocodePrecision) 배지
- 공장별 실도로 거리·경로 계산 (OSRM), 1000km 이상 초장거리 직선 대체, 베트남 국경 밖 경로 차단
- 지오코딩 결과 저장 (지도 내 "지오코딩 실행" 버튼 → localStorage, 또는 PowerShell 스크립트 → `data/suppliers.json` 직접 반영)
- 대시보드 통계 (전체/거리 구간별/공장 사용 구분별 업체 수, 평균 적재율 등)

새 기능을 추가하면서 기존 기능을 삭제하거나 변경하지 않는다.

---

## 7. PowerShell Encoding

PowerShell 스크립트는 UTF-8 인코딩 문제에 주의한다. 한국어 또는 베트남어 문자열을 포함하는 PowerShell 파일을 생성하거나 수정할 경우 파일 전체의 인코딩이 깨지지 않도록 한다 (파일 저장 시 BOM 없는 UTF-8 사용 — 기존 스크립트들은 `$utf8NoBom = New-Object System.Text.UTF8Encoding($false)`로 통일).

다음과 같은 깨진 문자열이 발견되면 즉시 확인한다.

예: `ê³¼`, `ë‚´ìš©`, `ë‹´ì€`, `ì•„`

이러한 문자열은 정상적인 베트남어/한국어가 아니라 인코딩이 깨진 문자열일 가능성이 높다.

PowerShell 스크립트가 `ParserError`를 발생시키는 경우 단순히 에러가 발생한 단어만 삭제하지 말고, 해당 부분의 문자열 구조와 파일 인코딩을 함께 확인한다.

---

## 8. Git Rules

GitHub Repository(`dzap12312-droid/stay`)의 코드가 이 프로젝트의 원격 기준본이다.

작업 전:
```powershell
git status
git fetch origin
```

- 작업은 `claude/*` 형태의 기능 브랜치에서 진행하고, 완료되면 draft PR을 생성해 `main`으로 병합한다 (지금까지 이 저장소는 1인 작업 저장소라 PR 리뷰 없이 바로 병합하는 경우가 많았다 — 애매하면 병합 전에 사용자에게 확인한다).
- 커밋 전 반드시 `git status` / `git diff`로 실제 변경 내용을 확인한다. 특히 `data/suppliers.json`처럼 큰 데이터 파일은 의도한 필드만 바뀌었는지 확인한다.
- `git push --force`, `git reset --hard`, 커밋 amend 등 파괴적 작업은 사용자의 명시적 요청 없이 하지 않는다.
- `.gitignore`에 없는 민감 정보(API 키, 개인정보 등)가 실수로 커밋되지 않도록 staging 내용을 확인한다.
- 로컬 작업 폴더 경로: `D:\생산지원\본부장님 숙제\supplier-map` — PowerShell 스크립트들의 `$root`/`$outDir` 값과 반드시 일치해야 한다.
