/**
 * main.js
 * 애플리케이션 부트스트랩: 데이터 로딩 → 각 모듈 초기화 → 이벤트 연결.
 */

(async function () {
  const els = {
    search: document.getElementById('search-input'),
    factoryUsageFilters: document.getElementById('factory-usage-filters'),
    categoryFilters: document.getElementById('category-filters'),
    distanceFilters: document.getElementById('distance-filters'),
    csvUpload: document.getElementById('csv-upload'),
    btnExportCsv: document.getElementById('btn-export-csv'),
    btnRunGeocode: document.getElementById('btn-run-geocode'),
    geocodeProgress: document.getElementById('geocode-progress'),
    toggleRoutes: document.getElementById('toggle-routes'),
    loadingOverlay: document.getElementById('loading-overlay'),
    loadError: document.getElementById('load-error'),
    compareStatus: document.getElementById('compare-status')
  };

  function refresh() {
    const all = DataStore.getAll();
    const filtered = Filters.apply(all);
    ListView.render(filtered);
    MapView.renderMarkers(filtered, onMarkerClick);
    MapView.setRouteLinesVisible(els.toggleRoutes.checked);
    Dashboard.render(all);
  }

  function showRoutesFor(s) {
    if (s.latitude == null || s.longitude == null) return;
    Panel.renderRouteComparison(FACTORIES);
    MapView.showRoutesForSuppliers([s], (supplier, factory, result) => Panel.setRouteResult(factory, result));
    els.compareStatus.style.display = 'none';
  }

  function onCompareChange(ids) {
    if (ids.length === 0) {
      MapView.clearSelectedRoutes();
      els.compareStatus.style.display = 'none';
      return;
    }
    const suppliers = ids.map(id => DataStore.getById(id)).filter(Boolean);
    const names = suppliers.map(s => s.supplierNameKR || s.supplierName).join(', ');
    els.compareStatus.style.display = '';
    els.compareStatus.textContent = `이동경로 비교 중 (${suppliers.length}개): ${names} — 지도의 선을 마우스오버하면 공장별 거리가 표시됩니다.`;
    MapView.showRoutesForSuppliers(suppliers);
  }

  function onMarkerClick(id) {
    const s = DataStore.getById(id);
    if (!s) return;
    Panel.show(s);
    ListView.setSelected(id);
    showRoutesFor(s);
  }

  function onListSelect(id) {
    const s = DataStore.getById(id);
    if (!s) return;
    Panel.show(s);
    if (s.latitude != null && s.longitude != null) {
      MapView.focusSupplier(id);
    }
    showRoutesFor(s);
  }

  function onSave(id, patch) {
    const updated = DataStore.update(id, patch);
    refresh();
    if (updated) Panel.show(updated);
  }

  function buildCategoryFilterUI() {
    els.categoryFilters.innerHTML = CATEGORIES.map(c => `
      <label class="filter-chip" data-key="${c.key}">
        <input type="checkbox" checked value="${c.key}">
        <span class="chip-dot" style="background:${c.color}"></span>${c.label}
      </label>`).join('');

    els.categoryFilters.querySelectorAll('input[type=checkbox]').forEach(cb => {
      cb.addEventListener('change', () => {
        Filters.toggleCategory(cb.value, cb.checked);
        MapView.setLegendState(cb.value, cb.checked);
        refresh();
      });
    });
  }

  function buildFactoryUsageFilterUI() {
    els.factoryUsageFilters.innerHTML = Object.keys(FACTORY_USAGE_LABEL).map(key => {
      const f = FACTORY_USAGE_LABEL[key];
      return `
      <label class="filter-chip" data-key="${key}">
        <input type="checkbox" checked value="${key}">
        <span class="chip-dot" style="background:${f.color}"></span>${f.label}
      </label>`;
    }).join('');

    els.factoryUsageFilters.querySelectorAll('input[type=checkbox]').forEach(cb => {
      cb.addEventListener('change', () => {
        Filters.toggleFactoryUsage(cb.value, cb.checked);
        refresh();
      });
    });
  }

  function buildDistanceFilterUI() {
    els.distanceFilters.innerHTML = DISTANCE_BANDS.map(b => `
      <label class="filter-chip">
        <input type="checkbox" checked value="${b.key}">${b.label}
      </label>`).join('');

    els.distanceFilters.querySelectorAll('input[type=checkbox]').forEach(cb => {
      cb.addEventListener('change', () => {
        Filters.toggleDistanceBand(cb.value, cb.checked);
        refresh();
      });
    });
  }

  function wireSearch() {
    let timer = null;
    els.search.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        Filters.setSearch(els.search.value);
        refresh();
      }, 150);
    });
  }

  function wireCsv() {
    els.btnExportCsv.addEventListener('click', () => {
      downloadCsv(DataStore.getAll());
    });

    els.csvUpload.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const text = await file.text();
      const patches = parseSuppliersCsv(text);
      const count = Object.keys(patches).length;
      if (count === 0) {
        alert('CSV에서 유효한 ID를 가진 행을 찾지 못했습니다. 헤더/ID 컬럼을 확인하세요.');
        return;
      }
      DataStore.bulkUpdate(patches);
      refresh();
      alert(`${count}건의 업체 정보를 CSV 데이터로 갱신했습니다.`);
      e.target.value = '';
    });
  }

  function wireGeocode() {
    els.btnRunGeocode.addEventListener('click', async () => {
      const targets = DataStore.getAll().filter(s =>
        s.locationStatus !== 'geocoded' && s.locationStatus !== 'manual' &&
        s.locationStatus !== 'verified' && s.locationStatus !== 'overseas');
      if (targets.length === 0) {
        els.geocodeProgress.textContent = '지오코딩이 필요한 업체가 없습니다.';
        return;
      }
      if (!confirm(`좌표 미확보 업체 ${targets.length}건에 대해 순차적으로 지오코딩을 시도합니다 (약 ${Math.ceil(targets.length * 1.1)}초 소요). 계속할까요?`)) return;

      els.btnRunGeocode.disabled = true;
      await Geocoder.runBatch(
        targets,
        (id, patch) => DataStore.update(id, patch),
        (done, total, s) => {
          els.geocodeProgress.textContent = `지오코딩 진행 중... ${done}/${total} (${s.supplierNameKR || s.supplierName})`;
          refresh();
        }
      );
      els.btnRunGeocode.disabled = false;
      const stillFailed = DataStore.getAll().filter(s => s.locationStatus === 'failed').length;
      els.geocodeProgress.textContent = `지오코딩 완료. 실패/수동확인 필요: ${stillFailed}건 (상세패널에서 위도/경도를 직접 입력할 수 있습니다)`;
    });
  }

  function wireRouteToggle() {
    els.toggleRoutes.addEventListener('change', () => {
      MapView.setRouteLinesVisible(els.toggleRoutes.checked);
    });
  }

  function renderFactoryHeader() {
    const el = document.getElementById('header-factory-list');
    el.innerHTML = FACTORIES.map(f =>
      `<span><strong style="color:${f.color}">★</strong> ${f.name} · ${f.address}</span>`
    ).join(' &nbsp;|&nbsp; ');
  }

  async function bootstrap() {
    renderFactoryHeader();
    MapView.init('map');
    MapView.addLegend((key, visible) => {
      Filters.toggleCategory(key, visible);
      const chip = els.categoryFilters.querySelector(`input[value="${key}"]`);
      if (chip) chip.checked = visible;
      refresh();
    });

    ListView.init('supplier-list', onListSelect, onCompareChange);
    Panel.init('side-panel', onSave);
    Dashboard.init('dashboard-stats');
    Panel.showEmpty();

    buildFactoryUsageFilterUI();
    buildCategoryFilterUI();
    buildDistanceFilterUI();
    wireSearch();
    wireCsv();
    wireGeocode();
    wireRouteToggle();

    try {
      await DataStore.load();
    } catch (e) {
      els.loadError.textContent = e.message;
      els.loadError.style.display = 'block';
      els.loadingOverlay.style.display = 'none';
      return;
    }

    MapView.addFactoryMarkers(FACTORIES);
    refresh();
    MapView.fitToAll(DataStore.getAll(), FACTORIES);

    els.loadingOverlay.style.display = 'none';
  }

  bootstrap();
})();
