/**
 * config.js
 * 전역 설정: 기준 공장 정보, 자재 카테고리 정의(색상/아이콘), 거리 구간 정의.
 * 카테고리나 거리 구간을 늘리려면 이 파일만 수정하면 된다.
 */

// 기준 공장 목록 (Paldo Vina 공장/생산기지). 여러 곳을 출발지로 두고 각 공급업체까지의
// 경로를 비교할 수 있도록 배열로 관리한다. 좌표는 Nominatim(OpenStreetMap) 지오코딩 결과이며,
// 실제 부지 좌표는 구매팀 확인 후 latitude/longitude, locationVerified 값을 갱신하면 된다.
const FACTORIES = [
  {
    id: 'phutho',
    name: 'Paldo Vina - Phú Thọ Factory',
    nameKR: '팔도비나 푸토공장',
    address: 'Khu công nghiệp Đồng Lạng, Phú Thọ, Vietnam',
    latitude: 21.3792399,
    longitude: 105.3388020,
    color: '#f39c12',
    locationVerified: false,
    locationStatus: 'geocoded'
  },
  {
    id: 'tayninh',
    name: 'Paldo Vina - Tây Ninh Factory',
    nameKR: '팔도비나 떠이닌공장',
    address: 'Lô B20.2, đường C3, Khu công nghiệp Thành Thành Công, Phường Trảng Bàng, Tỉnh Tây Ninh, Việt Nam',
    latitude: 11.0287747,
    longitude: 106.3083125,
    color: '#8e44ad',
    locationVerified: false,
    locationStatus: 'geocoded',
    geocodePrecision: 'industrial_zone'
  }
];

// 기존 코드 호환용 별칭(첫 번째 공장 = 푸토공장)
const FACTORY = FACTORIES[0];

// 지도를 베트남 영역으로 제한하기 위한 경계값 (남쪽 끝 ~ 북쪽 끝, 여유 포함)
const VIETNAM_BOUNDS = [
  [6.0, 99.0],   // 남서
  [24.5, 112.5]  // 북동
];

// 자재 카테고리 정의: key(내부값) / label(표시명) / color(마커·범례 색상)
// 순서가 곧 범례 표시 순서이다.
// 구매팀 요청으로 기존 9개 분류를 5개로 통합했다:
//   면원재료 = 면 원재료 + 면 첨가물
//   스프 원재료 = 스프 원료 + 향료 + 야채/농산물
//   면 부자재 = 포장재 + 설비 소모품
//   연료, 기타는 기존과 동일
const CATEGORIES = [
  { key: 'noodle_raw', label: '면원재료',   color: '#c0392b' },
  { key: 'soup_raw',   label: '스프 원재료', color: '#e67e22' },
  { key: 'packaging',  label: '면 부자재 (박스, 필름, 컵 등)', color: '#2980b9' },
  { key: 'fuel',       label: '연료',        color: '#16a085' },
  { key: 'etc',        label: '기타',        color: '#7f8c8d' }
];

const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.key, c]));

/**
 * materialDetail(한글 취급자재 상세 텍스트)를 기반으로 5개 카테고리 중 하나로 분류한다.
 * 원본 데이터(materialCategory/materialDetail)는 그대로 두고, 지도 마커 색상/필터용으로만
 * 쓰는 파생 값이므로 데이터 자체를 변경하지 않는다. 우선순위 키워드 매칭 방식이며,
 * 향후 구매팀 분류 기준이 바뀌면 이 함수만 교체하면 된다.
 */
function classifyCategory(materialDetailKR) {
  const text = materialDetailKR || '';
  const rules = [
    { key: 'noodle_raw', test: /면\s*원재료|면\s*첨가물/ },
    { key: 'packaging',  test: /포장|인쇄\s*부자재|설비\s*소모품/ },
    { key: 'fuel',        test: /연료/ },
    { key: 'soup_raw',    test: /스프|향료|향신료|야채|농산|해조/ }
  ];
  for (const rule of rules) {
    if (rule.test.test(text)) return rule.key;
  }
  return 'etc';
}

// 거리 구간 필터 정의 (km)
const DISTANCE_BANDS = [
  { key: 'd0_50',   label: '0~50 km',    min: 0,   max: 50 },
  { key: 'd50_100', label: '50~100 km',  min: 50,  max: 100 },
  { key: 'd100_150',label: '100~150 km', min: 100, max: 150 },
  { key: 'd150_300',label: '150~300 km', min: 150, max: 300 },
  { key: 'd300_up', label: '300 km 이상', min: 300, max: Infinity }
];

function getDistanceBand(km) {
  if (km === null || km === undefined) return null;
  return DISTANCE_BANDS.find(b => km >= b.min && km < b.max) || DISTANCE_BANDS[DISTANCE_BANDS.length - 1];
}

// factoryUsage 표시 라벨/색상 (요구사항: 푸토전용/떠이닌전용/양쪽 공용 구분)
const FACTORY_USAGE_LABEL = {
  phutho:  { label: '푸토공장만 사용',   short: '푸토', color: '#f39c12' },
  tayninh: { label: '떠이닌공장만 사용', short: '떠이닌', color: '#8e44ad' },
  both:    { label: '양측 공장 모두 사용', short: '양쪽', color: '#16a085' }
};

// locationType 표시 라벨
const LOCATION_TYPE_LABEL = {
  office: '법인 주소',
  factory: '공장',
  warehouse: '창고',
  branch: '지점·물류기지',
  factory_and_office: '법인·생산장',
  unknown: '미확인'
};

// 요일 순서/라벨 (deliveryDays 저장은 'mon'..'sun' 배열)
const WEEKDAYS = [
  { key: 'mon', label: '월' },
  { key: 'tue', label: '화' },
  { key: 'wed', label: '수' },
  { key: 'thu', label: '목' },
  { key: 'fri', label: '금' },
  { key: 'sat', label: '토' },
  { key: 'sun', label: '일' }
];
