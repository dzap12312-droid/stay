/**
 * filters.js
 * 검색어 / 자재 카테고리(복수 선택) / 거리 구간 필터 상태 관리 및 적용.
 */

const Filters = (function () {
  const state = {
    search: '',
    categories: new Set(CATEGORIES.map(c => c.key)), // 기본값: 전체 선택
    distanceBands: new Set(DISTANCE_BANDS.map(b => b.key)),
    factoryUsages: new Set(Object.keys(FACTORY_USAGE_LABEL)) // 기본값: 전체 선택 (푸토/떠이닌/양쪽)
  };

  function setSearch(text) {
    state.search = (text || '').trim().toLowerCase();
  }

  function toggleCategory(key, on) {
    if (on) state.categories.add(key); else state.categories.delete(key);
  }

  function toggleDistanceBand(key, on) {
    if (on) state.distanceBands.add(key); else state.distanceBands.delete(key);
  }

  function toggleFactoryUsage(key, on) {
    if (on) state.factoryUsages.add(key); else state.factoryUsages.delete(key);
  }

  function isCategoryOn(key) { return state.categories.has(key); }
  function isDistanceBandOn(key) { return state.distanceBands.has(key); }
  function isFactoryUsageOn(key) { return state.factoryUsages.has(key); }

  function matchesSearch(s) {
    if (!state.search) return true;
    const haystack = [
      s.supplierName, s.supplierNameKR, s.address,
      s.materialCategory, s.materialDetail
    ].filter(Boolean).join(' ').toLowerCase();
    return haystack.includes(state.search);
  }

  function apply(suppliers) {
    return suppliers.filter(s => {
      if (!matchesSearch(s)) return false;

      const catKey = classifyCategory(s.materialDetail);
      if (!state.categories.has(catKey)) return false;

      const band = getDistanceBand(s.distanceKm);
      if (band && !state.distanceBands.has(band.key)) return false;
      if (!band && state.distanceBands.size !== DISTANCE_BANDS.length) return false;

      if (s.factoryUsage && !state.factoryUsages.has(s.factoryUsage)) return false;

      return true;
    });
  }

  return {
    setSearch, toggleCategory, toggleDistanceBand, toggleFactoryUsage,
    isCategoryOn, isDistanceBandOn, isFactoryUsageOn, apply
  };
})();
