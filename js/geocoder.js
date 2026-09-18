/**
 * geocoder.js
 * OpenStreetMap Nominatim을 이용한 브라우저 측 지오코딩(요구사항 24).
 *
 * - 페이지 로딩 시 자동으로 88개를 조회하지 않는다. 사용자가 버튼을 눌러야 실행된다.
 * - Nominatim 사용 정책에 따라 요청 간 최소 1.1초 간격을 둔다.
 * - 성공하면 locationStatus를 'geocoded'로, 실패하면 'failed'로 표시하고 좌표는 임의로
 *   만들어내지 않는다(요구사항 22, 34).
 * - API Key가 필요 없는 공개 서비스이므로 별도의 키 관리가 필요 없다.
 */

const Geocoder = (function () {
  const ENDPOINT = 'https://nominatim.openstreetmap.org/search';
  const DELAY_MS = 1100;

  function cleanQuery(address) {
    let q = address.replace(/\[[^\]]*\]/g, '');
    q = q.replace(/\(MST[^)]*\)/gi, '');
    q = q.replace(/\s+/g, ' ').trim().replace(/[,.\s]+$/, '');
    if (!/viet ?nam|việt nam/i.test(q)) q += ', Việt Nam';
    return q;
  }

  async function geocodeOne(address) {
    const q = cleanQuery(address);
    const url = `${ENDPOINT}?format=json&limit=1&countrycodes=vn&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'vi' } });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (data && data.length > 0) {
      return { latitude: Number(data[0].lat), longitude: Number(data[0].lon) };
    }
    return null;
  }

  function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

  /**
   * targets: 지오코딩이 필요한 supplier 배열
   * onProgress(done, total, supplier, result)
   * onEach(id, patch) — 결과가 나올 때마다 즉시 반영할 콜백 (DataStore.update 등)
   */
  async function runBatch(targets, onEach, onProgress) {
    let done = 0;
    for (const s of targets) {
      let patch;
      try {
        const result = await geocodeOne(s.address);
        patch = result
          ? { latitude: result.latitude, longitude: result.longitude, locationStatus: 'geocoded' }
          : { locationStatus: 'failed' };
      } catch (e) {
        patch = { locationStatus: 'failed' };
      }
      onEach(s.id, patch);
      done++;
      onProgress && onProgress(done, targets.length, s, patch);
      if (done < targets.length) await sleep(DELAY_MS);
    }
  }

  return { runBatch, geocodeOne, cleanQuery };
})();
