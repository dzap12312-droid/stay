/**
 * mapView.js
 * Leaflet 지도 초기화, 공장/공급업체 마커, 카테고리 범례, 클러스터링,
 * 공장-업체 간 직선 물류 경로(향후 실제 도로 경로 API로 교체 가능하도록 분리).
 */

const MapView = (function () {
  let map;
  let markerCluster;
  let markersById = {};
  let routeLines = {};          // 공급업체별 최인접 공장까지의 얇은 점선(항상 표시 가능)
  let selectedRouteLines = {};  // 선택된 업체에 대한 공장별 굵은 실제 도로 경로선
  let hiddenCategories = new Set();
  let onMarkerClickCallback = null;
  let factoriesList = [];
  let routeRequestToken = 0; // 연속 클릭/체크 시 이전 비동기 경로 조회 결과가 뒤늦게 그려지는 것을 막기 위한 토큰

  function init(containerId) {
    map = L.map(containerId, {
      zoomControl: true,
      maxBounds: VIETNAM_BOUNDS,
      maxBoundsViscosity: 0.8,
      minZoom: 5
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    map.setMaxBounds(VIETNAM_BOUNDS);

    markerCluster = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false
    });
    map.addLayer(markerCluster);

    return map;
  }

  function factoryIcon(color) {
    return L.divIcon({
      className: 'factory-marker',
      html: `<div class="factory-marker-inner" style="background:${color || '#f39c12'}">★</div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -17]
    });
  }

  function supplierIcon(categoryKey, verified, precision) {
    const cat = CATEGORY_MAP[categoryKey] || CATEGORY_MAP.etc;
    const isApprox = precision && precision !== 'exact';
    let cls = verified ? 'supplier-marker verified' : 'supplier-marker unverified';
    if (isApprox) cls += ' approx';
    return L.divIcon({
      className: cls,
      html: `<span style="background:${cat.color}"></span>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
      popupAnchor: [0, -9]
    });
  }

  const PRECISION_LABEL = {
    exact: null,
    industrial_zone: '산업단지 위치 기준(근사)',
    ward_district: '동/구 단위 근사 위치',
    province_level: '성/시 단위 근사 위치 (부정확할 수 있음)'
  };

  function addFactoryMarkers(factories) {
    factoriesList = factories;
    factories.forEach(factory => {
      const marker = L.marker([factory.latitude, factory.longitude], { icon: factoryIcon(factory.color), zIndexOffset: 1000 });
      marker.bindPopup(
        `<div class="popup-factory"><strong>${factory.name}</strong><br>${factory.nameKR}<br>` +
        `<span class="popup-address">${factory.address}</span></div>`
      );
      marker.addTo(map);
    });
  }

  function popupHtml(s) {
    const na = '미입력';
    const precisionNote = PRECISION_LABEL[s.geocodePrecision];
    return `
      <div class="popup-card">
        <div class="popup-title">${s.supplierNameKR || na}</div>
        <div class="popup-sub">${s.supplierName}</div>
        ${precisionNote ? `<div class="popup-precision-note">⚠ ${precisionNote}</div>` : ''}
        <table class="popup-table">
          <tr><th>주소</th><td>${s.address}</td></tr>
          <tr><th>푸토공장 거리</th><td>약 ${s.distanceKm ?? na} km</td></tr>
          <tr><th>취급 자재</th><td>${s.materialDetail || na}</td></tr>
          <tr><th>MOQ</th><td>${s.moq ?? na}</td></tr>
          <tr><th>납품단위</th><td>${s.deliveryUnit ?? na}</td></tr>
          <tr><th>차량규격</th><td>${s.vehicleType ?? na}</td></tr>
          <tr><th>납품횟수</th><td>${s.deliveryFrequencyPerWeek != null ? '주 ' + s.deliveryFrequencyPerWeek + '회' : na}</td></tr>
          <tr><th>월 납품요일</th><td>${formatDeliveryDays(s.deliveryDays)}</td></tr>
          <tr><th>적재율</th><td>${s.loadingRate != null ? s.loadingRate + '%' : na}</td></tr>
        </table>
      </div>`;
  }

  function formatDeliveryDays(days) {
    if (!days || days.length === 0) return '미입력';
    const labelOf = k => (WEEKDAYS.find(w => w.key === k) || {}).label || k;
    return days.map(labelOf).join(', ');
  }

  function renderMarkers(suppliers, onMarkerClick) {
    onMarkerClickCallback = onMarkerClick;
    markerCluster.clearLayers();
    markersById = {};
    Object.values(routeLines).forEach(l => map.removeLayer(l));
    routeLines = {};

    suppliers.forEach(s => {
      if (s.latitude == null || s.longitude == null) return; // 좌표 미확보 업체는 지도에 표시하지 않음(목록에는 표시)
      const catKey = classifyCategory(s.materialDetail);
      if (hiddenCategories.has(catKey)) return;

      const marker = L.marker([s.latitude, s.longitude], {
        icon: supplierIcon(catKey, s.locationVerified, s.geocodePrecision)
      });
      marker.bindPopup(popupHtml(s));
      marker.on('click', () => onMarkerClickCallback && onMarkerClickCallback(s.id));
      markerCluster.addLayer(marker);
      markersById[s.id] = marker;

      if (factoriesList.length > 0) {
        const nearest = nearestFactory(factoriesList, [s.latitude, s.longitude]);
        const line = L.polyline([[nearest.latitude, nearest.longitude], [s.latitude, s.longitude]], {
          color: (CATEGORY_MAP[catKey] || CATEGORY_MAP.etc).color,
          weight: 1,
          opacity: 0.25,
          dashArray: '4,4',
          className: 'route-line'
        });
        routeLines[s.id] = line;
      }
    });
  }

  function setRouteLinesVisible(visible) {
    Object.values(routeLines).forEach(line => {
      if (visible) line.addTo(map); else map.removeLayer(line);
    });
  }

  function clearSelectedRoutes() {
    routeRequestToken++; // 진행 중이던 이전 조회는 결과가 와도 무시되도록 토큰을 갱신
    Object.values(selectedRouteLines).forEach(entry => map.removeLayer(entry.line));
    selectedRouteLines = {};
  }

  /**
   * 한 개 이상의 업체에 대해, 등록된 모든 공장 각각에서 실제 도로 경로(OSRM)를 굵은 선으로 표시한다.
   * 여러 업체를 동시에 넘기면(비교 선택) 업체별·공장별 경로가 모두 함께 그려진다.
   * OSRM 조회가 실패하면 해당 조합은 조용히 건너뛴다(기존 얇은 점선은 항상 남아있음).
   * onResult(supplier, factory, result|null) 콜백으로 조합별 결과를 알려준다.
   */
  async function showRoutesForSuppliers(suppliers, onResult) {
    clearSelectedRoutes();
    const myToken = routeRequestToken;
    const targets = suppliers.filter(s => s.latitude != null && s.longitude != null);
    if (targets.length === 0 || factoriesList.length === 0) return;

    const jobs = [];
    targets.forEach(supplier => {
      const dest = [supplier.latitude, supplier.longitude];
      factoriesList.forEach(factory => {
        jobs.push((async () => {
          const origin = [factory.latitude, factory.longitude];
          const straightKm = haversineKm(origin, dest);
          let result;
          if (straightKm >= LONG_DISTANCE_THRESHOLD_KM) {
            // 1000km 이상 초장거리는 도로 경로를 조회하지 않고 굵은 직선 + 직선거리로 대체
            result = { latlngs: [origin, dest], distanceKm: Math.round(straightKm), durationMin: null, isStraight: true };
          } else {
            result = await Routing.fetchRoute(origin, dest);
          }
          if (myToken !== routeRequestToken) return; // 그 사이 다른 선택으로 바뀌었으면 이 결과는 버림
          if (result) {
            const line = L.polyline(result.latlngs, {
              color: factory.color || '#1d4ed8',
              weight: targets.length > 1 ? 4 : 5,
              opacity: 0.85,
              dashArray: result.isStraight ? '14,10' : null,
              className: 'active-route-line' + (result.isStraight ? ' straight-fallback' : '')
            }).addTo(map);
            const label = result.isStraight
              ? `${supplier.supplierNameKR || supplier.supplierName} · ${factory.nameKR} → 약 ${result.distanceKm}km (직선거리, 1000km 이상 구간)`
              : `${supplier.supplierNameKR || supplier.supplierName} · ${factory.nameKR} → 약 ${result.distanceKm}km (${result.durationMin}분)`;
            line.bindTooltip(label, { sticky: true });
            selectedRouteLines[`${supplier.id}:${factory.id}`] = { line, result };
          }
          onResult && onResult(supplier, factory, result);
        })());
      });
    });
    await Promise.all(jobs);
  }

  function toggleCategory(catKey, visible) {
    if (visible) hiddenCategories.delete(catKey);
    else hiddenCategories.add(catKey);
  }

  function isCategoryHidden(catKey) {
    return hiddenCategories.has(catKey);
  }

  function focusSupplier(id) {
    const marker = markersById[id];
    if (!marker) return;
    markerCluster.zoomToShowLayer(marker, () => {
      map.setView(marker.getLatLng(), Math.max(map.getZoom(), 14), { animate: true });
      marker.openPopup();
    });
  }

  function addLegend(onToggle) {
    const legend = L.control({ position: 'topright' });
    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'map-legend');
      div.innerHTML = '<div class="legend-title">자재 카테고리</div>' + CATEGORIES.map(c => `
        <div class="legend-item" data-key="${c.key}">
          <span class="legend-dot" style="background:${c.color}"></span>
          <span class="legend-label">${c.label}</span>
        </div>`).join('') +
        FACTORIES.map(f => `<div class="legend-item legend-factory"><span class="legend-star" style="color:${f.color}">★</span><span class="legend-label">${f.nameKR}</span></div>`).join('');

      L.DomEvent.disableClickPropagation(div);
      div.querySelectorAll('.legend-item[data-key]').forEach(el => {
        el.addEventListener('click', () => {
          const key = el.dataset.key;
          const nowHidden = !el.classList.contains('inactive');
          el.classList.toggle('inactive', nowHidden);
          onToggle(key, !nowHidden);
        });
      });
      return div;
    };
    legend.addTo(map);
  }

  function setLegendState(key, visible) {
    const el = document.querySelector(`.legend-item[data-key="${key}"]`);
    if (el) el.classList.toggle('inactive', !visible);
  }

  function fitToAll(suppliers, factories) {
    const pts = factories.map(f => [f.latitude, f.longitude]);
    suppliers.forEach(s => { if (s.latitude != null && s.longitude != null) pts.push([s.latitude, s.longitude]); });
    if (pts.length > 1) {
      map.fitBounds(pts, { padding: [40, 40] });
    } else {
      map.setView(pts[0], 7);
    }
  }

  return {
    init, addFactoryMarkers, renderMarkers, focusSupplier, fitToAll,
    toggleCategory, isCategoryHidden, setRouteLinesVisible, addLegend, setLegendState,
    showRoutesForSuppliers, clearSelectedRoutes
  };
})();
