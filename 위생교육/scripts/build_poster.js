const pptxgen = require('pptxgenjs');
const { icon } = require('./icons');

const INK = '13232F', INK2 = '21333F', RED = 'E4572E', REDD = 'BF3A20', GOLD = 'F2A541';
const SURF = 'F4F6F8', LINE = 'D9E1E6', MUTED = '5E6E7A', W = 'FFFFFF', GHOST = 'D8E0E6';
const KO = '맑은 고딕';
const PW = 8.27, PH = 11.69, M = 0.6, CW = PW - M * 2;
const sh = (o = {}) => Object.assign({ type: 'outer', color: INK, blur: 14, offset: 2, angle: 90, opacity: 0.1 }, o);

async function main() {
  const p = new pptxgen();
  p.defineLayout({ name: 'A4P', width: PW, height: PH });
  p.layout = 'A4P';
  p.title = '청소 전 위생 3원칙 (현장 게시용)';
  const s = p.addSlide();

  /* 상단 다크 패널 */
  s.addShape(p.ShapeType.rect, { x: 0, y: 0, w: PW, h: 3.0, fill: { color: INK }, line: { type: 'none' } });
  s.addShape(p.ShapeType.ellipse, { x: PW - 2.2, y: -0.9, w: 3.0, h: 3.0, fill: { color: '1D303E' }, line: { type: 'none' } });
  s.addShape(p.ShapeType.ellipse, { x: PW - 1.62, y: 0.52, w: 1.1, h: 1.1, fill: { color: RED }, line: { type: 'none' } });
  s.addImage({ data: await icon('FaBowlFood', W), x: PW - 1.35, y: 0.79, w: 0.56, h: 0.56 });

  s.addText('라면공장 주말청소', {
    isTextBox: true, x: M, y: 0.6, w: 5.0, h: 0.3, margin: 0,
    fontFace: KO, fontSize: 12, bold: true, color: GOLD, charSpacing: 2,
  });
  s.addText('청소 전 위생 3원칙', {
    isTextBox: true, x: M, y: 1.0, w: 6.0, h: 0.8, margin: 0,
    fontFace: KO, fontSize: 38, bold: true, color: W,
  });
  s.addText('청소 시작 전, 이 판을 보고 세 가지를 소리 내어 확인합니다.', {
    isTextBox: true, x: M, y: 1.95, w: 6.4, h: 0.4, margin: 0,
    fontFace: KO, fontSize: 13.5, color: 'B9C7D0',
  });
  s.addText('우리가 만드는 라면, 내 가족이 먹는다는 마음으로', {
    isTextBox: true, x: M, y: 2.38, w: 6.6, h: 0.35, margin: 0,
    fontFace: KO, fontSize: 13, italic: true, color: GOLD,
  });

  /* 3원칙 카드 */
  const items = [
    ['01', 'FaHandsBubbles', '손 깨끗이 씻기', '비누 거품으로 30초 이상 · 흐르는 물에 헹구고 완전히 건조'],
    ['02', 'FaUserCheck', '머리카락 단정히', '머리는 묶어서 노출 없이 · 청소 중 머리·얼굴 만지지 않기'],
    ['03', 'FaBan', '이물 흘리지 않기', '장갑·걸레·수세미 조각, 공구, 개인물품이 라인에 남지 않게'],
  ];
  for (let i = 0; i < 3; i++) {
    const [no, ic, t, b] = items[i];
    const y = 3.25 + i * 1.42;
    s.addShape(p.ShapeType.roundRect, {
      x: M, y, w: CW, h: 1.3, rectRadius: 0.1,
      fill: { color: SURF }, line: { color: LINE, width: 0.75 }, shadow: sh(),
    });
    s.addShape(p.ShapeType.ellipse, { x: M + 0.32, y: y + 0.23, w: 0.84, h: 0.84, fill: { color: RED }, line: { type: 'none' } });
    s.addImage({ data: await icon(ic, W), x: M + 0.53, y: y + 0.44, w: 0.42, h: 0.42 });
    s.addText(no, {
      isTextBox: true, x: M + CW - 1.2, y: y + 0.14, w: 1.0, h: 0.5, margin: 0, align: 'right',
      fontFace: KO, fontSize: 30, bold: true, color: GHOST,
    });
    s.addText(t, {
      isTextBox: true, x: M + 1.4, y: y + 0.24, w: CW - 2.6, h: 0.42, margin: 0,
      fontFace: KO, fontSize: 23, bold: true, color: INK,
    });
    s.addText(b, {
      isTextBox: true, x: M + 1.4, y: y + 0.72, w: CW - 1.75, h: 0.42, margin: 0,
      fontFace: KO, fontSize: 12.5, color: MUTED,
    });
  }

  /* 청소 순서 원칙 */
  s.addText('청소 순서 원칙', {
    isTextBox: true, x: M, y: 7.62, w: CW, h: 0.3, margin: 0,
    fontFace: KO, fontSize: 15, bold: true, color: INK,
  });
  const rules = ['위 → 아래', '청결구역 → 오염구역', '배수구는 맨 마지막'];
  const rw = (CW - 0.4) / 3;
  for (let i = 0; i < 3; i++) {
    const x = M + i * (rw + 0.2);
    s.addShape(p.ShapeType.roundRect, {
      x, y: 7.98, w: rw, h: 0.6, rectRadius: 0.5,
      fill: { color: i === 2 ? REDD : INK }, line: { type: 'none' },
    });
    s.addText(rules[i], {
      isTextBox: true, x, y: 7.98, w: rw, h: 0.6, margin: 0, align: 'center', valign: 'middle',
      fontFace: KO, fontSize: 12.5, bold: true, color: W,
    });
  }
  s.addText([
    { text: '준비 ', options: { bold: true, color: RED } },
    { text: '① 전원차단 · 잠금   ② 제품 · 포장재 반출   ③ 건식 제거(진공 · 쓸기)', options: { color: MUTED, breakLine: true } },
    { text: '세척 ', options: { bold: true, color: INK } },
    { text: '④ 예비세척(저압)   ⑤ 세제 도포 + 접촉시간   ⑥ 브러싱', options: { color: MUTED, breakLine: true } },
    { text: '마무리 ', options: { bold: true, color: 'B07A1F' } },
    { text: '⑦ 헹굼 · 물기 제거   ⑧ 살균 후 건조   ⑨ 이물점검 · 금속검출기 감도', options: { color: MUTED } },
  ], {
    isTextBox: true, x: M, y: 8.62, w: CW, h: 0.62, margin: 0,
    fontFace: KO, fontSize: 10, lineSpacingMultiple: 1.25,
  });

  /* 경고 2단 */
  const warns = [
    [REDD, 'FaTriangleExclamation', '세제는 지정된 것만 · 절대 섞지 않기', '염소계 + 산성 = 유해가스 발생 · 정해진 농도로만 희석'],
    [INK, 'FaUserDoctor', '몸이 안 좋으면 청소 전에 알리기', '설사 · 복통 · 발열 · 구토 · 화농성 상처 → 담당자에게 신고'],
  ];
  for (let i = 0; i < 2; i++) {
    const [bg, ic, t, b] = warns[i];
    const y = 9.32 + i * 0.9;
    s.addShape(p.ShapeType.roundRect, {
      x: M, y, w: CW, h: 0.8, rectRadius: 0.1, fill: { color: bg }, line: { type: 'none' }, shadow: sh({ opacity: 0.14 }),
    });
    s.addShape(p.ShapeType.ellipse, { x: M + 0.24, y: y + 0.19, w: 0.44, h: 0.44, fill: { color: i === 0 ? W : GOLD }, line: { type: 'none' } });
    s.addImage({ data: await icon(ic, i === 0 ? REDD : INK), x: M + 0.35, y: y + 0.3, w: 0.22, h: 0.22 });
    s.addText(t, {
      isTextBox: true, x: M + 0.82, y: y + 0.13, w: CW - 1.0, h: 0.28, margin: 0,
      fontFace: KO, fontSize: 14, bold: true, color: W,
    });
    s.addText(b, {
      isTextBox: true, x: M + 0.82, y: y + 0.42, w: CW - 1.0, h: 0.28, margin: 0,
      fontFace: KO, fontSize: 11, color: i === 0 ? 'FFE2D8' : 'B9C7D0',
    });
  }

  s.addText('위생관리팀 · 매주 주말청소 직전 5분 교육 실시 · 게시물 훼손 시 담당자에게 알려주세요', {
    isTextBox: true, x: M, y: 11.18, w: CW, h: 0.28, margin: 0, align: 'center',
    fontFace: KO, fontSize: 9.5, color: '96A5AE',
  });

  await p.writeFile({ fileName: process.argv[2] || 'poster.pptx' });
  console.log('OK');
}
main().catch(e => { console.error(e); process.exit(1); });
