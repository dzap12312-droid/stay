/* 화이트 & 블루 톤 — 청소 전 위생교육 2·3장 시안
   글꼴 이름은 환경변수로 교체 가능 : TITLE_FONT / BODY_FONT */
const fs = require('fs');
const pptxgen = require('pptxgenjs');
const React = require('react');
const RDS = require('react-dom/server');
const sharp = require('sharp');
const lu = require('react-icons/lu');

const TF = process.env.TITLE_FONT || '한국기계연구원';   // 제목용
const BF = process.env.BODY_FONT || '에이투지체';        // 본문용

const BLUE = '1C60EF', LBLUE = 'DBE8FE', WHITE = 'FFFFFF';
const BLUE_D = '0B47C2', BLUE_L = '9EC3FB', LINE = 'C9DCFB';
const NAVY = '102A56', BODY = '45566F', MUTED = '8695AC';

const SW = 13.333, SH = 7.5, M = 0.8, CW = SW - M * 2;

const cache = {};
async function icon(name, color, stroke) {
  const key = name + color + (stroke || '');
  if (cache[key]) return cache[key];
  if (!lu[name]) throw new Error('unknown icon ' + name);
  let svg = RDS.renderToStaticMarkup(React.createElement(lu[name], { size: 256, color: '#' + color }));
  svg = svg.replace(/currentColor/g, '#' + color);
  if (stroke) svg = svg.replace(/stroke-width="[^"]*"/g, `stroke-width="${stroke}"`);
  const buf = await sharp(Buffer.from(svg)).resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  cache[key] = 'image/png;base64,' + buf.toString('base64');
  return cache[key];
}
const bg = f => 'image/png;base64,' + fs.readFileSync(__dirname + '/' + f).toString('base64');

async function main() {
  const p = new pptxgen();
  p.layout = 'LAYOUT_WIDE';
  p.title = '청소 전 위생교육 (화이트&블루 시안)';

  const kicker = (s, t) => s.addText(t, {
    isTextBox: true, x: M, y: 0.6, w: CW, h: 0.3, margin: 0,
    fontFace: BF, fontSize: 11.5, bold: true, color: BLUE, charSpacing: 2.4,
  });
  const title = (s, t) => s.addText(t, {
    isTextBox: true, x: M, y: 0.95, w: CW, h: 0.8, margin: 0,
    fontFace: TF, fontSize: 40, bold: true, color: NAVY,
  });
  const sub = (s, t) => s.addText(t, {
    isTextBox: true, x: M, y: 1.82, w: CW - 0.5, h: 0.4, margin: 0,
    fontFace: BF, fontSize: 14, color: MUTED,
  });
  const pageNo = (s, t) => s.addText(t, {
    isTextBox: true, x: SW - M - 0.6, y: 6.92, w: 0.6, h: 0.3, margin: 0, align: 'right',
    fontFace: BF, fontSize: 10.5, color: MUTED,
  });

  /* ══════════════ 2장 — 오늘 꼭 지킬 3가지 ══════════════ */
  {
    const s = p.addSlide();
    s.background = { data: bg('bg_s2.png') };
    kicker(s, '청소 전 위생교육');
    title(s, '오늘 꼭 지킬 3가지');
    sub(s, '이 3가지만 지켜도 청소로 인한 이물·오염 사고는 대부분 막을 수 있습니다.');

    const items = [
      ['01', 'LuDroplets', '손 깨끗이 씻기', '비누 거품으로 30초 이상\n헹군 뒤 완전히 건조'],
      ['02', 'LuUserRoundCheck', '머리카락 단정히', '머리는 묶어서 노출 없이\n청소 중 머리·얼굴 만지지 않기'],
      ['03', 'LuBan', '이물 흘리지 않기', '장갑·걸레 조각, 공구,\n개인물품 라인 잔류 금지'],
    ];
    const cw = (CW - 1.0) / 3;
    for (let i = 0; i < 3; i++) {
      const [no, ic, t, b] = items[i];
      const x = M + i * (cw + 0.5);
      const cx = x + cw / 2;
      s.addShape(p.ShapeType.ellipse, { x: cx - 0.9, y: 2.4, w: 1.8, h: 1.8, fill: { color: LBLUE }, line: { type: 'none' } });
      s.addImage({ data: await icon(ic, BLUE, 1.7), x: cx - 0.41, y: 2.89, w: 0.82, h: 0.82 });
      s.addShape(p.ShapeType.ellipse, { x: cx + 0.52, y: 2.44, w: 0.52, h: 0.52, fill: { color: BLUE }, line: { color: WHITE, width: 1.5 } });
      s.addText(no, {
        isTextBox: true, x: cx + 0.52, y: 2.44, w: 0.52, h: 0.52, margin: 0, align: 'center', valign: 'middle',
        fontFace: TF, fontSize: 12, bold: true, color: WHITE,
      });
      s.addText(t, {
        isTextBox: true, x, y: 4.44, w: cw, h: 0.42, margin: 0, align: 'center',
        fontFace: TF, fontSize: 21, bold: true, color: NAVY,
      });
      s.addText(b, {
        isTextBox: true, x: x - 0.1, y: 4.95, w: cw + 0.2, h: 0.8, margin: 0, align: 'center',
        fontFace: BF, fontSize: 13, color: BODY, lineSpacingMultiple: 1.3,
      });
    }
    s.addShape(p.ShapeType.downArrow, { x: SW / 2 - 0.16, y: 5.88, w: 0.32, h: 0.28, fill: { color: BLUE_L }, line: { type: 'none' } });
    s.addShape(p.ShapeType.roundRect, {
      x: SW / 2 - 3.1, y: 6.26, w: 6.2, h: 0.72, rectRadius: 0.5,
      fill: { color: BLUE }, line: { type: 'none' },
      shadow: { type: 'outer', color: BLUE, blur: 14, offset: 2, angle: 90, opacity: 0.22 },
    });
    s.addText('3가지 모두 확인 → 청소 시작', {
      isTextBox: true, x: SW / 2 - 3.1, y: 6.26, w: 6.2, h: 0.72, margin: 0, align: 'center', valign: 'middle',
      fontFace: TF, fontSize: 17, bold: true, color: WHITE,
    });
    pageNo(s, '02');
    s.addNotes('세 가지를 손가락으로 세면서 짚어준다. 매주 같은 문장으로 반복하는 것이 목적.');
  }

  /* ══════════════ 3장 — 청소 전 개인위생 체크 ══════════════ */
  {
    const s = p.addSlide();
    s.background = { data: bg('bg_s3.png') };
    kicker(s, '청소 전 위생교육');
    title(s, '청소 전 개인위생 체크');
    sub(s, '현장 투입 전, 본인 상태를 스스로 확인합니다.');

    /* 좌 : 체크리스트 */
    const rows = [
      ['손씻기 완료', '손 세정 후 건조까지 — 장갑은 씻은 손에 착용'],
      ['상처는 방수밴드 + 장갑', '손·팔에 상처가 있으면 반드시 덮고 작업'],
      ['액세서리 · 인조손톱 금지', '반지 · 시계 · 귀걸이 · 네일은 탈의실 보관'],
      ['주머니 비우기', '휴대폰 · 볼펜 · 사탕 등 개인물품 반입 금지'],
    ];
    for (let i = 0; i < rows.length; i++) {
      const y = 2.35 + i * 0.92;
      s.addShape(p.ShapeType.roundRect, { x: M, y: y + 0.14, w: 0.44, h: 0.44, rectRadius: 0.1, fill: { color: LBLUE }, line: { type: 'none' } });
      s.addImage({ data: await icon('LuCheck', BLUE, 3), x: M + 0.09, y: y + 0.23, w: 0.26, h: 0.26 });
      s.addText(rows[i][0], {
        isTextBox: true, x: M + 0.68, y: y + 0.04, w: 5.2, h: 0.34, margin: 0,
        fontFace: TF, fontSize: 16.5, bold: true, color: NAVY,
      });
      s.addText(rows[i][1], {
        isTextBox: true, x: M + 0.68, y: y + 0.4, w: 5.3, h: 0.3, margin: 0,
        fontFace: BF, fontSize: 12, color: MUTED,
      });
    }
    s.addShape(p.ShapeType.roundRect, {
      x: M, y: 6.14, w: 4.9, h: 0.62, rectRadius: 0.5,
      fill: { color: WHITE }, line: { color: BLUE, width: 1.25 },
    });
    s.addText('4개 모두 확인 후 청소도구 수령', {
      isTextBox: true, x: M, y: 6.14, w: 4.9, h: 0.62, margin: 0, align: 'center', valign: 'middle',
      fontFace: TF, fontSize: 14, bold: true, color: BLUE,
    });

    /* 우 : 건강상태 분기 플로우 */
    const RX = 7.2, RW = 5.33, cxR = RX + RW / 2;
    s.addShape(p.ShapeType.roundRect, {
      x: RX, y: 2.35, w: RW, h: 1.0, rectRadius: 0.12,
      fill: { color: WHITE }, line: { color: BLUE, width: 1.25 },
    });
    s.addShape(p.ShapeType.ellipse, { x: RX + 0.25, y: 2.57, w: 0.56, h: 0.56, fill: { color: LBLUE }, line: { type: 'none' } });
    s.addImage({ data: await icon('LuThermometer', BLUE, 2), x: RX + 0.38, y: 2.7, w: 0.3, h: 0.3 });
    s.addText('몸 상태, 이상 없나요?', {
      isTextBox: true, x: RX + 0.95, y: 2.5, w: RW - 1.2, h: 0.34, margin: 0,
      fontFace: TF, fontSize: 16, bold: true, color: NAVY,
    });
    s.addText('설사 · 복통 / 발열 / 구토 / 화농성 상처', {
      isTextBox: true, x: RX + 0.95, y: 2.86, w: RW - 1.2, h: 0.3, margin: 0,
      fontFace: BF, fontSize: 11.5, color: MUTED,
    });
    s.addShape(p.ShapeType.downArrow, { x: cxR - 0.15, y: 3.45, w: 0.3, h: 0.3, fill: { color: BLUE_L }, line: { type: 'none' } });

    const bw = 2.55;
    const branches = [
      [RX, LBLUE, 'LuCircleCheck', BLUE, '이상 없음', BLUE_D, '평소대로 청소 투입', '2E4A7A', '청소 시작'],
      [RX + bw + 0.23, BLUE, 'LuTriangleAlert', WHITE, '이상 있음', WHITE, '담당자에게 즉시 신고', 'D8E6FF', '당일 청소 제외'],
    ];
    for (const [bx, fill, ic, icc, t, tc, b, bc, out] of branches) {
      s.addShape(p.ShapeType.roundRect, { x: bx, y: 3.9, w: bw, h: 1.05, rectRadius: 0.12, fill: { color: fill }, line: { type: 'none' } });
      s.addImage({ data: await icon(ic, icc, 2), x: bx + 0.24, y: 4.1, w: 0.32, h: 0.32 });
      s.addText(t, {
        isTextBox: true, x: bx + 0.66, y: 4.09, w: bw - 0.9, h: 0.32, margin: 0, valign: 'middle',
        fontFace: TF, fontSize: 15, bold: true, color: tc,
      });
      s.addText(b, {
        isTextBox: true, x: bx + 0.24, y: 4.52, w: bw - 0.44, h: 0.32, margin: 0,
        fontFace: BF, fontSize: 11.5, color: bc,
      });
      s.addShape(p.ShapeType.downArrow, { x: bx + bw / 2 - 0.12, y: 5.06, w: 0.24, h: 0.26, fill: { color: BLUE_L }, line: { type: 'none' } });
      s.addShape(p.ShapeType.roundRect, {
        x: bx, y: 5.44, w: bw, h: 0.6, rectRadius: 0.1,
        fill: { color: WHITE }, line: { color: LINE, width: 1 },
      });
      s.addText(out, {
        isTextBox: true, x: bx, y: 5.44, w: bw, h: 0.6, margin: 0, align: 'center', valign: 'middle',
        fontFace: TF, fontSize: 13.5, bold: true, color: BLUE,
      });
    }
    s.addText('※ 숨기고 작업하면 개인 문제가 아니라 전 라인 회수 사고가 됩니다.', {
      isTextBox: true, x: RX, y: 6.22, w: RW, h: 0.3, margin: 0,
      fontFace: BF, fontSize: 11, color: MUTED,
    });
    pageNo(s, '03');
    s.addNotes('신고는 불이익이 아니라 절차임을 매주 강조한다. 해당자는 당일 청소작업에서 제외.');
  }

  await p.writeFile({ fileName: process.argv[2] || 'wb.pptx' });
  console.log('OK  /  TITLE_FONT=' + TF + '  BODY_FONT=' + BF);
}
main().catch(e => { console.error(e); process.exit(1); });
