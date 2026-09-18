/**
 * panel.js
 * 우측 상세정보 Side Panel: 조회 모드 / 수정 모드, 적재율 바 시각화.
 */

const Panel = (function () {
  const NA = '미입력';
  let container;
  let currentId = null;
  let onSaveCallback = null;

  function init(containerId, onSave) {
    container = document.getElementById(containerId);
    onSaveCallback = onSave;
  }

  function loadingRateBar(rate) {
    if (rate === null || rate === undefined) {
      return `<div class="rate-row"><div class="rate-track"></div><span class="rate-text">${NA}</span></div>`;
    }
    const pct = Math.max(0, Math.min(rate, 100));
    const overflow = rate > 100;
    return `
      <div class="rate-row">
        <div class="rate-track">
          <div class="rate-fill ${overflow ? 'overflow' : ''}" style="width:${pct}%"></div>
        </div>
        <span class="rate-text ${overflow ? 'overflow-text' : ''}">${rate}%${overflow ? ' (초과 적재)' : ''}</span>
      </div>`;
  }

  function deliveryDaysText(days) {
    if (!days || days.length === 0) return NA;
    const order = WEEKDAYS.map(w => w.key);
    const sorted = [...days].sort((a, b) => order.indexOf(a) - order.indexOf(b));
    return sorted.map(k => (WEEKDAYS.find(w => w.key === k) || {}).label || k).join(', ');
  }

  function val(v, suffix) {
    if (v === null || v === undefined || v === '') return NA;
    return suffix ? `${v}${suffix}` : String(v);
  }

  function factoryDistanceLabel(s) {
    const factory = FACTORIES.find(f => f.id === s.sourceFactory);
    return factory ? `${factory.nameKR} 거리` : '공장 거리';
  }

  function renderView(s) {
    const cat = CATEGORY_MAP[classifyCategory(s.materialDetail)] || CATEGORY_MAP.etc;
    const verifiedBadge = s.locationVerified
      ? '<span class="badge verified">● 확인 완료</span>'
      : '<span class="badge unverified">○ 미확인</span>';
    const usage = FACTORY_USAGE_LABEL[s.factoryUsage];
    const usageBadge = usage ? `<span class="badge factory-usage" style="border-color:${usage.color};color:${usage.color}">${usage.label}</span>` : '';
    const locTypeLabel = LOCATION_TYPE_LABEL[s.locationType] || LOCATION_TYPE_LABEL.unknown;
    const precisionLabels = {
      industrial_zone: '산업단지 근사 위치',
      ward_district: '동/구 단위 근사 위치',
      province_level: '성/시 단위 근사(부정확 가능)'
    };
    const precisionBadge = precisionLabels[s.geocodePrecision]
      ? `<span class="badge precision">⚠ ${precisionLabels[s.geocodePrecision]}</span>` : '';
    const noGeoBadge = (s.latitude == null || s.longitude == null)
      ? `<span class="badge nogeo">좌표 미확보</span>` : '';

    container.innerHTML = `
      <div class="panel-header">
        <span class="panel-cat-dot" style="background:${cat.color}"></span>
        <div class="panel-title">
          <div class="panel-name-kr">${s.supplierNameKR || NA}</div>
          <div class="panel-name-vn">${s.supplierName}</div>
        </div>
        <button class="btn-edit" id="btn-edit">수정</button>
      </div>
      <div class="panel-badges">${usageBadge}${verifiedBadge}<span class="badge loctype">${locTypeLabel}</span>${precisionBadge}${noGeoBadge}</div>

      <section class="panel-section">
        <h4>공급업체 정보</h4>
        <dl>
          <dt>업체명</dt><dd>${s.supplierName}</dd>
          <dt>업체명 한글</dt><dd>${val(s.supplierNameKR)}</dd>
          <dt>주소</dt><dd>${s.address}</dd>
          <dt>${factoryDistanceLabel(s)}</dt><dd>${formatDistanceKm(s.distanceKm) ?? NA}</dd>
        </dl>
      </section>

      <section class="panel-section">
        <h4>공급 자재</h4>
        <dl>
          <dt>자재 카테고리</dt><dd>${val(s.materialCategory)}</dd>
          <dt>공급 자재 상세</dt><dd>${val(s.materialDetail)}</dd>
        </dl>
      </section>

      <section class="panel-section" id="route-comparison-section" style="display:none">
        <h4>공장별 실제 도로 경로</h4>
        <dl id="route-comparison-list"></dl>
      </section>

      <section class="panel-section">
        <h4>납품 정보</h4>
        <dl>
          <dt>MOQ</dt><dd>${val(s.moq)}</dd>
          <dt>납품단위</dt><dd>${val(s.deliveryUnit)}</dd>
          <dt>차량규격</dt><dd>${val(s.vehicleType)}${s.vehicleCBM ? ` (${s.vehicleCBM} CBM)` : ''}</dd>
          <dt>납품횟수/주</dt><dd>${s.deliveryFrequencyPerWeek != null ? '주 ' + s.deliveryFrequencyPerWeek + '회' : NA}</dd>
          <dt>월 납품요일</dt><dd>${deliveryDaysText(s.deliveryDays)}</dd>
          <dt>적재율</dt><dd>${loadingRateBar(s.loadingRate)}</dd>
        </dl>
      </section>

      <section class="panel-section">
        <h4>기타</h4>
        <dl>
          <dt>비고</dt><dd>${val(s.notes)}</dd>
        </dl>
      </section>
    `;
    document.getElementById('btn-edit').addEventListener('click', () => renderEdit(s));
  }

  function weekdayCheckboxes(selected) {
    const sel = selected || [];
    return WEEKDAYS.map(w => `
      <label class="chip-checkbox">
        <input type="checkbox" name="deliveryDays" value="${w.key}" ${sel.includes(w.key) ? 'checked' : ''}>
        <span>${w.label}</span>
      </label>`).join('');
  }

  function renderEdit(s) {
    container.innerHTML = `
      <div class="panel-header edit-header">
        <span class="panel-cat-dot" style="background:${(CATEGORY_MAP[classifyCategory(s.materialDetail)] || CATEGORY_MAP.etc).color}"></span>
        <div class="panel-title">
          <div class="panel-name-kr">${s.supplierNameKR || NA}</div>
          <div class="panel-name-vn">${s.supplierName}</div>
        </div>
      </div>
      <form id="edit-form" class="edit-form">
        <label>업체명
          <input type="text" name="supplierName" value="${escapeHtml(s.supplierName || '')}">
        </label>
        <label>업체명 한글
          <input type="text" name="supplierNameKR" value="${escapeHtml(s.supplierNameKR || '')}">
        </label>
        <p class="field-hint">업체명은 원본 데이터(엑셀)와 다르게 바뀔 수 있으니, 오타 수정이나 상호 변경 등 실제로 필요한 경우에만 수정하세요.</p>
        <label>주소
          <textarea name="address" rows="2">${escapeHtml(s.address || '')}</textarea>
        </label>
        <label>공장 사용 구분
          <select name="factoryUsage">
            ${Object.keys(FACTORY_USAGE_LABEL).map(key => `<option value="${key}" ${s.factoryUsage === key ? 'selected' : ''}>${FACTORY_USAGE_LABEL[key].label}</option>`).join('')}
          </select>
        </label>
        <p class="field-hint">이 업체가 실제로 어느 공장에 납품하는지 나타냅니다. 원본 엑셀 대사 결과와 다르게 확인된 경우에만 수정하세요.</p>
        <label>자재 카테고리
          <input type="text" name="materialCategory" value="${escapeHtml(s.materialCategory || '')}">
        </label>
        <label>공급 자재 상세
          <input type="text" name="materialDetail" value="${escapeHtml(s.materialDetail || '')}">
        </label>
        <label>MOQ
          <input type="text" name="moq" value="${escapeHtml(s.moq ?? '')}">
        </label>
        <label>납품단위
          <input type="text" name="deliveryUnit" value="${escapeHtml(s.deliveryUnit ?? '')}">
        </label>
        <label>차량규격
          <input type="text" name="vehicleType" value="${escapeHtml(s.vehicleType ?? '')}" placeholder="예: 5T, Container 20FT">
        </label>
        <label>차량 CBM
          <input type="number" step="0.1" name="vehicleCBM" value="${s.vehicleCBM ?? ''}">
        </label>
        <label>납품횟수/주
          <input type="number" min="0" name="deliveryFrequencyPerWeek" value="${s.deliveryFrequencyPerWeek ?? ''}">
        </label>
        <label>월 납품요일
          <div class="weekday-group">${weekdayCheckboxes(s.deliveryDays)}</div>
        </label>
        <label>적재율(%)
          <input type="number" min="0" name="loadingRate" value="${s.loadingRate ?? ''}">
        </label>
        <div class="coord-fields">
          <label>위도(Latitude)
            <input type="number" step="0.000001" name="latitude" value="${s.latitude ?? ''}">
          </label>
          <label>경도(Longitude)
            <input type="number" step="0.000001" name="longitude" value="${s.longitude ?? ''}">
          </label>
        </div>
        <p class="field-hint">지도 좌표가 없거나 부정확한 경우, 구글맵 등에서 확인한 위도/경도를 직접 입력할 수 있습니다.</p>
        <label class="checkbox-inline">
          <input type="checkbox" name="locationVerified" ${s.locationVerified ? 'checked' : ''}>
          위치 확인 완료(구매팀 검증)
        </label>
        <label>비고
          <textarea name="notes" rows="3">${escapeHtml(s.notes || '')}</textarea>
        </label>
        <div class="edit-actions">
          <button type="submit" class="btn-save">저장</button>
          <button type="button" class="btn-cancel" id="btn-cancel">취소</button>
        </div>
      </form>
    `;

    document.getElementById('btn-cancel').addEventListener('click', () => renderView(DataStore.getById(s.id)));
    document.getElementById('edit-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const nameVal = fd.get('supplierName').trim();
      const nameKrVal = fd.get('supplierNameKR').trim();
      const patch = {
        supplierName: nameVal || s.supplierName,
        supplierNameKR: nameKrVal || s.supplierNameKR,
        address: fd.get('address'),
        factoryUsage: fd.get('factoryUsage'),
        materialCategory: fd.get('materialCategory'),
        materialDetail: fd.get('materialDetail'),
        moq: fd.get('moq') || null,
        deliveryUnit: fd.get('deliveryUnit') || null,
        vehicleType: fd.get('vehicleType') || null,
        vehicleCBM: fd.get('vehicleCBM') ? Number(fd.get('vehicleCBM')) : null,
        deliveryFrequencyPerWeek: fd.get('deliveryFrequencyPerWeek') ? Number(fd.get('deliveryFrequencyPerWeek')) : null,
        deliveryDays: fd.getAll('deliveryDays'),
        loadingRate: fd.get('loadingRate') ? Number(fd.get('loadingRate')) : null,
        latitude: fd.get('latitude') ? Number(fd.get('latitude')) : null,
        longitude: fd.get('longitude') ? Number(fd.get('longitude')) : null,
        locationVerified: fd.get('locationVerified') === 'on',
        notes: fd.get('notes') || ''
      };
      const coordChanged = patch.latitude !== s.latitude || patch.longitude !== s.longitude;
      if (coordChanged && patch.latitude != null && patch.longitude != null) {
        patch.locationStatus = 'manual';
      }
      onSaveCallback(s.id, patch);
    });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function show(supplier) {
    currentId = supplier.id;
    renderView(supplier);
  }

  function showEmpty() {
    currentId = null;
    container.innerHTML = `<div class="panel-empty">지도의 마커나 좌측 목록에서 업체를 선택하면<br>상세 정보가 여기에 표시됩니다.</div>`;
  }

  function getCurrentId() { return currentId; }

  function renderRouteComparison(factories) {
    const section = document.getElementById('route-comparison-section');
    const list = document.getElementById('route-comparison-list');
    if (!section || !list) return;
    section.style.display = '';
    list.innerHTML = factories.map(f => `
      <dt><span class="route-factory-dot" style="background:${f.color}"></span>${f.nameKR}</dt>
      <dd id="route-result-${f.id}">조회 중...</dd>
    `).join('');
  }

  function setRouteResult(factory, result) {
    const dd = document.getElementById(`route-result-${factory.id}`);
    if (!dd) return;
    if (!result) {
      dd.textContent = '경로 조회 실패 (지도에 표시되지 않음)';
    } else if (result.isStraight) {
      dd.textContent = `약 ${result.distanceKm}km (직선거리 · 1000km 이상이라 도로경로 대신 표시)`;
    } else {
      dd.textContent = `약 ${result.distanceKm}km · 차량 약 ${result.durationMin}분`;
    }
  }

  return { init, show, showEmpty, getCurrentId, renderRouteComparison, setRouteResult };
})();
