/* 팔도비나 푸토공장 식대 관리 — 데이터는 localStorage에 저장 */
(function () {
  'use strict';

  const STORE_KEY = 'paldo-meal-expense-v1';
  const COLS = ['lunch', 'coffee', 'etc'];
  const COL_LABEL = { lunch: '점심', coffee: '커피', etc: '기타(간식)' };
  const DOW = ['일', '월', '화', '수', '목', '금', '토'];
  const ACCOUNT_NO = '700-036-006516';

  // ---------- 상태 ----------
  let state = load() || seed();

  function seed() {
    return {
      nextId: 5,
      members: [
        { id: 1, name: '김병진', amount: 4000000 },
        { id: 2, name: '김태동', amount: 2000000 },
        { id: 3, name: '김재명', amount: 2000000 },
        { id: 4, name: '유태연', amount: 2000000 }
      ],
      months: { '2026-11': newMonth(10732990) },
      current: '2026-11'
    };
  }
  function newMonth(carryManual) {
    return { carryManual: carryManual == null ? null : carryManual, paid: {}, days: {}, memos: [] };
  }
  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (!s || !Array.isArray(s.members) || !s.months) return null;
      return s;
    } catch (e) { return null; }
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
    catch (e) { toast('브라우저 저장소에 저장하지 못했습니다', true); }
  }

  // ---------- 유틸 ----------
  const $ = (id) => document.getElementById(id);
  const fmt = (n) => Math.round(n || 0).toLocaleString('en-US');
  const pad = (n) => String(n).padStart(2, '0');
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  // 빈 값 → 0, 숫자(콤마 허용) → 정수, 그 외(문자·음수·소수) → null
  function parseAmount(str) {
    const s = String(str == null ? '' : str).replace(/[,\s]/g, '');
    if (s === '') return 0;
    if (!/^\d+$/.test(s)) return null;
    const n = Number(s);
    return n > 1e13 ? null : n;
  }
  // 입력 중 숫자·콤마 외 문자를 즉시 제거(차단)
  function sanitize(input) {
    const cleaned = input.value.replace(/[^\d,]/g, '');
    if (cleaned !== input.value) {
      input.value = cleaned;
      toast('숫자만 입력할 수 있습니다 (문자·음수 불가)', true);
    }
  }
  function ym(key) { const [y, m] = key.split('-').map(Number); return { y, m }; }
  function sheetName(key) { const { y, m } = ym(key); return `${String(y).slice(2)}.${m}월`; }
  function daysIn(key) { const { y, m } = ym(key); return new Date(y, m, 0).getDate(); }
  function shiftKey(key, d) { const { y, m } = ym(key); const t = new Date(y, m - 1 + d, 1); return `${t.getFullYear()}-${pad(t.getMonth() + 1)}`; }
  function sortedKeys() { return Object.keys(state.months).sort(); }
  function dayRec(month, d) { return month.days[d] || { lunch: 0, coffee: 0, etc: 0, memo: {} }; }

  // ---------- 계산 ----------
  // 전월 시트가 있으면 전월 월말 잔액이 이월금, 없으면 직접 입력값
  function carryOf(key) {
    const prev = shiftKey(key, -1);
    if (state.months[prev]) return endBalance(prev);
    return state.months[key].carryManual || 0;
  }
  function feeOf(key) {
    const paid = state.months[key].paid;
    return Object.keys(paid).reduce((s, id) => s + (paid[id].amount || 0), 0);
  }
  function totalsOf(key) {
    const mo = state.months[key];
    const t = { lunch: 0, coffee: 0, etc: 0 };
    Object.keys(mo.days).forEach((d) => { COLS.forEach((c) => { t[c] += mo.days[d][c] || 0; }); });
    t.total = t.lunch + t.coffee + t.etc;
    return t;
  }
  function endBalance(key) { return carryOf(key) + feeOf(key) - totalsOf(key).total; }
  function roster(key) {
    const mo = state.months[key];
    const rows = state.members.map((m) => ({ id: m.id, name: m.name, amount: m.amount, gone: false }));
    Object.keys(mo.paid).forEach((id) => {
      if (!state.members.some((m) => String(m.id) === id)) {
        rows.push({ id: Number(id), name: mo.paid[id].name, amount: mo.paid[id].amount, gone: true });
      }
    });
    return rows;
  }

  // ---------- 렌더 ----------
  function render() {
    if (!state.months[state.current]) state.current = sortedKeys().slice(-1)[0];
    renderTabs();
    if (!state.current) { renderEmpty(); return; }
    $('carryBox').innerHTML = '';
    renderDays();
    renderMembers();
    renderMemos();
    updateComputed();
  }

  function renderEmpty() {
    $('dayBody').innerHTML = '<tr><td colspan="6" class="muted" style="text-align:center;padding:24px">"새 달 만들기" 또는 "엑셀 가져오기"로 시작하세요</td></tr>';
  }

  function renderTabs() {
    $('tabs').innerHTML = sortedKeys().map((k) =>
      `<button class="tab${k === state.current ? ' active' : ''}" data-key="${k}">${sheetName(k)}</button>`).join('');
    const act = $('tabs').querySelector('.active');
    if (act) act.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  function renderDays() {
    const key = state.current;
    const mo = state.months[key];
    const { y, m } = ym(key);
    const now = new Date();
    const isNowMonth = now.getFullYear() === y && now.getMonth() + 1 === m;
    $('sheetTitle').textContent = `${sheetName(key)} 일별 지출`;
    let html = '';
    for (let d = 1; d <= daysIn(key); d++) {
      const w = new Date(y, m - 1, d).getDay();
      const rec = dayRec(mo, d);
      const cls = [(w === 0 || w === 6) ? 'weekend' : '', isNowMonth && now.getDate() === d ? 'today' : ''].join(' ').trim();
      html += `<tr class="${cls}" data-day="${d}">
        <td class="date">${m}/${d}</td>
        <td class="dow${w === 6 ? ' sat' : w === 0 ? ' sun' : ''}">${DOW[w]}</td>
        ${COLS.map((c) => {
          const memo = (rec.memo && rec.memo[c]) || '';
          return `<td><div class="cell${memo ? ' has-memo' : ''}" title="${esc(memo)}">
            <input type="text" inputmode="numeric" autocomplete="off" data-col="${c}" value="${rec[c] ? fmt(rec[c]) : ''}" aria-label="${m}/${d} ${COL_LABEL[c]}">
            <button class="memo-btn" data-memo="${c}" tabindex="-1" title="메모${memo ? ': ' + esc(memo) : ''}">✎</button>
          </div></td>`;
        }).join('')}
        <td class="num bal c-green" data-bal="${d}"></td>
      </tr>`;
    }
    $('dayBody').innerHTML = html;
  }

  function renderMembers() {
    const key = state.current;
    const mo = state.months[key];
    $('memberBody').innerHTML = roster(key).map((r) => {
      const paid = !!mo.paid[r.id];
      const amt = paid ? mo.paid[r.id].amount : r.amount;
      return `<tr data-id="${r.id}">
        <td class="chk"><input type="checkbox" class="paid-chk" ${paid ? 'checked' : ''} aria-label="${esc(r.name)} 납부"></td>
        <td><input type="text" class="m-name" value="${esc(r.name)}" ${r.gone ? 'disabled' : ''}></td>
        <td style="width:118px"><input type="text" class="m-amt amt" inputmode="numeric" value="${fmt(amt)}" ${r.gone ? 'disabled' : ''}></td>
        <td class="st">${r.gone ? '<span class="badge gone">삭제됨</span>' : paid ? '<span class="badge paid">납부</span>' : '<span class="badge unpaid">미납</span>'}</td>
        <td class="del">${r.gone ? '' : '<button class="icon-btn m-del" title="인원 삭제">✕</button>'}</td>
      </tr>`;
    }).join('') || '<tr><td class="muted">등록된 인원이 없습니다</td></tr>';
  }

  function renderMemos() {
    const mo = state.months[state.current];
    $('memoBody').innerHTML = mo.memos.map((r, i) => `<tr data-i="${i}">
        <td><input type="text" class="memo-label" value="${esc(r.label)}" placeholder="내용"></td>
        <td style="width:120px"><input type="text" class="memo-amt amt" inputmode="numeric" value="${r.amount ? fmt(r.amount) : ''}" placeholder="0"></td>
        <td style="width:26px;text-align:center"><button class="icon-btn memo-del" title="삭제">✕</button></td>
      </tr>`).join('') || '<tr><td class="muted" style="padding:6px 2px">"+ 줄 추가"로 임시 계산을 적어두세요</td></tr>';
  }

  // 잔액/합계/요약 카드만 갱신 (입력 중 포커스 유지)
  function updateComputed() {
    const key = state.current;
    if (!key) return;
    const mo = state.months[key];
    const carry = carryOf(key);
    const fee = feeOf(key);
    const start = carry + fee;
    let bal = start;
    for (let d = 1; d <= daysIn(key); d++) {
      const r = dayRec(mo, d);
      bal = bal - (r.lunch || 0) - (r.coffee || 0) - (r.etc || 0);
      const cell = document.querySelector(`[data-bal="${d}"]`);
      if (cell) {
        cell.textContent = fmt(bal);
        cell.classList.toggle('c-green', bal >= 0);
        cell.classList.toggle('c-red', bal < 0);
      }
    }
    const t = totalsOf(key);
    $('tLunch').textContent = fmt(t.lunch);
    $('tCoffee').textContent = fmt(t.coffee);
    $('tEtc').textContent = fmt(t.etc);
    $('tTotal').textContent = fmt(t.total);
    $('tBal').textContent = fmt(bal);

    // 이월금 카드
    const prev = shiftKey(key, -1);
    const carryBox = $('carryBox');
    if (state.months[prev]) {
      carryBox.innerHTML = `<div class="value num">${fmt(carry)}<small>VND</small></div>`;
      $('carryTag').innerHTML = '<span class="tag">전월 자동</span>';
      let foot = `${sheetName(prev)} 월말 잔액`;
      if (mo.carryManual != null && mo.carryManual !== carry) {
        foot += ` · 엑셀 기록 ${fmt(mo.carryManual)} (차이 ${fmt(carry - mo.carryManual)})`;
      }
      $('carryFoot').textContent = foot;
    } else {
      const inp = carryBox.querySelector('input');
      if (!inp) carryBox.innerHTML = `<input type="text" class="carry-input" id="carryInput" inputmode="numeric" value="${fmt(carry)}">`;
      $('carryTag').innerHTML = '<span class="tag">직접 입력</span>';
      $('carryFoot').textContent = '첫 달은 이월금을 직접 입력';
    }

    // 회비/지출/잔액 카드
    const list = roster(key);
    const unpaid = list.filter((r) => !r.gone && !mo.paid[r.id]);
    $('sFee').innerHTML = `${fmt(fee)}<small>VND</small>`;
    $('sFeeFoot').innerHTML = unpaid.length ? `<span class="badge unpaid">미납 ${unpaid.length}명</span>` : list.length ? '<span class="badge paid">전원 납부</span>' : '';
    $('sSpend').innerHTML = `${fmt(t.total)}<small>VND</small>`;
    $('sStart').textContent = `시작 잔액 ${fmt(start)}`;
    $('sBal').innerHTML = `${fmt(bal)}<small>VND</small>`;
    $('sBal').classList.toggle('c-green', bal >= 0);
    $('sBal').classList.toggle('c-red', bal < 0);
    const headCount = list.length;
    const per = headCount ? t.total / headCount : 0;
    $('sPer').textContent = `1인당 사용액 ${fmt(per)} (${headCount}명)`;

    // 명단 하단
    $('feeSum').textContent = `회비 ${fmt(fee)}`;
    $('unpaidSummary').innerHTML = unpaid.length
      ? unpaid.map((r) => `<span class="badge unpaid" style="margin-left:3px">${esc(r.name)}</span>`).join('')
      : (list.length ? '<span class="badge paid">전원 납부</span>' : '');

    // 참고 지표
    const spendDays = Object.keys(mo.days).filter((d) => COLS.some((c) => mo.days[d][c] > 0)).length;
    const unpaidAmt = unpaid.reduce((s, r) => s + (r.amount || 0), 0);
    const kv = (k, v, cls) => `<div class="kv"><span class="k">${k}</span><span class="num ${cls || ''}">${v}</span></div>`;
    $('metrics').innerHTML =
      kv('인원수', `${headCount}명`) +
      kv('1인당 사용액 (총 지출 ÷ 인원)', fmt(per), 'c-red') +
      kv('지출 발생 일수', `${spendDays}일`) +
      kv('지출일 평균', fmt(spendDays ? t.total / spendDays : 0), 'c-red') +
      kv('점심 / 커피 / 기타 비중', t.total ? `${Math.round(t.lunch / t.total * 100)}% / ${Math.round(t.coffee / t.total * 100)}% / ${Math.round(t.etc / t.total * 100)}%` : '-') +
      kv('미납 회비 합계', fmt(unpaidAmt), unpaidAmt ? 'c-red' : '');

    $('memoSum').textContent = fmt(mo.memos.reduce((s, r) => s + (r.amount || 0), 0));
  }

  // ---------- 이벤트: 월 탭 / 툴바 ----------
  $('tabs').addEventListener('click', (e) => {
    const b = e.target.closest('.tab');
    if (!b) return;
    state.current = b.dataset.key;
    save(); render();
  });

  $('btnNewMonth').addEventListener('click', () => {
    const keys = sortedKeys();
    const now = new Date();
    const key = keys.length ? shiftKey(keys[keys.length - 1], 1) : `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
    state.months[key] = newMonth(null);
    state.current = key;
    save(); render();
    const prev = shiftKey(key, -1);
    toast(state.months[prev] ? `${sheetName(key)} 생성 · 이월금 ${fmt(carryOf(key))} (${sheetName(prev)} 월말 잔액)` : `${sheetName(key)} 생성`);
  });

  $('btnDelMonth').addEventListener('click', () => {
    const key = state.current;
    if (!key) return;
    if (!confirm(`${sheetName(key)} 데이터를 삭제할까요?\n(되돌릴 수 없습니다. 필요하면 먼저 엑셀로 내보내세요)`)) return;
    const keys = sortedKeys();
    const i = keys.indexOf(key);
    delete state.months[key];
    state.current = keys[i + 1] || keys[i - 1] || null;
    save(); render();
  });

  // ---------- 이벤트: 일별 지출 입력 ----------
  const dayBody = $('dayBody');
  dayBody.addEventListener('input', (e) => {
    const inp = e.target;
    if (!inp.dataset.col) return;
    sanitize(inp);
    const n = parseAmount(inp.value);
    inp.classList.toggle('invalid', n === null);
    if (n === null) return;
    setDay(Number(inp.closest('tr').dataset.day), inp.dataset.col, n);
    updateComputed();
  });
  dayBody.addEventListener('focusout', (e) => {
    const inp = e.target;
    if (!inp.dataset || !inp.dataset.col) return;
    const rec = dayRec(state.months[state.current], Number(inp.closest('tr').dataset.day));
    inp.classList.remove('invalid');
    inp.value = rec[inp.dataset.col] ? fmt(rec[inp.dataset.col]) : '';
  });
  dayBody.addEventListener('focusin', (e) => {
    if (e.target.dataset && e.target.dataset.col) e.target.select();
  });
  dayBody.addEventListener('keydown', (e) => {
    const inp = e.target;
    if (!inp.dataset.col) return;
    if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const tr = e.key === 'ArrowUp' ? inp.closest('tr').previousElementSibling : inp.closest('tr').nextElementSibling;
      if (tr) tr.querySelector(`input[data-col="${inp.dataset.col}"]`).focus();
      else inp.blur();
    }
  });
  dayBody.addEventListener('click', (e) => {
    const b = e.target.closest('.memo-btn');
    if (!b) return;
    openMemo(Number(b.closest('tr').dataset.day), b.dataset.memo);
  });

  function setDay(d, col, n, memoText) {
    const mo = state.months[state.current];
    const rec = mo.days[d] || { lunch: 0, coffee: 0, etc: 0, memo: {} };
    rec[col] = n;
    if (memoText !== undefined) {
      rec.memo = rec.memo || {};
      if (memoText) rec.memo[col] = memoText; else delete rec.memo[col];
    }
    const empty = COLS.every((c) => !rec[c]) && !Object.keys(rec.memo || {}).length;
    if (empty) delete mo.days[d]; else mo.days[d] = rec;
    save();
  }

  // ---------- 메모 모달 ----------
  let memoTarget = null;
  function openMemo(d, col) {
    const { m } = ym(state.current);
    const rec = dayRec(state.months[state.current], d);
    memoTarget = { d, col };
    $('memoTitle').textContent = `${m}/${d} ${COL_LABEL[col]}`;
    $('mAmt').value = rec[col] ? fmt(rec[col]) : '';
    $('mAmt').classList.remove('invalid');
    $('mText').value = (rec.memo && rec.memo[col]) || '';
    openModal('memoModal');
    setTimeout(() => $(rec[col] ? 'mText' : 'mAmt').focus(), 30);
  }
  $('mAmt').addEventListener('input', (e) => { sanitize(e.target); e.target.classList.toggle('invalid', parseAmount(e.target.value) === null); });
  function saveMemo() {
    const n = parseAmount($('mAmt').value);
    if (n === null) { $('mAmt').classList.add('invalid'); toast('금액은 0 이상 숫자만 입력하세요', true); return; }
    setDay(memoTarget.d, memoTarget.col, n, $('mText').value.trim());
    closeModals();
    renderDays(); updateComputed();
  }
  $('mSave').addEventListener('click', saveMemo);
  $('mText').addEventListener('keydown', (e) => { if (e.key === 'Enter') saveMemo(); });
  $('mAmt').addEventListener('keydown', (e) => { if (e.key === 'Enter') saveMemo(); });

  // ---------- 이월금 직접 입력 (첫 달) ----------
  $('carryBox').addEventListener('input', (e) => {
    if (e.target.id !== 'carryInput') return;
    sanitize(e.target);
    const n = parseAmount(e.target.value);
    e.target.style.borderColor = n === null ? 'var(--red)' : '';
    if (n === null) return;
    state.months[state.current].carryManual = n;
    save(); updateComputed();
  });
  $('carryBox').addEventListener('focusout', (e) => {
    if (e.target.id === 'carryInput') e.target.value = fmt(state.months[state.current].carryManual);
  });

  // ---------- 회비 명단 ----------
  const memberBody = $('memberBody');
  memberBody.addEventListener('change', (e) => {
    if (!e.target.classList.contains('paid-chk')) return;
    const id = Number(e.target.closest('tr').dataset.id);
    const mo = state.months[state.current];
    const mem = state.members.find((m) => m.id === id);
    if (e.target.checked) mo.paid[id] = { name: mem.name, amount: mem.amount };
    else delete mo.paid[id];
    save(); renderMembers(); updateComputed();
  });
  memberBody.addEventListener('input', (e) => {
    const tr = e.target.closest('tr');
    if (!tr) return;
    const id = Number(tr.dataset.id);
    const mem = state.members.find((m) => m.id === id);
    if (!mem) return;
    const paid = state.months[state.current].paid[id];
    if (e.target.classList.contains('m-name')) {
      mem.name = e.target.value.trim();
      if (paid) paid.name = mem.name;
    } else if (e.target.classList.contains('m-amt')) {
      sanitize(e.target);
      const n = parseAmount(e.target.value);
      e.target.classList.toggle('invalid', n === null);
      if (n === null) return;
      mem.amount = n;
      if (paid) paid.amount = n; // 이번 달 납부 금액도 함께 수정
    }
    save(); updateComputed();
  });
  memberBody.addEventListener('focusout', (e) => {
    if (!e.target.classList.contains('m-amt')) return;
    const id = Number(e.target.closest('tr').dataset.id);
    const mem = state.members.find((m) => m.id === id);
    if (mem) { e.target.value = fmt(mem.amount); e.target.classList.remove('invalid'); }
  });
  memberBody.addEventListener('click', (e) => {
    if (!e.target.classList.contains('m-del')) return;
    const id = Number(e.target.closest('tr').dataset.id);
    const mem = state.members.find((m) => m.id === id);
    if (!confirm(`${mem.name} 님을 명단에서 삭제할까요?\n(이미 납부 체크된 달의 회비 기록은 유지됩니다)`)) return;
    state.members = state.members.filter((m) => m.id !== id);
    save(); renderMembers(); updateComputed();
  });
  $('newAmt').addEventListener('input', (e) => sanitize(e.target));
  function addMember() {
    const name = $('newName').value.trim();
    const n = parseAmount($('newAmt').value);
    if (!name) { toast('이름을 입력하세요', true); $('newName').focus(); return; }
    if (n === null || n === 0) { toast('금액은 0보다 큰 숫자로 입력하세요', true); $('newAmt').focus(); return; }
    state.members.push({ id: state.nextId++, name, amount: n });
    $('newName').value = ''; $('newAmt').value = '';
    save(); renderMembers(); updateComputed();
  }
  $('btnAddMember').addEventListener('click', addMember);
  $('newAmt').addEventListener('keydown', (e) => { if (e.key === 'Enter') addMember(); });
  $('newName').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('newAmt').focus(); });

  // ---------- 메모 (임시 계산) ----------
  $('btnAddMemo').addEventListener('click', () => {
    if (!state.current) return;
    state.months[state.current].memos.push({ label: '', amount: 0 });
    save(); renderMemos(); updateComputed();
    const rows = $('memoBody').querySelectorAll('.memo-label');
    rows[rows.length - 1].focus();
  });
  const memoBody = $('memoBody');
  memoBody.addEventListener('input', (e) => {
    const tr = e.target.closest('tr');
    const r = state.months[state.current].memos[Number(tr.dataset.i)];
    if (e.target.classList.contains('memo-label')) r.label = e.target.value;
    else {
      sanitize(e.target);
      const n = parseAmount(e.target.value);
      e.target.classList.toggle('invalid', n === null);
      if (n === null) return;
      r.amount = n;
    }
    save(); updateComputed();
  });
  memoBody.addEventListener('focusout', (e) => {
    if (!e.target.classList.contains('memo-amt')) return;
    const r = state.months[state.current].memos[Number(e.target.closest('tr').dataset.i)];
    e.target.value = r.amount ? fmt(r.amount) : '';
    e.target.classList.remove('invalid');
  });
  memoBody.addEventListener('click', (e) => {
    if (!e.target.classList.contains('memo-del')) return;
    state.months[state.current].memos.splice(Number(e.target.closest('tr').dataset.i), 1);
    save(); renderMemos(); updateComputed();
  });

  // ---------- 계좌 / QR ----------
  $('btnCopy').addEventListener('click', () => {
    const text = ACCOUNT_NO.replace(/-/g, '');
    const done = () => toast(`계좌번호 복사됨: ${text}`);
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
    } else fallbackCopy(text, done);
  });
  function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { toast('복사 실패 — 직접 선택해 주세요', true); }
    ta.remove();
  }
  $('qrThumb').addEventListener('click', () => openModal('qrModal'));

  // ---------- 모달 공통 ----------
  function openModal(id) { $(id).classList.add('open'); }
  function closeModals() { document.querySelectorAll('.modal-bg.open').forEach((m) => m.classList.remove('open')); }
  document.querySelectorAll('.modal-bg').forEach((bg) => {
    bg.addEventListener('click', (e) => { if (e.target === bg || e.target.hasAttribute('data-close')) closeModals(); });
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModals(); });

  // ---------- 토스트 ----------
  let toastTimer = null;
  function toast(msg, isErr) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.toggle('err', !!isErr);
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  }

  // ---------- 단톡방 공유용 캡처 화면 (읽기 전용) ----------
  function renderShareCard() {
    const key = state.current;
    const mo = state.months[key];
    const { y, m } = ym(key);
    const carry = carryOf(key);
    const fee = feeOf(key);
    const t = totalsOf(key);
    const img = window.SHARE_IMG || { logo: 'assets/paldo-logo.png', qr: 'assets/vietqr.png' };
    const vnd = (n, cls) => `<span class="num ${cls || ''}">${fmt(n)}<span class="unit">VND</span></span>`;
    const amt = (n) => n ? `<td class="num c-red">${fmt(n)}</td>` : '<td class="dash">-</td>';

    const list = roster(key).filter((r) => !r.gone || mo.paid[r.id]);
    const paidCnt = list.filter((r) => mo.paid[r.id]).length;
    const members = list.map((r) => {
      const p = mo.paid[r.id];
      return `<tr><td>${esc(r.name)}</td><td class="num">${fmt(p ? p.amount : r.amount)}</td>
        <td class="b">${p ? '<span class="badge paid">납부</span>' : '<span class="badge unpaid">미납</span>'}</td></tr>`;
    }).join('');

    let bal = carry + fee;
    let rows = '';
    for (let d = 1; d <= daysIn(key); d++) {
      const r = dayRec(mo, d);
      bal = bal - (r.lunch || 0) - (r.coffee || 0) - (r.etc || 0);
      if (!(r.lunch > 0 || r.coffee > 0 || r.etc > 0)) continue;
      rows += `<tr><td class="d">${m}/${d}(${DOW[new Date(y, m - 1, d).getDay()]})</td>
        ${amt(r.lunch)}${amt(r.coffee)}${amt(r.etc)}<td class="num c-green">${fmt(bal)}</td></tr>`;
    }
    const usage = rows
      ? `<table class="sc-table">
          <thead><tr><th>날짜</th><th>점심</th><th>커피</th><th>기타</th><th>잔액</th></tr></thead>
          <tbody>${rows}</tbody>
          <tfoot><tr><td class="d">합계</td>
            <td class="num c-red">${fmt(t.lunch)}</td><td class="num c-red">${fmt(t.coffee)}</td>
            <td class="num c-red">${fmt(t.etc)}</td><td class="num c-green">${fmt(bal)}</td></tr></tfoot>
        </table>`
      : '<div class="sc-empty">이번 달 사용 내역이 아직 없습니다</div>';

    const now = new Date();
    $('shareCard').innerHTML = `
      <img class="sc-logo" src="${img.logo}" alt="paldo">
      <h2 class="sc-title">팔도비나 푸토공장 식대 · ${sheetName(key)}</h2>
      <div class="sc-grid">
        <div class="sc-box"><div class="k">이월금<span class="unit">VND</span></div><div class="v num">${fmt(carry)}</div></div>
        <div class="sc-box"><div class="k">회비<span class="unit">VND</span></div><div class="v num">${fmt(fee)}</div></div>
        <div class="sc-box"><div class="k">지출<span class="unit">VND</span></div><div class="v num c-red">${fmt(t.total)}</div></div>
      </div>
      <div class="sc-bal"><span class="k">현재 잔액</span><span class="v">${vnd(bal)}</span></div>

      <div class="sc-sec">
        <h3 class="sc-h">회비 납부 현황 <small>${paidCnt}/${list.length}명 납부</small></h3>
        <table class="sc-members"><tbody>${members}</tbody></table>
      </div>

      <div class="sc-sec">
        <h3 class="sc-h">사용 내역 <small>총 ${fmt(t.total)}</small></h3>
        ${usage}
      </div>

      <div class="sc-sec">
        <h3 class="sc-h">회비 입금 계좌</h3>
        <img class="sc-qr" src="${img.qr}" alt="VietQR">
        <div class="sc-acc">
          <div class="holder">YOO TAEYEON</div>
          <div class="no">${ACCOUNT_NO}</div>
          <div class="bank">신한베트남은행 (Shinhan Bank Vietnam)</div>
        </div>
      </div>

      <div class="sc-foot">기준일: ${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}</div>`;
  }

  $('btnShare').addEventListener('click', () => {
    if (!state.current) { toast('표시할 달이 없습니다', true); return; }
    renderShareCard();
    openModal('shareModal');
    $('shareModal').scrollTop = 0;
  });

  $('btnShareSave').addEventListener('click', () => {
    if (!window.html2canvas) { toast('이미지 저장 기능을 불러오지 못했습니다 — Win+Shift+S로 캡처해 주세요', true); return; }
    const btn = $('btnShareSave');
    btn.disabled = true;
    window.html2canvas($('shareCard'), { scale: 2, backgroundColor: '#ffffff', logging: false })
      .then((canvas) => new Promise((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject()), 'image/png')))
      .then((blob) => {
        const now = new Date();
        const a = document.createElement('a');
        a.download = `paldo_meal_${state.current}_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}.png`; // 한글 파일명은 일부 브라우저에서 무시됨
        a.href = URL.createObjectURL(blob);
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        toast('이미지로 저장했습니다');
      })
      .catch(() => toast('이미지 저장 실패 — Win+Shift+S로 캡처해 주세요', true))
      .then(() => { btn.disabled = false; });
  });

  // ---------- 엑셀 내보내기 ----------
  // 시트 구조: B3 이월금 / B4 회비 / B5 시작 잔액, 7행 헤더(날짜|요일|점심|커피|기타|잔액|비고), 8행부터 1일~말일
  const HEAD_ROW = 7;
  const FIRST = 8;
  function excelSerial(y, m, d) { return (Date.UTC(y, m - 1, d) - Date.UTC(1899, 11, 30)) / 86400000; }

  function buildSheet(key, exported) {
    const XL = window.XLSX;
    const ws = {};
    const mo = state.months[key];
    const { y, m } = ym(key);
    const n = daysIn(key);
    const last = FIRST + n - 1;
    const set = (addr, cell) => { ws[addr] = cell; };
    const s = (addr, v) => set(addr, { t: 's', v });
    const num = (addr, v, f) => set(addr, f ? { t: 'n', v, f, z: '#,##0' } : { t: 'n', v, z: '#,##0' });

    const carry = carryOf(key);
    const fee = feeOf(key);
    const start = carry + fee;
    const prev = shiftKey(key, -1);

    s('A1', `팔도비나 푸토공장 식대 관리 - ${sheetName(key)}`);
    s('A3', '이월금');
    if (exported.includes(prev)) num('B3', carry, `'${sheetName(prev)}'!F${FIRST + daysIn(prev) - 1}`);
    else num('B3', carry);

    // 회비 명단 (I~K)
    const list = roster(key);
    ['이름', '회비', '납부'].forEach((h, i) => s(String.fromCharCode(73 + i) + HEAD_ROW, h));
    list.forEach((r, i) => {
      const row = FIRST + i;
      const p = mo.paid[r.id];
      s('I' + row, r.name);
      num('J' + row, p ? p.amount : r.amount);
      s('K' + row, p ? 'O' : '');
    });
    const mLast = Math.max(FIRST, FIRST + list.length - 1);
    s('A4', '회비');
    num('B4', fee, `SUMIF(K${FIRST}:K${mLast},"O",J${FIRST}:J${mLast})`);
    s('A5', '시작 잔액');
    num('B5', start, 'B3+B4');

    ['날짜', '요일', '점심', '커피', '기타', '잔액', '비고'].forEach((h, i) => s(String.fromCharCode(65 + i) + HEAD_ROW, h));
    let bal = start;
    for (let d = 1; d <= n; d++) {
      const row = FIRST + d - 1;
      const rec = dayRec(mo, d);
      set('A' + row, { t: 'n', v: excelSerial(y, m, d), z: 'm/d' });
      s('B' + row, DOW[new Date(y, m - 1, d).getDay()]);
      if (rec.lunch) num('C' + row, rec.lunch);
      if (rec.coffee) num('D' + row, rec.coffee);
      if (rec.etc) num('E' + row, rec.etc);
      bal = bal - rec.lunch - rec.coffee - rec.etc;
      num('F' + row, bal, `${d === 1 ? 'B5' : 'F' + (row - 1)}-C${row}-D${row}-E${row}`);
      const memo = rec.memo || {};
      const note = COLS.filter((c) => memo[c]).map((c) => `${COL_LABEL[c]}: ${memo[c]}`).join(' / ');
      if (note) s('G' + row, note);
    }
    const t = totalsOf(key);
    const T = last + 1;
    s('A' + T, '합계');
    num('C' + T, t.lunch, `SUM(C${FIRST}:C${last})`);
    num('D' + T, t.coffee, `SUM(D${FIRST}:D${last})`);
    num('E' + T, t.etc, `SUM(E${FIRST}:E${last})`);
    num('F' + T, bal, `F${last}`);
    s('A' + (T + 1), '총 지출');
    num('C' + (T + 1), t.total, `SUM(C${T}:E${T})`);
    s('A' + (T + 2), '1인당 사용액');
    num('C' + (T + 2), list.length ? Math.round(t.total / list.length) : 0,
      `IFERROR(ROUND(C${T + 1}/COUNTA(I${FIRST}:I${mLast}),0),0)`);

    // 메모 (I열, 명단 아래)
    let maxRow = T + 2;
    if (mo.memos.length) {
      const h = mLast + 3;
      s('I' + h, '메모'); s('J' + h, '금액');
      mo.memos.forEach((r, i) => { s('I' + (h + 1 + i), r.label || ''); num('J' + (h + 1 + i), r.amount || 0); });
      const end = h + mo.memos.length;
      s('I' + (end + 1), '합계');
      num('J' + (end + 1), mo.memos.reduce((a, r) => a + (r.amount || 0), 0), `SUM(J${h + 1}:J${end})`);
      maxRow = Math.max(maxRow, end + 1);
    }
    ws['!ref'] = XL.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: maxRow - 1, c: 10 } });
    ws['!cols'] = [{ wch: 8 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 30 }, { wch: 2 }, { wch: 10 }, { wch: 12 }, { wch: 6 }];
    return ws;
  }

  $('btnExport').addEventListener('click', () => {
    if (!window.XLSX) { toast('엑셀 라이브러리를 불러오지 못했습니다 (인터넷 연결 확인)', true); return; }
    const keys = sortedKeys();
    if (!keys.length) { toast('내보낼 데이터가 없습니다', true); return; }
    const wb = window.XLSX.utils.book_new();
    keys.forEach((k) => window.XLSX.utils.book_append_sheet(wb, buildSheet(k, keys), sheetName(k)));
    const now = new Date();
    window.XLSX.writeFile(wb, `식대관리_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}.xlsx`);
    toast(`${keys.length}개 시트 내보내기 완료`);
  });

  // ---------- 엑셀 가져오기 ----------
  $('btnImport').addEventListener('click', () => {
    if (!window.XLSX) { toast('엑셀 라이브러리를 불러오지 못했습니다 (인터넷 연결 확인)', true); return; }
    $('fileImport').click();
  });
  $('fileImport').addEventListener('change', (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try { importWorkbook(window.XLSX.read(new Uint8Array(reader.result), { type: 'array', cellDates: true })); }
      catch (err) { toast('엑셀 파일을 읽지 못했습니다', true); console.error(err); }
    };
    reader.readAsArrayBuffer(file);
  });

  function toNum(v) {
    if (v == null || v === '') return 0;
    if (typeof v === 'number') return v > 0 ? Math.round(v) : 0;
    const n = parseAmount(String(v).trim());
    return n == null ? 0 : n;
  }
  function cellText(v) { return v == null ? '' : String(v).replace(/\s/g, ''); }
  function dayFrom(v, maxDay) {
    let d = null;
    if (v instanceof Date) d = new Date(v.getTime() + 12 * 3600 * 1000).getDate(); // 시간대 오차 보정
    else if (typeof v === 'number') d = v >= 1 && v <= 31 ? Math.floor(v) : (window.XLSX.SSF.parse_date_code(v) || {}).d;
    else if (typeof v === 'string') { const mt = v.match(/(\d{1,2})\s*일?\s*(\(.*\))?\s*$/); if (mt) d = Number(mt[1]); }
    return d && d >= 1 && d <= maxDay ? d : null;
  }

  function parseSheet(rows, key) {
    const maxDay = daysIn(key);
    // 헤더 행: '점심'이 들어간 셀
    let hr = -1, cL = -1, cC = -1, cE = -1, cD = 0;
    for (let r = 0; r < rows.length && hr < 0; r++) {
      const row = rows[r] || [];
      row.forEach((v, c) => {
        const t = cellText(v);
        if (t.includes('점심')) { hr = r; cL = c; }
      });
      if (hr >= 0) {
        row.forEach((v, c) => {
          const t = cellText(v);
          if (t.includes('커피')) cC = c;
          if (t.includes('기타') || t.includes('간식')) cE = c;
          if (t.includes('날짜') || t === '일자') cD = c;
        });
      }
    }
    if (hr < 0) return null;

    const days = {};
    let seq = 0;
    for (let r = hr + 1; r < rows.length && seq < maxDay; r++) {
      const row = rows[r] || [];
      const head = cellText(row[cD]);
      if (/합계|총|소계/.test(head)) break;
      const vals = { lunch: cL >= 0 ? toNum(row[cL]) : 0, coffee: cC >= 0 ? toNum(row[cC]) : 0, etc: cE >= 0 ? toNum(row[cE]) : 0 };
      const hasDate = row[cD] != null && row[cD] !== '';
      if (!hasDate && !vals.lunch && !vals.coffee && !vals.etc) continue;
      seq++;
      const d = dayFrom(row[cD], maxDay) || seq;
      if (vals.lunch || vals.coffee || vals.etc) {
        days[d] = { lunch: vals.lunch, coffee: vals.coffee, etc: vals.etc, memo: {} };
      }
    }

    // 이월금: '이월' 셀의 오른쪽(없으면 아래) 첫 숫자
    let carry = null;
    for (let r = 0; r < rows.length && carry == null; r++) {
      const row = rows[r] || [];
      for (let c = 0; c < row.length && carry == null; c++) {
        if (!cellText(row[c]).includes('이월')) continue;
        for (let k = c + 1; k < row.length; k++) { if (typeof row[k] === 'number') { carry = Math.round(row[k]); break; } }
        if (carry == null && rows[r + 1] && typeof rows[r + 1][c] === 'number') carry = Math.round(rows[r + 1][c]);
      }
    }

    // 회비 명단(선택): '납부' 헤더가 있는 표
    let members = null;
    for (let r = 0; r < rows.length && !members; r++) {
      const row = rows[r] || [];
      const cP = row.findIndex((v) => cellText(v) === '납부');
      if (cP < 0) continue;
      const cN = row.findIndex((v) => cellText(v) === '이름');
      const cA = row.findIndex((v) => /회비|금액/.test(cellText(v)));
      if (cN < 0 || cA < 0) continue;
      members = [];
      for (let k = r + 1; k < rows.length; k++) {
        const rr = rows[k] || [];
        const name = rr[cN] == null ? '' : String(rr[cN]).trim();
        if (!name || name === '메모' || name === '합계') break;
        const pv = cellText(rr[cP]).toUpperCase();
        members.push({ name, amount: toNum(rr[cA]), paid: ['O', 'V', '✓', 'Y', 'TRUE', '납부'].includes(pv) || rr[cP] === true });
      }
    }
    return { days, carry, members };
  }

  function importWorkbook(wb) {
    const found = [];
    wb.SheetNames.forEach((name) => {
      const mt = name.match(/(\d{2})\s*\.\s*(\d{1,2})\s*월/);
      if (!mt) return;
      const key = `20${mt[1]}-${pad(Number(mt[2]))}`;
      const rows = window.XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, raw: true, defval: null });
      const parsed = parseSheet(rows, key);
      if (parsed) found.push({ key, name, parsed });
    });
    if (!found.length) { toast('"26.11월" 형식의 시트(점심/커피/기타 헤더)를 찾지 못했습니다', true); return; }
    const overlap = found.filter((f) => state.months[f.key]).map((f) => f.name);
    let msg = `${found.length}개 시트를 가져옵니다:\n${found.map((f) => f.name).join(', ')}`;
    if (overlap.length) msg += `\n\n기존 데이터가 있는 달(${overlap.join(', ')})의 일별 지출은 엑셀 내용으로 바뀝니다.`;
    if (!confirm(msg)) return;

    found.forEach(({ key, parsed }) => {
      const old = state.months[key];
      const mo = old || newMonth(null);
      mo.days = parsed.days;
      if (parsed.carry != null) mo.carryManual = parsed.carry;
      if (parsed.members) {
        mo.paid = {};
        parsed.members.forEach((pm) => {
          let mem = state.members.find((m) => m.name === pm.name);
          if (!mem) { mem = { id: state.nextId++, name: pm.name, amount: pm.amount }; state.members.push(mem); }
          if (pm.paid) mo.paid[mem.id] = { name: mem.name, amount: pm.amount || mem.amount };
        });
      }
      state.months[key] = mo;
    });
    state.current = found[found.length - 1].key;
    save(); render();
    toast(`${found.length}개 시트 가져오기 완료`);
  }

  render();
})();
