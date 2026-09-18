/**
 * listView.js
 * 좌측 공급업체 리스트: 번호/업체명/공급자재/거리/납품횟수/적재율 표시, 클릭 시 선택 이벤트 발생.
 * 각 행의 "비교" 체크박스로 최대 3개 업체를 동시에 선택해 이동경로를 비교할 수 있다.
 */

const ListView = (function () {
  const MAX_COMPARE = 3;

  let container;
  let onSelectCallback = null;
  let onCompareChangeCallback = null;
  let selectedId = null;
  let compareIds = new Set();

  function init(containerId, onSelect, onCompareChange) {
    container = document.getElementById(containerId);
    onSelectCallback = onSelect;
    onCompareChangeCallback = onCompareChange;
  }

  function row(s) {
    const cat = CATEGORY_MAP[classifyCategory(s.materialDetail)] || CATEGORY_MAP.etc;
    const freq = s.deliveryFrequencyPerWeek != null ? `주 ${s.deliveryFrequencyPerWeek}회` : '-';
    const rate = s.loadingRate != null ? `${s.loadingRate}%` : '-';
    let geoBadge = '';
    if (s.latitude == null || s.longitude == null) {
      geoBadge = '<span class="list-nogeo" title="지도 좌표 없음">좌표없음</span>';
    } else if (s.geocodePrecision && s.geocodePrecision !== 'exact') {
      geoBadge = '<span class="list-approx" title="근사 위치(동/구·성 단위)">근사위치</span>';
    }
    const hasGeo = s.latitude != null && s.longitude != null;
    const compareChecked = compareIds.has(s.id);
    return `
      <li class="list-row ${s.id === selectedId ? 'selected' : ''}" data-id="${s.id}">
        <label class="list-compare-check" title="이동경로 비교에 추가 (최대 ${MAX_COMPARE}개)">
          <input type="checkbox" class="compare-checkbox" data-id="${s.id}"
                 ${compareChecked ? 'checked' : ''} ${hasGeo ? '' : 'disabled'}>
        </label>
        <span class="list-idx">${s.id}</span>
        <span class="list-dot" style="background:${cat.color}"></span>
        <div class="list-main">
          <div class="list-name">${s.supplierNameKR || s.supplierName} ${geoBadge}</div>
          <div class="list-sub">${s.materialDetail || s.materialCategory || ''}</div>
        </div>
        <div class="list-meta">
          <span>약 ${s.distanceKm ?? '-'}km</span>
          <span>${freq}</span>
          <span>${rate}</span>
        </div>
      </li>`;
  }

  function render(suppliers) {
    if (suppliers.length === 0) {
      container.innerHTML = `<li class="list-empty">조건에 맞는 공급업체가 없습니다.</li>`;
      return;
    }
    container.innerHTML = suppliers.map(row).join('');

    container.querySelectorAll('.list-row').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('.list-compare-check')) return;
        const id = Number(el.dataset.id);
        setSelected(id);
        onSelectCallback && onSelectCallback(id);
      });
    });

    container.querySelectorAll('.compare-checkbox').forEach(cb => {
      cb.addEventListener('click', (e) => e.stopPropagation());
      cb.addEventListener('change', () => {
        const id = Number(cb.dataset.id);
        if (cb.checked) {
          if (compareIds.size >= MAX_COMPARE) {
            cb.checked = false;
            alert(`이동경로 비교는 최대 ${MAX_COMPARE}개 업체까지 가능합니다.`);
            return;
          }
          compareIds.add(id);
        } else {
          compareIds.delete(id);
        }
        onCompareChangeCallback && onCompareChangeCallback(Array.from(compareIds));
      });
    });
  }

  function setSelected(id) {
    selectedId = id;
    container.querySelectorAll('.list-row').forEach(el => {
      el.classList.toggle('selected', Number(el.dataset.id) === id);
    });
  }

  function getCompareIds() {
    return Array.from(compareIds);
  }

  function clearCompare() {
    compareIds = new Set();
  }

  return { init, render, setSelected, getCompareIds, clearCompare };
})();
