/* Huấn luyện vệ sinh trước khi làm vệ sinh — nhà máy mì ăn liền (bản tiếng Việt, 9 trang)
   * 한국어판에서 주차 구분 제거 + 도구 색 구분·이물 관리(구 심화 3주차) 슬라이드 제외 */
const pptxgen = require('pptxgenjs');
const { icon } = require('./icons');

const INK = '13232F', INK2 = '21333F', RED = 'E4572E', REDD = 'BF3A20', GOLD = 'F2A541';
const SURF = 'F4F6F8', LINE = 'D9E1E6', MUTED = '5E6E7A', W = 'FFFFFF', GHOST = 'D8E0E6';
const F = 'Arial';

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
  s.addShape(p.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.5, fill: { color: o.fill || INK }, line: { type: 'none' } });
  s.addText(text, {
    isTextBox: true, x, y, w, h, margin: 0, align: 'center', valign: 'middle',
    fontFace: F, fontSize: o.fontSize || 13, bold: true, color: o.color || W,
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
    fontFace: F, fontSize: o.fontSize || 13, bold: true, color: o.color || W,
  });
}
function head(s, kicker, title, sub, tsize) {
  s.addText(kicker, {
    isTextBox: true, x: M, y: 0.52, w: CW, h: 0.3, margin: 0,
    fontFace: F, fontSize: 11.5, bold: true, color: RED, charSpacing: 1.6,
  });
  s.addText(title, {
    isTextBox: true, x: M, y: 0.86, w: CW, h: 0.72, margin: 0,
    fontFace: F, fontSize: tsize || 34, bold: true, color: INK,
  });
  if (sub) s.addText(sub, {
    isTextBox: true, x: M, y: 1.68, w: CW - 0.6, h: 0.4, margin: 0,
    fontFace: F, fontSize: 13.5, color: MUTED,
  });
}
function badge(s, p, text) { pill(s, p, M, 0.5, 2.1, 0.36, text, { fill: INK, fontSize: 11 }); }
function titleUnderBadge(s, t, sub, tsize) {
  s.addText(t, {
    isTextBox: true, x: M, y: 1.0, w: CW, h: 0.72, margin: 0,
    fontFace: F, fontSize: tsize || 34, bold: true, color: INK,
  });
  s.addText(sub, {
    isTextBox: true, x: M, y: 1.78, w: CW - 0.6, h: 0.36, margin: 0,
    fontFace: F, fontSize: 13.5, color: MUTED,
  });
}
function foot(s, n) {
  s.addText('Huấn luyện vệ sinh · Vệ sinh cuối tuần — nhà máy mì ăn liền', {
    isTextBox: true, x: M, y: 6.86, w: 7.0, h: 0.3, margin: 0,
    fontFace: F, fontSize: 9.5, color: '96A5AE',
  });
  s.addText(String(n), {
    isTextBox: true, x: SW - M - 1.0, y: 6.86, w: 1.0, h: 0.3, margin: 0, align: 'right',
    fontFace: F, fontSize: 9.5, color: '96A5AE',
  });
}
function rings(s, p, cx, cy, sizes, colors) {
  sizes.forEach((d, i) => s.addShape(p.ShapeType.ellipse, {
    x: cx - d / 2, y: cy - d / 2, w: d, h: d, fill: { color: colors[i] }, line: { type: 'none' },
  }));
}

async function main() {
  const p = new pptxgen();
  p.layout = 'LAYOUT_WIDE';
  p.author = 'Bộ phận Quản lý vệ sinh';
  p.title = 'Huấn luyện vệ sinh trước khi làm vệ sinh';

  /* ═══ 1. Bìa ═══ */
  {
    const s = p.addSlide();
    s.background = { color: INK };
    rings(s, p, 11.9, 3.55, [6.6, 4.6, 3.0], ['1A2B36', '24394A', RED]);
    await bubble(s, p, 11.9 - 0.62, 3.55 - 0.62, 1.24, 'FaBowlFood', { fill: W, iconColor: INK });

    s.addText('ĐÀO TẠO VỆ SINH HÀNG TUẦN', {
      isTextBox: true, x: M, y: 1.5, w: 7.6, h: 0.32, margin: 0,
      fontFace: F, fontSize: 12, bold: true, color: GOLD, charSpacing: 2,
    });
    s.addText('Huấn luyện vệ sinh', {
      isTextBox: true, x: M, y: 2.0, w: 8.2, h: 1.0, margin: 0,
      fontFace: F, fontSize: 46, bold: true, color: W,
    });
    s.addText('Nhà máy mì ăn liền · Phổ biến 5 phút trước khi làm vệ sinh', {
      isTextBox: true, x: M, y: 3.12, w: 8.2, h: 0.42, margin: 0,
      fontFace: F, fontSize: 16, color: 'B9C7D0',
    });
    s.addText('Hôm nay chỉ cần nhớ đúng 3 điều.', {
      isTextBox: true, x: M, y: 3.62, w: 8.0, h: 0.4, margin: 0,
      fontFace: F, fontSize: 14, italic: true, color: GOLD,
    });
    ['Ngày        .        .', 'Người phụ trách', 'Số người'].forEach((t, i) => {
      const x = M + i * 2.35;
      s.addShape(p.ShapeType.roundRect, {
        x, y: 4.7, w: 2.15, h: 0.62, rectRadius: 0.08,
        fill: { color: INK2 }, line: { color: '3A4E5C', width: 0.75 },
      });
      s.addText(t, {
        isTextBox: true, x: x + 0.16, y: 4.7, w: 1.9, h: 0.62, margin: 0, valign: 'middle',
        fontFace: F, fontSize: 11, color: 'A9BAC4',
      });
    });
    s.addText('Bộ phận Quản lý vệ sinh · Bộ phận Sản xuất', {
      isTextBox: true, x: M, y: 6.5, w: 6.5, h: 0.3, margin: 0,
      fontFace: F, fontSize: 10.5, color: '7E909B',
    });
    s.addNotes('[KR] 청소 투입 직전 현장에서 5분. 날짜·진행자·참석인원을 먼저 적고 시작.\n[VN] Phổ biến 5 phút ngay trước khi vào làm. Ghi ngày, người phụ trách, số người rồi bắt đầu.');
  }

  /* ═══ 2. 3 điều bắt buộc ═══ */
  {
    const s = p.addSlide();
    head(s, 'HÔM NAY 01', '3 điều bắt buộc phải giữ hôm nay',
      'Chỉ cần giữ đúng 3 điều này là ngăn được phần lớn sự cố dị vật và nhiễm bẩn do vệ sinh.', 36);
    const items = [
      ['01', 'FaHandsBubbles', 'Rửa tay thật sạch', 'Tạo bọt xà phòng, rửa trên 30 giây,\nxả dưới vòi nước chảy,\nlau khô hoàn toàn rồi vào xưởng'],
      ['02', 'FaUserCheck', 'Buộc tóc gọn gàng', 'Buộc tóc, không để tóc lộ ra,\nkhông sờ tay lên tóc và mặt\ntrong khi làm vệ sinh'],
      ['03', 'FaBan', 'Không để rơi dị vật', 'Mảnh găng tay, mảnh giẻ lau,\nmiếng cọ, dụng cụ, đồ cá nhân\nkhông được sót lại trên dây chuyền'],
    ];
    const cw = (CW - 0.7) / 3;
    for (let i = 0; i < 3; i++) {
      const [no, ic, t, b] = items[i];
      const x = M + i * (cw + 0.35);
      card(s, p, x, 2.45, cw, 3.7);
      s.addText(no, {
        isTextBox: true, x: x + cw - 1.3, y: 2.6, w: 1.0, h: 0.6, margin: 0, align: 'right',
        fontFace: F, fontSize: 32, bold: true, color: GHOST,
      });
      await bubble(s, p, x + 0.42, 2.92, 0.95, ic);
      s.addText(t, {
        isTextBox: true, x: x + 0.32, y: 4.1, w: cw - 0.64, h: 0.45, margin: 0,
        fontFace: F, fontSize: 19, bold: true, color: INK,
      });
      s.addText(b, {
        isTextBox: true, x: x + 0.32, y: 4.68, w: cw - 0.6, h: 1.35, margin: 0,
        fontFace: F, fontSize: 12, color: MUTED, lineSpacingMultiple: 1.25,
      });
    }
    foot(s, 2);
    s.addNotes('[KR] 세 가지를 손가락으로 세면서 반복. 매주 같은 문장.\n[VN] Đếm ba điều bằng ngón tay, lặp lại cùng một câu mỗi tuần.');
  }

  /* ═══ 3. Kiểm tra vệ sinh cá nhân ═══ */
  {
    const s = p.addSlide();
    head(s, 'HÔM NAY 02', 'Kiểm tra vệ sinh cá nhân',
      'Trước khi vào hiện trường, mỗi người tự kiểm tra tình trạng của mình.', 36);
    const rows = [
      ['FaSoap', 'Đã rửa tay xong', 'Rửa rồi lau khô — chỉ đeo găng khi tay đã sạch'],
      ['FaShieldHalved', 'Vết thương: băng chống nước + găng', 'Có vết thương ở tay hoặc cánh tay thì phải che kín'],
      ['FaGem', 'Cấm trang sức · móng giả', 'Nhẫn · đồng hồ · bông tai · sơn móng — để ở phòng thay đồ'],
      ['FaMobileScreen', 'Dốc sạch túi quần áo', 'Cấm mang điện thoại, bút bi, kẹo, đồ cá nhân vào xưởng'],
    ];
    for (let i = 0; i < rows.length; i++) {
      const [ic, t, b] = rows[i];
      const y = 2.5 + i * 1.05;
      card(s, p, M, y, 6.5, 0.95);
      await bubble(s, p, M + 0.28, y + 0.19, 0.57, ic, { fill: INK });
      s.addText(t, {
        isTextBox: true, x: M + 1.05, y: y + 0.12, w: 5.3, h: 0.34, margin: 0,
        fontFace: F, fontSize: 15, bold: true, color: INK,
      });
      s.addText(b, {
        isTextBox: true, x: M + 1.05, y: y + 0.48, w: 5.3, h: 0.3, margin: 0,
        fontFace: F, fontSize: 11, color: MUTED,
      });
    }
    const rx = 7.45, rw = 5.18;
    card(s, p, rx, 2.5, rw, 4.05, { fill: INK, line: null, shadow: { blur: 18, opacity: 0.22 } });
    await bubble(s, p, rx + 0.42, 2.85, 0.72, 'FaTriangleExclamation', { fill: GOLD, iconColor: INK });
    s.addText('Khi nào phải báo ngay', {
      isTextBox: true, x: rx + 0.42, y: 3.76, w: rw - 0.84, h: 0.4, margin: 0,
      fontFace: F, fontSize: 19, bold: true, color: W,
    });
    s.addText('Nếu bạn hoặc người sống cùng có triệu chứng dưới đây,\nphải báo cho người phụ trách trước khi bắt đầu.', {
      isTextBox: true, x: rx + 0.42, y: 4.2, w: rw - 0.84, h: 0.6, margin: 0,
      fontFace: F, fontSize: 11.5, color: 'B9C7D0', lineSpacingMultiple: 1.2,
    });
    const tags = ['Tiêu chảy · đau bụng', 'Sốt', 'Nôn ói', 'Vết thương mưng mủ'];
    for (let i = 0; i < 4; i++) {
      const x = rx + 0.42 + (i % 2) * 2.2;
      const y = 4.95 + Math.floor(i / 2) * 0.62;
      pill(s, p, x, y, 2.0, 0.5, tags[i], { fill: INK2, color: W, fontSize: 11 });
    }
    s.addText('→ Sẽ được loại khỏi công việc vệ sinh hôm đó', {
      isTextBox: true, x: rx + 0.42, y: 6.12, w: rw - 0.84, h: 0.32, margin: 0,
      fontFace: F, fontSize: 12, bold: true, color: GOLD,
    });
    foot(s, 3);
    s.addNotes('[KR] 숨기면 전 라인 회수 사고가 된다. 신고는 절차임을 강조.\n[VN] Giấu bệnh có thể dẫn tới thu hồi cả lô hàng. Báo cáo là quy trình, không bị thiệt.');
  }

  /* ═══ 4. Lưu ý khi làm vệ sinh ═══ */
  {
    const s = p.addSlide();
    head(s, 'HÔM NAY 03', 'Lưu ý khi làm vệ sinh',
      'Nhớ theo 4 trục: hóa chất · thứ tự · dụng cụ · an toàn.', 36);
    const items = [
      ['FaFlask', 'Dùng đúng hóa chất', 'Đúng loại, đúng nồng độ quy định.\nCấm tự ý thay hoặc thêm', RED],
      ['FaTriangleExclamation', 'Không được pha trộn', 'Chlorine + axit = sinh khí độc.\nMỗi lần chỉ dùng một loại', REDD],
      ['FaBanSmoking', 'Cấm ăn uống · hút thuốc', 'Gồm cả kẹo cao su, kẹo, nước uống.\nChỉ được dùng ở nơi quy định', RED],
      ['FaListOl', 'Làm đúng thứ tự', 'Trên → dưới, sạch → bẩn,\nrãnh thoát nước làm sau cùng', INK],
      ['FaBrush', 'Dụng cụ đúng khu vực', 'Dụng cụ của rãnh thoát nước\nkhông dùng cho thiết bị, sàn', INK],
      ['FaPlugCircleXmark', 'Ngắt điện · nhiệt cao', 'Ngắt điện trước khi vệ sinh thiết bị.\nChờ chảo chiên, nồi hấp nguội', INK],
    ];
    const cw = (CW - 0.7) / 3;
    for (let i = 0; i < 6; i++) {
      const [ic, t, b, c] = items[i];
      const x = M + (i % 3) * (cw + 0.35);
      const y = 2.45 + Math.floor(i / 3) * 2.15;
      card(s, p, x, y, cw, 1.95);
      await bubble(s, p, x + 0.32, y + 0.32, 0.58, ic, { fill: c });
      s.addText(t, {
        isTextBox: true, x: x + 1.02, y: y + 0.34, w: cw - 1.3, h: 0.54, margin: 0, valign: 'middle',
        fontFace: F, fontSize: 14, bold: true, color: INK,
      });
      s.addText(b, {
        isTextBox: true, x: x + 0.32, y: y + 1.04, w: cw - 0.6, h: 0.78, margin: 0,
        fontFace: F, fontSize: 11.5, color: MUTED, lineSpacingMultiple: 1.15,
      });
    }
    foot(s, 4);
    s.addNotes('[KR] 세제 혼합 금지는 실제 가스 사고 사례로 설명. 젖은 바닥·롤러 돌발 기동도 매주 언급.\n[VN] Giải thích cấm pha trộn bằng ví dụ tai nạn khí độc. Nhắc thêm sàn ướt và máy chạy bất ngờ.');
  }

  /* ═══ 5. Kết thúc ═══ */
  {
    const s = p.addSlide();
    s.background = { color: INK };
    rings(s, p, 0.5, 7.3, [4.4, 2.9, 1.6], ['1A2B36', '223440', '2B3F4D']);
    await bubble(s, p, SW / 2 - 0.45, 1.05, 0.9, 'FaBowlFood', { fill: INK2, iconColor: GOLD });
    s.addText('TINH THẦN HÔM NAY', {
      isTextBox: true, x: M, y: 1.95, w: CW, h: 0.34, margin: 0, align: 'center',
      fontFace: F, fontSize: 12, bold: true, color: GOLD, charSpacing: 2,
    });
    s.addText('Gói mì chúng ta làm ra,\nhãy nghĩ như chính gia đình mình sẽ ăn.', {
      isTextBox: true, x: M, y: 2.5, w: CW, h: 1.7, margin: 0, align: 'center',
      fontFace: F, fontSize: 30, bold: true, color: W, lineSpacingMultiple: 1.3,
    });
    const recap = ['Tay thật sạch', 'Tóc gọn gàng', 'Dị vật = 0'];
    for (let i = 0; i < 3; i++) pill(s, p, 1.72 + i * 3.35, 4.65, 3.0, 0.82, recap[i], { fill: INK2, fontSize: 15 });
    s.addText('Xác nhận khu vực phụ trách → kiểm tra dụng cụ → bắt đầu · Xong việc tập trung tại đây để kiểm tra lần cuối', {
      isTextBox: true, x: M, y: 5.95, w: CW, h: 0.34, margin: 0, align: 'center',
      fontFace: F, fontSize: 12, color: 'A9BAC4',
    });
    s.addNotes('[KR] 마지막 문장은 매주 같이 읽고 끝낸다.\n[VN] Cùng đọc to câu cuối mỗi tuần rồi kết thúc.');
  }

  /* ═══ 6. 6 bước rửa tay ═══ */
  {
    const s = p.addSlide();
    badge(s, p, 'RỬA TAY');
    titleUnderBadge(s, '6 bước rửa tay · 30 giây', 'Mỗi bước 5 giây. Chỗ hay bỏ sót là đầu móng tay và cổ tay.');
    const steps = [
      ['Lòng bàn tay', 'Xoa hai lòng bàn tay vào nhau'],
      ['Mu bàn tay', 'Chà mu bàn tay và kẽ ngón'],
      ['Kẽ ngón tay', 'Đan các ngón tay rồi xoa'],
      ['Ngón cái', 'Xoay ngón cái trong lòng bàn tay'],
      ['Móng · đầu ngón', 'Cọ đầu ngón vào lòng bàn tay'],
      ['Cổ tay', 'Đừng quên cổ tay'],
    ];
    const cw = (CW - 1.0) / 6;
    for (let i = 0; i < 6; i++) {
      const x = M + i * (cw + 0.2);
      card(s, p, x, 2.45, cw, 2.45);
      numDot(s, p, x + (cw - 0.86) / 2, 2.72, 0.86, i + 1, { fill: i < 3 ? RED : INK, fontSize: 19 });
      s.addText(steps[i][0], {
        isTextBox: true, x: x + 0.06, y: 3.7, w: cw - 0.12, h: 0.3, margin: 0, align: 'center',
        fontFace: F, fontSize: 12, bold: true, color: INK,
      });
      s.addText(steps[i][1], {
        isTextBox: true, x: x + 0.06, y: 4.04, w: cw - 0.12, h: 0.8, margin: 0, align: 'center',
        fontFace: F, fontSize: 9.5, color: MUTED, lineSpacingMultiple: 1.12,
      });
    }
    card(s, p, M, 5.05, CW, 1.5, { fill: INK, line: null, shadow: { blur: 18, opacity: 0.2 } });
    const notes = [
      ['FaStopwatch', 'Trên 30 giây', 'Giữ bọt xà phòng khi rửa'],
      ['FaDroplet', 'Lau khô hoàn toàn', 'Tay ướt làm vi khuẩn lây nhanh hơn'],
      ['FaHand', 'Đeo găng lên tay sạch', 'Găng rách phải thay ngay'],
    ];
    for (let i = 0; i < 3; i++) {
      const x = M + 0.4 + i * 3.85;
      await bubble(s, p, x, 5.45, 0.66, notes[i][0], { fill: GOLD, iconColor: INK });
      s.addText(notes[i][1], {
        isTextBox: true, x: x + 0.86, y: 5.45, w: 2.9, h: 0.3, margin: 0,
        fontFace: F, fontSize: 14, bold: true, color: W,
      });
      s.addText(notes[i][2], {
        isTextBox: true, x: x + 0.86, y: 5.78, w: 2.95, h: 0.3, margin: 0,
        fontFace: F, fontSize: 10.5, color: 'B9C7D0',
      });
    }
    foot(s, 6);
    s.addNotes('[KR] 진행자가 6단계를 직접 1회 실연. 손톱 끝·손목 누락 방지.\n[VN] Người phụ trách làm mẫu 6 bước một lần, tránh bỏ sót đầu móng và cổ tay.');
  }

  /* ═══ 7. An toàn hóa chất ═══ */
  {
    const s = p.addSlide();
    badge(s, p, 'HÓA CHẤT');
    titleUnderBadge(s, 'An toàn hóa chất tẩy rửa', 'Trộn hóa chất khác công dụng sẽ sinh khí độc. Mỗi lần chỉ dùng một loại.');
    const chem = [
      ['Chất kiềm', 'Tẩy dầu mỡ (khu chảo chiên)', 'Kích ứng da — bắt buộc đeo găng cao su', RED],
      ['Chất axit', 'Tẩy cặn nước, cặn vôi', 'Ăn mòn kim loại — không để lâu', GOLD],
      ['Khử trùng gốc chlorine', 'Khử trùng dụng cụ, bề mặt (pha loãng)', 'Tuyệt đối không trộn với chất axit', REDD],
      ['Cồn 70%', 'Khử trùng tay, dụng cụ nhỏ', 'Không dùng gần nguồn lửa', INK],
    ];
    for (let i = 0; i < 4; i++) {
      const [n, u, c, col] = chem[i];
      const y = 2.45 + i * 1.05;
      card(s, p, M, y, 6.5, 0.95);
      s.addShape(p.ShapeType.ellipse, { x: M + 0.24, y: y + 0.28, w: 0.34, h: 0.34, fill: { color: col }, line: { type: 'none' } });
      s.addText([
        { text: n, options: { bold: true, color: INK, fontSize: 13 } },
        { text: '   ' + u, options: { color: MUTED, fontSize: 11.5 } },
      ], { isTextBox: true, x: M + 0.68, y: y + 0.12, w: 5.65, h: 0.34, margin: 0, fontFace: F });
      s.addText(c, {
        isTextBox: true, x: M + 0.68, y: y + 0.48, w: 5.65, h: 0.3, margin: 0,
        fontFace: F, fontSize: 11, color: REDD,
      });
    }
    const rx = 7.45, rw = 5.18;
    card(s, p, rx, 2.45, rw, 2.45, { fill: REDD, line: null, shadow: { blur: 18, opacity: 0.22 } });
    await bubble(s, p, rx + 0.42, 2.75, 0.66, 'FaTriangleExclamation', { fill: W, iconColor: REDD });
    s.addText('Tuyệt đối không pha trộn', {
      isTextBox: true, x: rx + 1.2, y: 2.75, w: rw - 1.5, h: 0.66, margin: 0, valign: 'middle',
      fontFace: F, fontSize: 18, bold: true, color: W,
    });
    s.addText([
      { text: 'Chlorine + chất axit', options: { bold: true } },
      { text: '  →  sinh khí clo\n', options: {} },
      { text: 'Chlorine + gốc amoniac', options: { bold: true } },
      { text: '  →  sinh khí độc\n', options: {} },
      { text: 'Chỉ pha trong bình quy định, đúng nồng độ', options: { color: 'FFE2D8' } },
    ], {
      isTextBox: true, x: rx + 0.42, y: 3.6, w: rw - 0.84, h: 1.15, margin: 0,
      fontFace: F, fontSize: 11.5, color: W, lineSpacingMultiple: 1.35,
    });
    card(s, p, rx, 5.1, rw, 1.45);
    s.addText('Bảo hộ bắt buộc khi vệ sinh', {
      isTextBox: true, x: rx + 0.35, y: 5.24, w: rw - 0.7, h: 0.3, margin: 0,
      fontFace: F, fontSize: 13.5, bold: true, color: INK,
    });
    const ppe = [['FaGlasses', 'Kính'], ['FaHand', 'Găng tay'], ['FaShoePrints', 'Ủng'], ['FaMaskFace', 'Khẩu trang']];
    for (let i = 0; i < 4; i++) {
      const x = rx + 0.35 + i * 1.18;
      await bubble(s, p, x + 0.12, 5.66, 0.5, ppe[i][0], { fill: INK });
      s.addText(ppe[i][1], {
        isTextBox: true, x: x - 0.12, y: 6.2, w: 1.0, h: 0.26, margin: 0, align: 'center',
        fontFace: F, fontSize: 9, color: MUTED,
      });
    }
    foot(s, 7);
    s.addNotes('[KR] 희석 농도표와 MSDS 위치를 손으로 가리켜 알려준다.\n[VN] Chỉ tận nơi bảng nồng độ pha và vị trí phiếu MSDS.');
  }

  /* ═══ 8. 9 bước theo thứ tự ═══ */
  {
    const s = p.addSlide();
    badge(s, p, 'THỨ TỰ');
    titleUnderBadge(s, '9 bước vệ sinh theo thứ tự', 'Đổi thứ tự sẽ làm bẩn lại nơi vừa lau xong.');
    const groups = [
      ['Chuẩn bị', RED, 'FaPlugCircleXmark', [['1', 'Ngắt điện · khóa nguồn (LOTO)'], ['2', 'Đưa sản phẩm, bao bì ra ngoài hoặc che phủ'], ['3', 'Dọn khô — hút bụi · quét']]],
      ['Rửa', INK, 'FaSprayCanSparkles', [['4', 'Rửa sơ bộ (áp lực thấp, tránh bắn nước)'], ['5', 'Bôi hóa chất + giữ đủ thời gian tác dụng'], ['6', 'Chà rửa — đến cả góc và khe']]],
      ['Hoàn tất', GOLD, 'FaClipboardCheck', [['7', 'Xả sạch · gạt hết nước'], ['8', 'Khử trùng rồi làm khô hoàn toàn'], ['9', 'Kiểm tra dị vật · độ nhạy máy dò kim loại']]],
    ];
    const cw = (CW - 0.7) / 3;
    for (let i = 0; i < 3; i++) {
      const [gname, gcol, gic, lines] = groups[i];
      const x = M + i * (cw + 0.35);
      card(s, p, x, 2.4, cw, 3.5);
      await bubble(s, p, x + 0.32, 2.66, 0.6, gic, { fill: gcol, iconColor: gcol === GOLD ? INK : W });
      s.addText(gname, {
        isTextBox: true, x: x + 1.05, y: 2.72, w: cw - 1.3, h: 0.48, margin: 0, valign: 'middle',
        fontFace: F, fontSize: 19, bold: true, color: INK,
      });
      lines.forEach((ln, j) => {
        const y = 3.5 + j * 0.76;
        numDot(s, p, x + 0.34, y, 0.42, ln[0], { fill: gcol, color: gcol === GOLD ? INK : W, fontSize: 12 });
        s.addText(ln[1], {
          isTextBox: true, x: x + 0.92, y: y - 0.08, w: cw - 1.18, h: 0.6, margin: 0, valign: 'middle',
          fontFace: F, fontSize: 11.5, color: INK, lineSpacingMultiple: 1.1,
        });
      });
    }
    const rules = ['Trên → dưới', 'Khu sạch → khu bẩn', 'Rãnh thoát nước sau cùng'];
    for (let i = 0; i < 3; i++) pill(s, p, M + i * (cw + 0.35), 6.05, cw, 0.6, rules[i], { fill: i === 2 ? REDD : INK, fontSize: 13.5 });
    foot(s, 8);
    s.addNotes('[KR] ⑨(이물 점검·금속검출기 감도)를 빠뜨리기 쉽다. 재가동 책임자 지정.\n[VN] Bước ⑨ hay bị bỏ sót. Chỉ định người chịu trách nhiệm trước khi chạy máy lại.');
  }

  /* ═══ 9. Điểm nguy hiểm theo công đoạn ═══ */
  {
    const s = p.addSlide();
    badge(s, p, 'THEO CÔNG ĐOẠN');
    titleUnderBadge(s, 'Điểm nguy hiểm khi vệ sinh theo công đoạn',
      'Kiểm tra cùng lúc với phân công khu vực — mỗi khu có nguy hiểm khác nhau.', 31);
    const zones = [
      ['FaWheatAwn', 'Trộn bột · phễu', 'Bụi bột · bột bám', 'Cấm xịt súng hơi, ưu tiên hút bụi'],
      ['FaGears', 'Cán bột · cắt sợi', 'Kẹt tay · máy chạy bất ngờ', 'Ngắt điện, khóa nguồn rồi mới làm'],
      ['FaWind', 'Nồi hấp', 'Nước ngưng tụ → nấm mốc', 'Xả áp, lau khô hoàn toàn'],
      ['FaFire', 'Chảo chiên · chụp hút', 'Dầu thừa · cháy · bỏng', 'Chờ nguội, làm sạch dầu ống hút'],
      ['FaSnowflake', 'Băng tải làm nguội', 'Đọng sương · dị vật rơi', 'Vệ sinh kết cấu phía trên trước'],
      ['FaJar', 'Khu rót gói gia vị', 'Nhiễm chéo chất gây dị ứng', 'Dọn khô bằng dụng cụ riêng'],
      ['FaBoxOpen', 'Đóng gói · ép mí', 'Mảnh màng · mảnh nhãn', 'Thu gom hết mảnh rồi đưa ra ngoài'],
      ['FaFaucetDrip', 'Sàn · rãnh thoát nước', 'Cặn dầu mỡ · côn trùng', 'Làm sau cùng, dùng dụng cụ riêng'],
    ];
    const cw = (CW - 0.75) / 4;
    for (let i = 0; i < 8; i++) {
      const [ic, n, risk, act] = zones[i];
      const x = M + (i % 4) * (cw + 0.25);
      const y = 2.45 + Math.floor(i / 4) * 2.15;
      card(s, p, x, y, cw, 1.95);
      await bubble(s, p, x + 0.26, y + 0.24, 0.52, ic, { fill: i % 2 ? INK : RED });
      s.addText(n, {
        isTextBox: true, x: x + 0.26, y: y + 0.84, w: cw - 0.46, h: 0.3, margin: 0,
        fontFace: F, fontSize: 12.5, bold: true, color: INK,
      });
      s.addText(risk, {
        isTextBox: true, x: x + 0.26, y: y + 1.14, w: cw - 0.46, h: 0.28, margin: 0,
        fontFace: F, fontSize: 10.5, bold: true, color: REDD,
      });
      s.addText(act, {
        isTextBox: true, x: x + 0.26, y: y + 1.42, w: cw - 0.46, h: 0.45, margin: 0,
        fontFace: F, fontSize: 10, color: MUTED, lineSpacingMultiple: 1.1,
      });
    }
    foot(s, 9);
    s.addNotes('[KR] 배정된 구역 칸만 짚어 읽어준다. 전체를 매주 읽지 않는다.\n[VN] Chỉ đọc ô của khu vực được phân công, không đọc hết mỗi tuần.');
  }

  await p.writeFile({ fileName: process.argv[2] || 'deck_vi.pptx' });
  console.log('OK - 9 slides');
}
main().catch(e => { console.error(e); process.exit(1); });
