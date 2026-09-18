# 위생교육 자료 생성 스크립트

PPT 파일은 모두 스크립트로 생성한다. 내용·디자인 수정은 해당 스크립트를 고쳐서 다시 실행한다.
(원본 파일을 직접 편집해도 되지만, 그 경우 스크립트와 내용이 달라진다)

## 준비

```bash
npm install pptxgenjs react react-dom react-icons sharp
python3 -m pip install pillow numpy
```

## 생성

```bash
# ① 교육 PPT 11장 (잉크네이비 + 오렌지 톤)
node build_deck.js "../청소전_위생교육_PPT.pptx"

# ② 현장 게시용 A4 1장
node build_poster.js "../청소전_위생교육_현장게시_A4.pptx"

# ③ 베트남어판 9장 (주차 구분 없음, 도구 색 구분 슬라이드 제외)
node build_deck_vi.js "../청소전_위생교육_PPT_베트남어.pptx"

# ④ 화이트&블루 시안 2·3장 — 배경 그라데이션 먼저 생성
python3 bg.py
node build_wb.js "../청소전_위생교육_화이트블루_2-3장.pptx"
```

## 글꼴

`build_wb.js` 는 제목용 / 본문용 글꼴 이름을 환경변수로 받는다.
PowerPoint 에서 다른 글꼴로 대체되어 보이면, 설치된 글꼴 이름을 그대로 넣어 다시 실행한다.

```bash
TITLE_FONT="한국기계연구원_Bold" BODY_FONT="에이투지체" node build_wb.js "../청소전_위생교육_화이트블루_2-3장.pptx"
```

기본값 : `한국기계연구원` / `에이투지체`

## 팔레트

| 파일 | 색 |
|---|---|
| build_deck.js, build_poster.js, build_deck_vi.js | 잉크네이비 `#13232F` · 오렌지레드 `#E4572E` · 골드 `#F2A541` |
| build_wb.js | 화이트 `#FFFFFF` · 블루 `#1C60EF` · 라이트블루 `#DBE8FE` |
