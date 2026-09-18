/**
 * csvIO.js
 * 요구사항 18: 구매팀 Excel/CSV 연동.
 * 컬럼 순서: ID, Supplier Name, Supplier Name KR, Address, Distance KM, Material Category,
 *          Material Detail, Latitude, Longitude, MOQ, Delivery Unit, Vehicle Type, Vehicle CBM,
 *          Delivery Frequency Per Week, Delivery Days, Loading Rate, Notes
 * Delivery Days는 CSV 콤마 충돌을 피하기 위해 'mon;wed;fri' 형태(세미콜론)로 저장한다.
 */

const CSV_COLUMNS = [
  'ID', 'Supplier Name', 'Supplier Name KR', 'Address', 'Factory Usage', 'Distance KM',
  'Material Category', 'Material Detail', 'Latitude', 'Longitude',
  'MOQ', 'Delivery Unit', 'Vehicle Type', 'Vehicle CBM',
  'Delivery Frequency Per Week', 'Delivery Days', 'Loading Rate', 'Notes'
];

function csvEscape(value) {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function exportSuppliersToCsv(suppliers) {
  const lines = [CSV_COLUMNS.join(',')];
  for (const s of suppliers) {
    const row = [
      s.id, s.supplierName, s.supplierNameKR, s.address, s.factoryUsage, s.distanceKm,
      s.materialCategory, s.materialDetail, s.latitude, s.longitude,
      s.moq, s.deliveryUnit, s.vehicleType, s.vehicleCBM,
      s.deliveryFrequencyPerWeek, (s.deliveryDays || []).join(';'), s.loadingRate, s.notes
    ].map(csvEscape);
    lines.push(row.join(','));
  }
  // Excel 한글 깨짐 방지를 위한 UTF-8 BOM
  return '﻿' + lines.join('\r\n');
}

function downloadCsv(suppliers, filename) {
  const csv = exportSuppliersToCsv(suppliers);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `suppliers_export_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** 따옴표로 감싼 필드/이스케이프된 따옴표를 지원하는 간단한 CSV 파서 */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  const s = text.replace(/^﻿/, '');

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') { field += '"'; i++; }
        else { inQuotes = false; }
      } else {
        field += c;
      }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\r') { /* skip */ }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else field += c;
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter(r => r.length > 1 || (r.length === 1 && r[0] !== ''));
}

function toNumberOrNull(v) {
  if (v === undefined || v === null || String(v).trim() === '') return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

/**
 * 업로드된 CSV 텍스트를 파싱해 { id: patch } 형태로 반환한다.
 * ID 컬럼으로 기존 업체와 매칭해 갱신하며, 신규 업체 추가/컬럼 누락 처리는
 * 향후 확장 지점으로 남겨둔다(요구사항 30-4 신규 업체 추가).
 */
function parseSuppliersCsv(text) {
  const rows = parseCsv(text);
  if (rows.length < 2) return {};
  const header = rows[0].map(h => h.trim());
  const idx = name => header.indexOf(name);

  const patches = {};
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const id = toNumberOrNull(row[idx('ID')]);
    if (id === null) continue;
    const patch = {};
    const setIf = (col, key, transform) => {
      const i = idx(col);
      if (i === -1) return;
      const raw = row[i];
      patch[key] = transform ? transform(raw) : raw;
    };
    setIf('Address', 'address');
    setIf('Factory Usage', 'factoryUsage');
    setIf('Material Category', 'materialCategory');
    setIf('Material Detail', 'materialDetail');
    setIf('Latitude', 'latitude', toNumberOrNull);
    setIf('Longitude', 'longitude', toNumberOrNull);
    setIf('MOQ', 'moq');
    setIf('Delivery Unit', 'deliveryUnit');
    setIf('Vehicle Type', 'vehicleType');
    setIf('Vehicle CBM', 'vehicleCBM', toNumberOrNull);
    setIf('Delivery Frequency Per Week', 'deliveryFrequencyPerWeek', toNumberOrNull);
    setIf('Delivery Days', 'deliveryDays', v => (v ? v.split(';').map(d => d.trim()).filter(Boolean) : []));
    setIf('Loading Rate', 'loadingRate', toNumberOrNull);
    setIf('Notes', 'notes');
    patches[id] = patch;
  }
  return patches;
}
