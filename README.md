# Phú Thọ Factory - Supplier Logistics Map

Paldo Vina 푸토공장(+떠이닌공장) 원부자재 공급업체 물류 지도. 순수 HTML/CSS/JS + Leaflet.js + OpenStreetMap, 빌드 도구 없음.

**실행**: `index.html`을 파일로 직접 열거나(제한적으로 동작), `지도_열기.bat` 실행 시 로컬 서버로 완전히 동작.

## 구조
- `index.html`, `style.css` — 페이지/스타일
- `js/` — `config`(공장·카테고리 설정), `dataStore`(데이터 로드+로컬 편집 저장), `csvIO`, `geocoder`, `routing`(OSRM 도로 경로, 베트남 국경 체크), `mapView`, `panel`, `listView`, `dashboard`, `filters`, `main`(부트스트랩)
- `data/suppliers.json` — 원본 데이터(88개 업체), `data/suppliers.js` — file:// 실행용 동일 데이터 fallback
- `assets/icons/factory.svg` — 공장 마커 아이콘

## 데이터 편집
지도 안에서 [수정]으로 고친 내용은 브라우저 localStorage에만 저장됨(다른 사람껜 안 보임). 실제 반영하려면 CSV 다운로드 후 `data/suppliers.json`에 병합.

## 배포
현재 https://lively-pithivier-ed4465.netlify.app 에 공개 배포됨 (Netlify Drop, 폴더 구조 평탄화 후 업로드 — 자동화 업로드 시 하위폴더가 깨지는 이슈가 있어 `js/`, `data/*` 경로 참조를 제거한 평탄 버전을 만들어 올림).
