/**
 * dashboard.js
 * 상단 요약 통계: 전체 업체 수, 거리 구간별 업체 수, 평균 적재율, 주당 총 납품횟수.
 * 화면에 필터링된 데이터가 아닌 "현재 데이터 전체" 기준으로 계산한다(요구사항 21).
 */

const Dashboard = (function () {
  let container;

  function init(containerId) {
    container = document.getElementById(containerId);
  }

  function render(suppliers) {
    const total = suppliers.length;
    const within100 = suppliers.filter(s => s.distanceKm != null && s.distanceKm <= 100).length;
    const between100_300 = suppliers.filter(s => s.distanceKm != null && s.distanceKm > 100 && s.distanceKm <= 300).length;
    const over300 = suppliers.filter(s => s.distanceKm != null && s.distanceKm > 300).length;

    const rates = suppliers.filter(s => s.loadingRate != null).map(s => s.loadingRate);
    const avgRate = rates.length ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) : null;

    const totalFreq = suppliers.reduce((sum, s) => sum + (s.deliveryFrequencyPerWeek || 0), 0);

    const geocoded = suppliers.filter(s => s.latitude != null && s.longitude != null).length;
    const exactGeocoded = suppliers.filter(s => s.latitude != null && (s.geocodePrecision === 'exact' || !s.geocodePrecision)).length;
    const approxGeocoded = geocoded - exactGeocoded;

    container.innerHTML = `
      <div class="stat-card"><div class="stat-value">${total}</div><div class="stat-label">전체 공급업체</div></div>
      <div class="stat-card"><div class="stat-value">${within100}</div><div class="stat-label">100km 이내</div></div>
      <div class="stat-card"><div class="stat-value">${between100_300}</div><div class="stat-label">100~300km</div></div>
      <div class="stat-card"><div class="stat-value">${over300}</div><div class="stat-label">300km 이상</div></div>
      <div class="stat-card"><div class="stat-value">${avgRate != null ? avgRate + '%' : '-'}</div><div class="stat-label">평균 적재율</div></div>
      <div class="stat-card"><div class="stat-value">${totalFreq}회</div><div class="stat-label">주당 총 납품횟수</div></div>
      <div class="stat-card muted"><div class="stat-value">${geocoded}/${total}</div><div class="stat-label">지도 좌표 확보${approxGeocoded > 0 ? ` (근사 ${approxGeocoded}건 포함)` : ''}</div></div>
    `;
  }

  return { init, render };
})();
