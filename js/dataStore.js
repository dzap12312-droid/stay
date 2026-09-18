/**
 * dataStore.js
 * 데이터 로딩(JSON fetch 또는 fallback) + LocalStorage 오버레이 병합 + 저장/CSV 내보내기용 스토어.
 *
 * 왜 fetch와 fallback을 함께 쓰는가:
 *   브라우저에서 index.html을 서버 없이 파일로 그냥 더블클릭해서 열면(file:// 프로토콜)
 *   보안 정책상 fetch()로 로컬 JSON 파일을 읽을 수 없다(CORS 차단). 이를 위해
 *   data/suppliers.js 가 동일한 내용을 `window.SUPPLIERS_FALLBACK_DATA` 전역 변수로도
 *   제공한다. fetch가 가능하면(http/https 로 접속) 최신 JSON을 우선 사용하고,
 *   실패하면 자동으로 fallback 데이터를 사용한다.
 */

const LOCAL_STORAGE_KEY = 'supplierMap.overrides.v1';

// 구매팀이 지도/상세패널에서 직접 수정할 수 있는 필드 목록 (요구사항 17)
const EDITABLE_FIELDS = [
  'supplierName', 'supplierNameKR',
  'address', 'materialCategory', 'materialDetail',
  'moq', 'deliveryUnit', 'vehicleType', 'vehicleCBM',
  'deliveryFrequencyPerWeek', 'deliveryDays', 'loadingRate', 'notes',
  'locationVerified', 'latitude', 'longitude', 'locationStatus', 'factoryUsage'
];

const DataStore = (function () {
  let suppliers = [];
  let overrides = {};

  function loadOverrides() {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      overrides = raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.warn('LocalStorage overrides를 불러오지 못했습니다.', e);
      overrides = {};
    }
  }

  function persistOverrides() {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(overrides));
    } catch (e) {
      console.warn('LocalStorage 저장에 실패했습니다.', e);
    }
  }

  function applyOverrides(baseList) {
    return baseList.map(item => {
      const ov = overrides[item.id];
      if (!ov) return { ...item };
      return { ...item, ...ov };
    });
  }

  async function fetchJson() {
    const res = await fetch('data/suppliers.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  }

  async function load() {
    loadOverrides();
    let base;
    try {
      base = await fetchJson();
      console.info('[DataStore] data/suppliers.json 을 fetch로 불러왔습니다.');
    } catch (e) {
      if (typeof window.SUPPLIERS_FALLBACK_DATA !== 'undefined') {
        base = window.SUPPLIERS_FALLBACK_DATA;
        console.info('[DataStore] fetch 실패(파일 직접 열기 모드로 추정) → data/suppliers.js fallback 데이터를 사용합니다.');
      } else {
        throw new Error('공급업체 데이터를 불러올 수 없습니다. data/suppliers.json 또는 data/suppliers.js 를 확인하세요.');
      }
    }
    suppliers = applyOverrides(base);
    return suppliers;
  }

  function getAll() {
    return suppliers;
  }

  function getById(id) {
    return suppliers.find(s => s.id === id);
  }

  function update(id, patch) {
    const idx = suppliers.findIndex(s => s.id === id);
    if (idx === -1) return null;

    const cleanPatch = {};
    for (const key of Object.keys(patch)) {
      if (EDITABLE_FIELDS.includes(key)) cleanPatch[key] = patch[key];
    }

    suppliers[idx] = { ...suppliers[idx], ...cleanPatch };
    overrides[id] = { ...(overrides[id] || {}), ...cleanPatch };
    persistOverrides();
    return suppliers[idx];
  }

  /** CSV 업로드로 여러 건을 한번에 갱신할 때 사용 (csvIO.js에서 호출) */
  function bulkUpdate(patchesById) {
    for (const idStr of Object.keys(patchesById)) {
      update(Number(idStr), patchesById[idStr]);
    }
  }

  function resetOverrides() {
    overrides = {};
    persistOverrides();
  }

  return { load, getAll, getById, update, bulkUpdate, resetOverrides, EDITABLE_FIELDS };
})();
