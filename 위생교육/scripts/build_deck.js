const pptxgen = require('pptxgenjs');
const { icon } = require('./icons');

/* ── 팔레트 : 라면공장 위생 (잉크 네이비 / 국물 오렌지레드 / 면발 골드) ── */
const INK   = '13232F';   // 지배색(60~70%) : 표지·마무리·강조 카드
const INK2  = '21333F';   // 어두운 패널 내부
const RED   = 'E4572E';   // 샤프 액센트
const REDD  = 'BF3A20';   // 경고 카드(흰 글자 대비 확보)
const GOLD  = 'F2A541';   // 보조
const SURF  = 'F4F6F8';   // 밝은 카드
const LINE  = 'D9E1E6';
const MUTED = '5E6E7A';
const W     = 'FFFFFF';
const GHOST = 'D8E0E6';   // 워터마크 숫자
const KO    = '맑은 고딕';

const SW = 13.333, SH = 7.5, M = 0.7, CW = SW - M * 2;

const sh = (o = {}) => Object.assign({ type: 'outer', color: INK, blur: 14, offset: 2, angle: 90, opacity: 0.1 }, o);

function card(s, p, x, y, w, h, o = {}) {
  s.addShape(p.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.1,
    fill: { color: o.fill || SURF },
    line: o.line === null ? { type: 'none' } : { color: o.line || LINE, width: 0.75 },
    shadow: sh(o.shadow || {}),
  });
}
function pill(s, p, x, y, w, h, text, o = {}) {
  s.addShape(p.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.5,
    fill: { color: o.fill || INK }, line: { type: 'none' },
  });
  s.addText(text, {
    isTextBox: true, x, y, w, h, margin: 0, align: 'center', valign: 'middle',
    fontFace: KO, fontSize: o.fontSize || 13, bold: true, color: o.color || W,
  });
}
async function bubble(s, p, x, y, d, ic, o = {}) {
  s.addShape(p.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color: o.fill || RED }, line: { type: 'none' } });
  const isz = d * 0.5;
  s.addImage({ data: await icon(ic, o.iconColor || W), x: x + (d - isz) / 2, y: y + (d - isz) / 2, w: isz, h: isz });
}
function numDot(s, p, x, y, d, n, o = {}) {
  s.addShape(p.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color: o.fill || RED }, line: { type: 'none' } });
  s.addText(String(n), {
    isTextBox: true, x, y, w: d, h: d, margin: 0, align: 'center', valign: 'middle',
    fontFace: KO, fontSize: o.fontSize || 13, bold: true, color: o.color || W,
  });
}
function head(s, kicker, title, sub) {
  s.addText(kicker, {
    isTextBox: true, x: M, y: 0.52, w: CW, h: 0.3, margin: 0,
    fontFace: KO, fontSize: 11.5, bold: true, color: RED, charSpacing: 1.6,
  });
  s.addText(title, {
    isTextBox: true, x: M, y: 0.86, w: CW, h: 0.72, margin: 0,
    fontFace: KO, fontSize: 36, bold: true, color: INK,
  });
  if (sub) s.addText(sub, {
    isTextBox: true, x: M, y: 1.66, w: CW - 1.0, h: 0.42, margin: 0,
    fontFace: KO, fontSize: 14, color: MUTED,
  });
}
function badge(s, p, text) {
  pill(s, p, M, 0.5, 1.72, 0.36, text, { fill: INK, fontSize: 11.5 });
}
function foot(s, n) {
  s.addText('청소 전 위생교육 · 라면공장 주말청소', {
    isTextBox: true, x: M, y: 6.86, w: 6.0, h: 0.3, margin: 0,
    fontFace: KO, fontSize: 9.5, color: '96A5AE',
  });
  s.addText(String(n), {
    isTextBox: true, x: SW - M - 1.0, y: 6.86, w: 1.0, h: 0.3, margin: 0, align: 'right',
    fontFace: KO, fontSize: 9.5, color: '96A5AE',
  });
}
function rings(s, p, cx, cy, sizes, colors, alphas) {
  sizes.forEach((d, i) => {
    s.addShape(p.ShapeType.ellipse, {
      x: cx - d / 2, y: cy - d / 2, w: d, h: d,
      fill: { color: colors[i], transparency: alphas[i] }, line: { type: 'none' },
    });
  });
}

async function main() {
  const p = new pptxgen();
  p.layout = 'LAYOUT_WIDE';
  p.author = '위생관리팀';
  p.title = '청소 전 위생교육';

  /* ══════ 1. 표지 ══════ */
  {
    const s = p.addSlide();
    s.background = { color: INK };
    rings(s, p, 11.9, 3.55, [6.6, 4.6, 3.0], ['1A2B36', '24394A', RED], [0, 0, 0]);
    await bubble(s, p, 11.9 - 0.62, 3.55 - 0.62, 1.24, 'FaBowlFood', { fill: W, iconColor: INK });

    s.addText('매주 반복 위생교육', {
      isTextBox: true, x: M, y: 1.5, w: 7.6, h: 0.32, margin: 0,
      fontFace: KO, fontSize: 12.5, bold: true, color: GOLD, charSpacing: 2.2,
    });
    s.addText('청소 전 위생교육', {
      isTextBox: true, x: M, y: 2.0, w: 8.0, h: 1.0, margin: 0,
      fontFace: KO, fontSize: 48, bold: true, color: W,
    });
    s.addText('라면공장 주말청소 · 시작 전 5분 브리핑', {
      isTextBox: true, x: M, y: 3.12, w: 8.0, h: 0.42, margin: 0,
      fontFace: KO, fontSize: 17, color: 'B9C7D0',
    });
    s.addText('오늘 지킬 것은 딱 3가지입니다.', {
      isTextBox: true, x: M, y: 3.62, w: 8.0, h: 0.4, margin: 0,
      fontFace: KO, fontSize: 14, italic: true, color: GOLD,
    });
    ['날짜        .        .', '진행자', '참석'].forEach((t, i) => {
      const x = M + i * 2.35;
      s.addShape(p.ShapeType.roundRect, {
        x, y: 4.7, w: 2.15, h: 0.62, rectRadius: 0.08,
        fill: { color: INK2 }, line: { color: '3A4E5C', width: 0.75 },
      });
      s.addText(t, {
        isTextBox: true, x: x + 0.16, y: 4.7, w: 1.85, h: 0.62, margin: 0, valign: 'middle',
        fontFace: KO, fontSize: 12, color: 'A9BAC4',
      });
    });
    s.addText('위생관리팀 · 생산팀', {
      isTextBox: true, x: M, y: 6.5, w: 6.0, h: 0.3, margin: 0,
      fontFace: KO, fontSize: 10.5, color: '7E909B',
    });
    s.addNotes('청소 투입 직전 현장에서 5분. 출력물 또는 태블릿으로 진행. 날짜·진행자·참석인원을 먼저 적고 시작한다.');
  }

  /* ══════ 2. 오늘 꼭 지킬 3가지 ══════ */
  {
    const s = p.addSlide();
    head(s, 'TODAY 01', '오늘 꼭 지킬 3가지', '이 3가지만 지켜도 청소로 인한 이물·오염 사고는 대부분 막을 수 있습니다.');
    const items = [
      ['01', 'FaHandsBubbles', '손 깨끗이 씻기', '비누 거품으로 30초 이상,\n흐르는 물에 헹구고\n완전히 말린 뒤 투입'],
      ['02', 'FaUserCheck', '머리카락 단정히', '머리는 묶어서 노출 없이,\n청소 중 손으로\n머리·얼굴 만지지 않기'],
      ['03', 'FaBan', '이물 흘리지 않기', '장갑 조각, 걸레·수세미 조각,\n공구, 개인물품이\n라인에 남지 않게'],
    ];
    const cw = (CW - 0.7) / 3;
    for (let i = 0; i < 3; i++) {
      const [no, ic, t, b] = items[i];
      const x = M + i * (cw + 0.35);
      card(s, p, x, 2.45, cw, 3.7);
      s.addText(no, {
        isTextBox: true, x: x + cw - 1.3, y: 2.6, w: 1.0, h: 0.6, margin: 0, align: 'right',
        fontFace: KO, fontSize: 34, bold: true, color: GHOST,
      });
      await bubble(s, p, x + 0.42, 2.92, 0.95, ic);
      s.addText(t, {
        isTextBox: true, x: x + 0.42, y: 4.12, w: cw - 0.8, h: 0.45, margin: 0,
        fontFace: KO, fontSize: 21, bold: true, color: INK,
      });
      s.addText(b, {
        isTextBox: true, x: x + 0.42, y: 4.72, w: cw - 0.8, h: 1.2, margin: 0,
        fontFace: KO, fontSize: 13.5, color: MUTED, lineSpacingMultiple: 1.25,
      });
    }
    foot(s, 2);
    s.addNotes('세 가지를 손가락으로 세면서 짚어준다. 매주 같은 문장으로 반복하는 것이 목적.');
  }

  /* ══════ 3. 청소 전 개인위생 체크 ══════ */
  {
    const s = p.addSlide();
    head(s, 'TODAY 02', '청소 전 개인위생 체크', '현장 투입 전, 본인 상태를 스스로 확인합니다.');
    const rows = [
      ['FaSoap', '손씻기 완료', '손 세정 후 건조까지 — 장갑은 씻은 손에 착용'],
      ['FaShieldHalved', '상처는 방수밴드 + 장갑', '손·팔에 상처가 있으면 반드시 덮고 작업'],
      ['FaGem', '액세서리·인조손톱 금지', '반지·시계·귀걸이·네일 — 탈의실에 보관'],
      ['FaMobileScreen', '주머니 비우기', '휴대폰·볼펜·사탕 등 개인물품 반입 금지'],
    ];
    for (let i = 0; i < rows.length; i++) {
      const [ic, t, b] = rows[i];
      const y = 2.5 + i * 1.05;
      card(s, p, M, y, 6.5, 0.95);
      await bubble(s, p, M + 0.28, y + 0.19, 0.57, ic, { fill: INK });
      s.addText(t, {
        isTextBox: true, x: M + 1.05, y: y + 0.13, w: 5.2, h: 0.32, margin: 0,
        fontFace: KO, fontSize: 16.5, bold: true, color: INK,
      });
      s.addText(b, {
        isTextBox: true, x: M + 1.05, y: y + 0.48, w: 5.3, h: 0.3, margin: 0,
        fontFace: KO, fontSize: 12, color: MUTED,
      });
    }
    // 우측 : 건강상태 신고 카드
    const rx = 7.45, rw = 5.18;
    card(s, p, rx, 2.5, rw, 4.05, { fill: INK, line: null, shadow: { blur: 18, opacity: 0.22 } });
    await bubble(s, p, rx + 0.42, 2.85, 0.72, 'FaTriangleExclamation', { fill: GOLD, iconColor: INK });
    s.addText('이럴 때는 즉시 신고', {
      isTextBox: true, x: rx + 0.42, y: 3.76, w: rw - 0.84, h: 0.4, margin: 0,
      fontFace: KO, fontSize: 21, bold: true, color: W,
    });
    s.addText('본인 또는 같이 사는 가족이 아래 증상이면\n청소 시작 전 담당자에게 알립니다.', {
      isTextBox: true, x: rx + 0.42, y: 4.2, w: rw - 0.84, h: 0.6, margin: 0,
      fontFace: KO, fontSize: 12.5, color: 'B9C7D0', lineSpacingMultiple: 1.2,
    });
    const tags = ['설사 · 복통', '발열', '구토', '화농성 상처'];
    for (let i = 0; i < 4; i++) {
      const x = rx + 0.42 + (i % 2) * 2.2;
      const y = 4.95 + Math.floor(i / 2) * 0.62;
      pill(s, p, x, y, 2.0, 0.5, tags[i], { fill: INK2, color: W, fontSize: 12.5 });
    }
    s.addText('→ 확인 후 당일 청소작업에서 제외됩니다', {
      isTextBox: true, x: rx + 0.42, y: 6.12, w: rw - 0.84, h: 0.32, margin: 0,
      fontFace: KO, fontSize: 12.5, bold: true, color: GOLD,
    });
    foot(s, 3);
    s.addNotes('숨기면 본인 책임이 아니라 전 라인 회수 사고가 된다는 점을 짚는다. 신고는 불이익이 아니라 절차임을 강조.');
  }

  /* ══════ 4. 청소 시 주의사항 ══════ */
  {
    const s = p.addSlide();
    head(s, 'TODAY 03', '청소 시 주의사항', '세제 · 순서 · 도구 · 안전 — 네 가지 축으로 기억합니다.');
    const items = [
      ['FaFlask', '지정 세제만', '정해진 세제를 정해진 농도로.\n임의 교체·추가 금지', RED],
      ['FaTriangleExclamation', '절대 섞지 않기', '염소계 + 산성 = 유해가스 발생.\n한 가지만 사용', REDD],
      ['FaBanSmoking', '취식 · 흡연 금지', '껌 · 사탕 · 음료 포함.\n지정 장소에서만', RED],
      ['FaListOl', '정해진 순서대로', '위 → 아래, 청결 → 오염,\n배수구는 맨 마지막', INK],
      ['FaBrush', '도구는 색 구분대로', '배수구용 도구를\n설비·바닥에 쓰지 않기', INK],
      ['FaPlugCircleXmark', '전원차단 · 고온주의', '설비는 전원 차단 후,\n유탕기·증숙기는 식은 뒤', INK],
    ];
    const cw = (CW - 0.7) / 3;
    for (let i = 0; i < 6; i++) {
      const [ic, t, b, c] = items[i];
      const x = M + (i % 3) * (cw + 0.35);
      const y = 2.45 + Math.floor(i / 3) * 2.15;
      card(s, p, x, y, cw, 1.95);
      await bubble(s, p, x + 0.32, y + 0.34, 0.6, ic, { fill: c });
      s.addText(t, {
        isTextBox: true, x: x + 1.05, y: y + 0.4, w: cw - 1.35, h: 0.45, margin: 0, valign: 'middle',
        fontFace: KO, fontSize: 16, bold: true, color: INK,
      });
      s.addText(b, {
        isTextBox: true, x: x + 0.32, y: y + 1.0, w: cw - 0.64, h: 0.78, margin: 0,
        fontFace: KO, fontSize: 12.5, color: MUTED, lineSpacingMultiple: 1.15,
      });
    }
    foot(s, 4);
    s.addNotes('세제 혼합 금지는 실제 가스 사고 사례로 설명. 젖은 바닥 미끄러짐과 롤러 돌발 기동도 매주 언급.');
  }

  /* ══════ 5. 마무리 ══════ */
  {
    const s = p.addSlide();
    s.background = { color: INK };
    rings(s, p, 0.5, 7.3, [4.4, 2.9, 1.6], ['1A2B36', '223440', '2B3F4D'], [0, 0, 0]);
    await bubble(s, p, SW / 2 - 0.45, 1.05, 0.9, 'FaBowlFood', { fill: INK2, iconColor: GOLD });
    s.addText('오늘의 마음가짐', {
      isTextBox: true, x: M, y: 1.95, w: CW, h: 0.34, margin: 0, align: 'center',
      fontFace: KO, fontSize: 12.5, bold: true, color: GOLD, charSpacing: 2.2,
    });
    s.addText('우리가 만드는 라면,\n내 가족이 먹는다는 마음으로', {
      isTextBox: true, x: M, y: 2.5, w: CW, h: 1.7, margin: 0, align: 'center',
      fontFace: KO, fontSize: 34, bold: true, color: W, lineSpacingMultiple: 1.3,
    });
    const recap = ['손 깨끗이', '머리 단정히', '이물 ZERO'];
    for (let i = 0; i < 3; i++) {
      pill(s, p, 1.72 + i * 3.35, 4.65, 3.0, 0.82, recap[i], { fill: INK2, fontSize: 16 });
    }
    s.addText('담당구역 확인 → 도구 점검 → 청소 시작 · 종료 후 같은 자리에서 마무리 점검', {
      isTextBox: true, x: M, y: 5.95, w: CW, h: 0.34, margin: 0, align: 'center',
      fontFace: KO, fontSize: 12.5, color: 'A9BAC4',
    });
    s.addNotes('마지막 한 줄은 매주 같은 문장으로 다같이 읽고 끝낸다.');
  }

  /* ══════ 6. 심화 1주차 — 손위생 ══════ */
  {
    const s = p.addSlide();
    badge(s, p, '심화 · 1주차');
    s.addText('손씻기 6단계 · 30초', {
      isTextBox: true, x: M, y: 1.0, w: CW, h: 0.7, margin: 0,
      fontFace: KO, fontSize: 34, bold: true, color: INK,
    });
    s.addText('한 단계당 5초씩. 빠뜨리기 쉬운 곳이 손톱 끝과 손목입니다.', {
      isTextBox: true, x: M, y: 1.76, w: CW, h: 0.36, margin: 0,
      fontFace: KO, fontSize: 14, color: MUTED,
    });
    const steps = [
      ['손바닥', '마주 대고 비비기'], ['손등', '손등과 손가락 문지르기'], ['손가락 사이', '깍지 끼고 비비기'],
      ['엄지', '손바닥으로 돌려주기'], ['손톱 · 손끝', '손바닥에 긁듯이'], ['손목', '잊지 말고 감싸 비비기'],
    ];
    const cw = (CW - 1.0) / 6;
    for (let i = 0; i < 6; i++) {
      const x = M + i * (cw + 0.2);
      card(s, p, x, 2.45, cw, 2.25);
      numDot(s, p, x + (cw - 0.86) / 2, 2.72, 0.86, i + 1, { fill: i < 3 ? RED : INK, fontSize: 19 });
      s.addText(steps[i][0], {
        isTextBox: true, x: x + 0.08, y: 3.72, w: cw - 0.16, h: 0.3, margin: 0, align: 'center',
        fontFace: KO, fontSize: 13.5, bold: true, color: INK,
      });
      s.addText(steps[i][1], {
        isTextBox: true, x: x + 0.08, y: 4.04, w: cw - 0.16, h: 0.55, margin: 0, align: 'center',
        fontFace: KO, fontSize: 10.5, color: MUTED, lineSpacingMultiple: 1.1,
      });
    }
    card(s, p, M, 4.95, CW, 1.6, { fill: INK, line: null, shadow: { blur: 18, opacity: 0.2 } });
    const notes = [
      ['FaStopwatch', '30초 이상', '비누 거품 낸 상태로'],
      ['FaDroplet', '완전 건조', '젖은 손은 세균이 더 잘 옮음'],
      ['FaHand', '장갑도 씻은 손에', '장갑 찢어지면 즉시 교체'],
    ];
    for (let i = 0; i < 3; i++) {
      const x = M + 0.4 + i * 3.85;
      await bubble(s, p, x, 5.35, 0.66, notes[i][0], { fill: GOLD, iconColor: INK });
      s.addText(notes[i][1], {
        isTextBox: true, x: x + 0.86, y: 5.35, w: 2.8, h: 0.3, margin: 0,
        fontFace: KO, fontSize: 15, bold: true, color: W,
      });
      s.addText(notes[i][2], {
        isTextBox: true, x: x + 0.86, y: 5.68, w: 2.9, h: 0.3, margin: 0,
        fontFace: KO, fontSize: 11.5, color: 'B9C7D0',
      });
    }
    foot(s, 6);
    s.addNotes('1주차에는 진행자가 6단계를 직접 한 번 실연한다. 말로만 하면 손톱·손목이 빠진다.');
  }

  /* ══════ 7. 심화 2주차 — 세제·약품 안전 ══════ */
  {
    const s = p.addSlide();
    badge(s, p, '심화 · 2주차');
    s.addText('세제 · 약품 안전', {
      isTextBox: true, x: M, y: 1.0, w: CW, h: 0.7, margin: 0,
      fontFace: KO, fontSize: 34, bold: true, color: INK,
    });
    s.addText('용도가 다른 약품을 섞으면 유해가스가 발생합니다. 한 번에 한 가지만.', {
      isTextBox: true, x: M, y: 1.76, w: CW, h: 0.36, margin: 0,
      fontFace: KO, fontSize: 14, color: MUTED,
    });
    const chem = [
      ['알칼리성', '기름 · 유지 제거 (유탕기 주변)', '피부 자극 — 고무장갑 필수', RED],
      ['산성', '물때 · 스케일 제거', '금속 부식 주의, 장시간 방치 금지', GOLD],
      ['염소계 살균제', '기구 · 표면 살균 (희석 사용)', '산성 세제와 절대 혼합 금지', REDD],
      ['알코올 70%', '손 · 소도구 표면 살균', '화기 주변 사용 금지', INK],
    ];
    for (let i = 0; i < 4; i++) {
      const [n, u, c, col] = chem[i];
      const y = 2.45 + i * 1.0;
      card(s, p, M, y, 6.5, 0.9);
      s.addShape(p.ShapeType.ellipse, {
        x: M + 0.24, y: y + 0.28, w: 0.34, h: 0.34,
        fill: { color: col }, line: { type: 'none' },
      });
      s.addText([
        { text: n, options: { bold: true, color: INK, fontSize: 14.5 } },
        { text: '   ' + u, options: { color: MUTED, fontSize: 12.5 } },
      ], {
        isTextBox: true, x: M + 0.62, y: y + 0.12, w: 5.7, h: 0.34, margin: 0, fontFace: KO,
      });
      s.addText(c, {
        isTextBox: true, x: M + 0.62, y: y + 0.47, w: 5.7, h: 0.3, margin: 0,
        fontFace: KO, fontSize: 11.5, color: REDD,
      });
    }
    const rx = 7.45, rw = 5.18;
    card(s, p, rx, 2.45, rw, 2.45, { fill: REDD, line: null, shadow: { blur: 18, opacity: 0.22 } });
    await bubble(s, p, rx + 0.42, 2.75, 0.66, 'FaTriangleExclamation', { fill: W, iconColor: REDD });
    s.addText('절대 섞지 마세요', {
      isTextBox: true, x: rx + 1.2, y: 2.78, w: rw - 1.6, h: 0.6, margin: 0, valign: 'middle',
      fontFace: KO, fontSize: 20, bold: true, color: W,
    });
    s.addText([
      { text: '염소계 + 산성 세제', options: { bold: true } },
      { text: '  →  염소가스 발생\n', options: {} },
      { text: '염소계 + 암모니아계', options: { bold: true } },
      { text: '  →  유해가스 발생\n', options: {} },
      { text: '희석은 지정 용기에, 정해진 농도로만', options: { color: 'FFE2D8' } },
    ], {
      isTextBox: true, x: rx + 0.42, y: 3.62, w: rw - 0.84, h: 1.1, margin: 0,
      fontFace: KO, fontSize: 12.5, color: W, lineSpacingMultiple: 1.35,
    });
    card(s, p, rx, 5.1, rw, 1.45);
    s.addText('청소 시 필수 보호구', {
      isTextBox: true, x: rx + 0.35, y: 5.24, w: rw - 0.7, h: 0.3, margin: 0,
      fontFace: KO, fontSize: 14, bold: true, color: INK,
    });
    const ppe = [['FaGlasses', '고글'], ['FaHand', '내화학 장갑'], ['FaShoePrints', '장화'], ['FaMaskFace', '마스크']];
    for (let i = 0; i < 4; i++) {
      const x = rx + 0.35 + i * 1.18;
      await bubble(s, p, x + 0.12, 5.66, 0.5, ppe[i][0], { fill: INK });
      s.addText(ppe[i][1], {
        isTextBox: true, x: x - 0.06, y: 6.2, w: 0.9, h: 0.26, margin: 0, align: 'center',
        fontFace: KO, fontSize: 9.5, color: MUTED,
      });
    }
    foot(s, 7);
    s.addNotes('희석 농도표와 MSDS 위치를 실제로 손으로 가리켜 알려준다.');
  }

  /* ══════ 8. 심화 3주차 — 도구 색 구분 · 이물 관리 ══════ */
  {
    const s = p.addSlide();
    badge(s, p, '심화 · 3주차');
    s.addText('도구 색 구분 · 이물 관리', {
      isTextBox: true, x: M, y: 1.0, w: CW, h: 0.7, margin: 0,
      fontFace: KO, fontSize: 34, bold: true, color: INK,
    });
    s.addText('도구를 섞어 쓰면 오염이 그대로 옮겨갑니다. 색이 곧 사용 구역입니다.', {
      isTextBox: true, x: M, y: 1.76, w: CW, h: 0.36, margin: 0,
      fontFace: KO, fontSize: 14, color: MUTED,
    });
    const chips = [
      ['C8372D', W, 'FaFaucetDrip', '빨강', '배수구 · 트렌치'],
      ['2C6FAF', W, 'FaGears', '파랑', '설비 · 기구'],
      ['3E8E6E', W, 'FaBroom', '초록', '바닥 · 벽'],
      ['E8B23A', INK, 'FaWheatAwn', '노랑', '알레르겐 취급 구역'],
    ];
    const cw = (CW - 0.9) / 4;
    for (let i = 0; i < 4; i++) {
      const [bg, tc, ic, n, u] = chips[i];
      const x = M + i * (cw + 0.3);
      s.addShape(p.ShapeType.roundRect, {
        x, y: 2.45, w: cw, h: 1.7, rectRadius: 0.1,
        fill: { color: bg }, line: { type: 'none' }, shadow: sh({ opacity: 0.16 }),
      });
      s.addImage({ data: await icon(ic, tc), x: x + 0.3, y: 2.7, w: 0.42, h: 0.42 });
      s.addText(n, {
        isTextBox: true, x: x + 0.3, y: 3.22, w: cw - 0.6, h: 0.36, margin: 0,
        fontFace: KO, fontSize: 19, bold: true, color: tc,
      });
      s.addText(u, {
        isTextBox: true, x: x + 0.3, y: 3.62, w: cw - 0.5, h: 0.32, margin: 0,
        fontFace: KO, fontSize: 12, color: tc,
      });
    }
    const its = [
      ['FaMagnifyingGlass', '사용 전 파손 점검', '털 빠짐 · 갈라짐 · 조각 떨어짐 확인'],
      ['FaBan', '나무 · 철사 브러시 금지', '지정된 플라스틱 · 스테인리스만'],
      ['FaClipboardCheck', '사용 후 세척 · 걸어 보관', '바닥에 두지 않고 건조 상태로'],
    ];
    const cw2 = (CW - 0.7) / 3;
    for (let i = 0; i < 3; i++) {
      const x = M + i * (cw2 + 0.35);
      card(s, p, x, 4.4, cw2, 1.1);
      await bubble(s, p, x + 0.3, 4.66, 0.56, its[i][0], { fill: INK });
      s.addText(its[i][1], {
        isTextBox: true, x: x + 1.02, y: 4.6, w: cw2 - 1.25, h: 0.3, margin: 0,
        fontFace: KO, fontSize: 14, bold: true, color: INK,
      });
      s.addText(its[i][2], {
        isTextBox: true, x: x + 1.02, y: 4.92, w: cw2 - 1.2, h: 0.3, margin: 0,
        fontFace: KO, fontSize: 11, color: MUTED,
      });
    }
    card(s, p, M, 5.7, CW, 0.85, { fill: INK, line: null, shadow: { blur: 16, opacity: 0.2 } });
    await bubble(s, p, M + 0.32, 5.85, 0.55, 'FaTriangleExclamation', { fill: GOLD, iconColor: INK });
    s.addText([
      { text: '걸레 · 수세미 · 장갑 조각', options: { bold: true, color: GOLD } },
      { text: '  —  고객 이물 클레임에서 가장 많이 나오는 원인입니다. 청소 후 도구 개수까지 확인하세요.', options: { color: W } },
    ], {
      isTextBox: true, x: M + 1.05, y: 5.85, w: CW - 1.4, h: 0.55, margin: 0, valign: 'middle',
      fontFace: KO, fontSize: 13,
    });
    foot(s, 8);
    s.addNotes('도구함을 실제로 열어 색 구분 상태를 함께 확인한다.');
  }

  /* ══════ 9. 심화 4주차 — 청소 순서 9단계 ══════ */
  {
    const s = p.addSlide();
    badge(s, p, '심화 · 4주차');
    s.addText('청소 순서 9단계', {
      isTextBox: true, x: M, y: 1.0, w: CW, h: 0.7, margin: 0,
      fontFace: KO, fontSize: 34, bold: true, color: INK,
    });
    s.addText('순서를 바꾸면 이미 닦은 곳이 다시 오염됩니다.', {
      isTextBox: true, x: M, y: 1.76, w: CW, h: 0.36, margin: 0,
      fontFace: KO, fontSize: 14, color: MUTED,
    });
    const groups = [
      ['준비', RED, 'FaPlugCircleXmark', [['1', '전원 차단 · 잠금(LOTO)'], ['2', '제품 · 포장재 반출 또는 덮개'], ['3', '건식 제거 — 진공 · 쓸기']]],
      ['세척', INK, 'FaSprayCanSparkles', [['4', '예비 세척 (저압, 물 튐 주의)'], ['5', '세제 도포 + 접촉시간 유지'], ['6', '브러싱 — 구석 · 틈새까지']]],
      ['마무리', GOLD, 'FaClipboardCheck', [['7', '헹굼 · 물기 제거(스퀴지)'], ['8', '살균 후 완전 건조'], ['9', '이물 점검 · 금속검출기 감도 확인']]],
    ];
    const cw = (CW - 0.7) / 3;
    for (let i = 0; i < 3; i++) {
      const [gname, gcol, gic, lines] = groups[i];
      const x = M + i * (cw + 0.35);
      card(s, p, x, 2.45, cw, 3.3);
      await bubble(s, p, x + 0.32, 2.72, 0.6, gic, { fill: gcol, iconColor: gcol === GOLD ? INK : W });
      s.addText(gname, {
        isTextBox: true, x: x + 1.05, y: 2.78, w: cw - 1.3, h: 0.48, margin: 0, valign: 'middle',
        fontFace: KO, fontSize: 20, bold: true, color: INK,
      });
      lines.forEach((ln, j) => {
        const y = 3.6 + j * 0.68;
        numDot(s, p, x + 0.34, y, 0.42, ln[0], { fill: gcol, color: gcol === GOLD ? INK : W, fontSize: 12 });
        s.addText(ln[1], {
          isTextBox: true, x: x + 0.92, y: y - 0.06, w: cw - 1.2, h: 0.55, margin: 0, valign: 'middle',
          fontFace: KO, fontSize: 12.5, color: INK, lineSpacingMultiple: 1.1,
        });
      });
    }
    const rules = ['위 → 아래', '청결구역 → 오염구역', '배수구는 맨 마지막'];
    for (let i = 0; i < 3; i++) {
      pill(s, p, M + i * (cw + 0.35), 5.95, cw, 0.6, rules[i], { fill: i === 2 ? REDD : INK, fontSize: 14 });
    }
    foot(s, 9);
    s.addNotes('9단계 중 ⑨(이물 점검 · 금속검출기 감도 확인)를 빠뜨리는 경우가 많다. 재가동 책임자 지정.');
  }

  /* ══════ 10. 부록 — 공정별 청소 위험지점 ══════ */
  {
    const s = p.addSlide();
    badge(s, p, '부록 · 공정별');
    s.addText('라면 라인 공정별 청소 위험지점', {
      isTextBox: true, x: M, y: 1.0, w: CW, h: 0.7, margin: 0,
      fontFace: KO, fontSize: 32, bold: true, color: INK,
    });
    s.addText('담당구역 배정 시 함께 확인 — 구역마다 위험이 다릅니다.', {
      isTextBox: true, x: M, y: 1.76, w: CW, h: 0.36, margin: 0,
      fontFace: KO, fontSize: 14, color: MUTED,
    });
    const zones = [
      ['FaWheatAwn', '배합 · 호퍼', '분진 · 반죽 고착', '에어건 분사 금지, 진공 우선'],
      ['FaGears', '압연 롤러 · 절출', '협착 · 돌발 기동', '전원 차단·잠금 후 착수'],
      ['FaWind', '증숙기', '응축수 → 곰팡이', '감압 확인, 물기 완전 제거'],
      ['FaFire', '유탕기 · 후드', '잔유 · 화재 · 화상', '식은 뒤, 덕트 기름 제거'],
      ['FaSnowflake', '냉각 컨베이어', '결로 · 낙하 이물', '상부 구조물 먼저 청소'],
      ['FaJar', '스프 충전부', '알레르겐 교차오염', '전용 도구로 건식 제거'],
      ['FaBoxOpen', '포장 · 실링', '필름 · 라벨 조각', '조각 전량 회수 후 반출'],
      ['FaFaucetDrip', '바닥 · 배수구', '유지 슬러지 · 해충', '맨 마지막, 빨강 전용 도구'],
    ];
    const cw = (CW - 0.75) / 4;
    for (let i = 0; i < 8; i++) {
      const [ic, n, risk, act] = zones[i];
      const x = M + (i % 4) * (cw + 0.25);
      const y = 2.45 + Math.floor(i / 4) * 2.15;
      card(s, p, x, y, cw, 1.95);
      await bubble(s, p, x + 0.26, y + 0.26, 0.52, ic, { fill: i % 2 ? INK : RED });
      s.addText(n, {
        isTextBox: true, x: x + 0.26, y: y + 0.88, w: cw - 0.5, h: 0.3, margin: 0,
        fontFace: KO, fontSize: 15, bold: true, color: INK,
      });
      s.addText(risk, {
        isTextBox: true, x: x + 0.26, y: y + 1.2, w: cw - 0.5, h: 0.28, margin: 0,
        fontFace: KO, fontSize: 11.5, bold: true, color: REDD,
      });
      s.addText(act, {
        isTextBox: true, x: x + 0.26, y: y + 1.48, w: cw - 0.5, h: 0.4, margin: 0,
        fontFace: KO, fontSize: 11, color: MUTED, lineSpacingMultiple: 1.1,
      });
    }
    foot(s, 10);
    s.addNotes('구역 배정 후 해당 칸만 짚어 읽어준다. 전체를 매주 다 읽지 않는다.');
  }

  /* ══════ 11. 부록 — 운영 방식(진행자용) ══════ */
  {
    const s = p.addSlide();
    badge(s, p, '부록 · 진행자용');
    s.addText('매주 운영 방식', {
      isTextBox: true, x: M, y: 1.0, w: CW, h: 0.7, margin: 0,
      fontFace: KO, fontSize: 34, bold: true, color: INK,
    });
    s.addText('본편 5장은 매주 그대로, 심화 슬라이드 1장만 4주 주기로 교체합니다.', {
      isTextBox: true, x: M, y: 1.76, w: CW, h: 0.36, margin: 0,
      fontFace: KO, fontSize: 14, color: MUTED,
    });
    const weeks = [
      ['1주차', 'FaHandsBubbles', '손위생 · 개인위생', '6단계 실연 1회'],
      ['2주차', 'FaFlask', '세제 · 약품 안전', '희석 농도표 위치 확인'],
      ['3주차', 'FaBrush', '도구 색 구분 · 이물', '도구함 현장 점검'],
      ['4주차', 'FaListOl', '청소 순서 9단계', '재가동 전 확인 강조'],
    ];
    const cw = (CW - 0.75) / 4;
    for (let i = 0; i < 4; i++) {
      const [wk, ic, t, memo] = weeks[i];
      const x = M + i * (cw + 0.25);
      card(s, p, x, 2.45, cw, 2.5);
      pill(s, p, x + 0.26, 2.7, 1.0, 0.34, wk, { fill: i === 0 ? RED : INK, fontSize: 11 });
      await bubble(s, p, x + 0.26, 3.18, 0.6, ic, { fill: INK });
      s.addText(t, {
        isTextBox: true, x: x + 0.26, y: 3.92, w: cw - 0.5, h: 0.5, margin: 0,
        fontFace: KO, fontSize: 15, bold: true, color: INK, lineSpacingMultiple: 1.1,
      });
      s.addText(memo, {
        isTextBox: true, x: x + 0.26, y: 4.46, w: cw - 0.5, h: 0.3, margin: 0,
        fontFace: KO, fontSize: 11, color: MUTED,
      });
    }
    const boxes = [
      ['FaPenToSquare', '기록은 주 1행만', '날짜 · 진행자 · 참석인원 · 심화주제 번호만 기록표에 남깁니다. 서명부 · 퀴즈는 없습니다.'],
      ['FaBullhorn', '핫이슈 한 줄 추가', '전주에 이물 클레임 · 사고 · 지적사항이 있었다면 그 내용 한 줄을 본편 끝에 덧붙입니다.'],
    ];
    for (let i = 0; i < 2; i++) {
      const x = M + i * (5.9 + 0.35);
      card(s, p, x, 5.2, 5.9, 1.35, { fill: i === 0 ? SURF : INK, line: i === 0 ? undefined : null });
      await bubble(s, p, x + 0.3, 5.5, 0.56, boxes[i][0], { fill: i === 0 ? INK : GOLD, iconColor: i === 0 ? W : INK });
      s.addText(boxes[i][1], {
        isTextBox: true, x: x + 1.02, y: 5.4, w: 4.6, h: 0.3, margin: 0,
        fontFace: KO, fontSize: 14, bold: true, color: i === 0 ? INK : W,
      });
      s.addText(boxes[i][2], {
        isTextBox: true, x: x + 1.02, y: 5.72, w: 4.6, h: 0.65, margin: 0,
        fontFace: KO, fontSize: 11.5, color: i === 0 ? MUTED : 'B9C7D0', lineSpacingMultiple: 1.15,
      });
    }
    foot(s, 11);
    s.addNotes('진행자 전용. 현장 출력물에서는 이 장을 빼고 1~5장만 인쇄해도 된다.');
  }

  await p.writeFile({ fileName: process.argv[2] || 'deck.pptx' });
  console.log('OK');
}
main().catch(e => { console.error(e); process.exit(1); });
