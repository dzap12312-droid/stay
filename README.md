# Phú Thọ / Tây Ninh Factory - Supplier Logistics Map

Paldo Vina 푸토공장 + 떠이닌공장 원부자재 공급업체 물류 지도. 순수 HTML/CSS/JS + Leaflet.js + OpenStreetMap, 빌드 도구 없음.

**실행**: `index.html`을 파일로 직접 열거나(제한적으로 동작), `지도_열기.bat` 실행 시 로컬 서버로 완전히 동작.

## 구조
- `index.html`, `style.css` — 페이지/스타일
- `js/` — `config`(공장·카테고리·공장사용구분 설정), `dataStore`(데이터 로드+로컬 편집 저장), `csvIO`, `geocoder`, `routing`(OSRM 도로 경로, 베트남 국경 체크), `mapView`, `panel`, `listView`, `dashboard`, `filters`, `main`(부트스트랩)
- `data/suppliers.json` — 원본 데이터(174개 업체: 푸토 88 + 떠이닌 86), `data/suppliers.js` — file:// 실행용 동일 데이터 fallback
- `assets/icons/factory.svg` — 공장 마커 아이콘

## 공장 사용 구분 (factoryUsage)
푸토·떠이닌 두 공급업체 리스트를 업체명(법인명) 기준으로 대사하여 각 업체에 `factoryUsage` 필드를 추가했다:
- `phutho` — 푸토공장만 사용 (40개)
- `tayninh` — 떠이닌공장만 사용 (38개)
- `both` — 양측 공장 모두 사용 (동일 법인이 양쪽에 각각 다른 주소/자재로 등록된 경우 포함, 48개 업체 쌍 = 96행)

업체명이 정확히 동일한 경우만 자동으로 `both`로 분류했고, 지점/본사 표기 차이만 있는 애매한 2건(Ba Đình, Vĩnh Nam Anh)은 확인 결과 별개 업체로 처리했다. `both`로 묶인 경우에도 행 자체는 병합하지 않았다 — 같은 회사라도 공장별로 주소·취급자재·거리가 다른 사례가 많아(물류상 실제 출고지가 다름) 각 공장 기준 행을 그대로 유지하고 구분 태그만 공유한다. 지도/목록/패널에서 배지(푸토/떠이닌/양쪽)로 표시되며, 상세패널의 [수정]에서 재분류할 수 있다.

## 떠이닌 업체 좌표(지오코딩) 남은 작업
떠이닌공장 업체 86건은 이번에 신규로 추가되었고, 이 작업을 진행한 환경(클라우드 세션)은 OpenStreetMap Nominatim에 네트워크 접근이 막혀 있어 좌표를 직접 채우지 못했다. `locationStatus`가 `pending`인 업체가 대상이며(해외소재 한국 업체 3건은 `overseas`로 표시되어 제외), 아래 중 하나로 로컬 PC에서 완료하면 된다:
1. **권장**: PowerShell에서 `./geocode_tayninh.ps1` 실행 — `pending` 86건만 지오코딩해서 `data/suppliers.json`/`data/suppliers.js`를 직접 갱신한다(기존 푸토 88건은 건드리지 않음).
2. 또는 지도를 열고 툴바의 "지오코딩 실행" 버튼 사용 — 브라우저(localStorage)에만 저장되므로 CSV 다운로드 후 수동 병합 필요.

`build_data.ps1`은 원래 푸토 88건을 처음부터 생성했던 스크립트로, 현재 배열은 갱신하지 않았다(다시 실행하면 전체를 지오코딩부터 새로 하게 되어 기존에 확보한 정밀 좌표가 초기화될 수 있음). 떠이닌 86건은 `data/suppliers.json`에 직접 추가되었으므로 좌표 보완은 `geocode_tayninh.ps1`만 실행하면 된다.

## 데이터 편집
지도 안에서 [수정]으로 고친 내용은 브라우저 localStorage에만 저장됨(다른 사람껜 안 보임). 실제 반영하려면 CSV 다운로드 후 `data/suppliers.json`에 병합.

## 배포
현재 https://lively-pithivier-ed4465.netlify.app 에 공개 배포됨 (Netlify Drop, 폴더 구조 평탄화 후 업로드 — 자동화 업로드 시 하위폴더가 깨지는 이슈가 있어 `js/`, `data/*` 경로 참조를 제거한 평탄 버전을 만들어 올림). 떠이닌 좌표 보완 후 재배포가 필요하다.
