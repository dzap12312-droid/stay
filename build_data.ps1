$ErrorActionPreference = 'Stop'
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

# id, supplierName(VN), supplierNameKR, address(raw, as sourced), distanceKm, materialCategory(VN), materialDetail(KR)
$raw = @(
@{id=1;  vn='Công ty TNHH Hương liệu thực phẩm Việt Nam'; kr='베트남 식품향료'; addr='Quốc lộ 10, Xã Đông Sơn, Huyện Thuỷ Nguyên, TP. Hải Phòng (MST 0200566628)'; dist=150; matVN='Hương liệu & bột gia vị soup (bột hải sản, kimchi, cà ri...)'; matKR='스프 향료·조미분말류 (해산물·김치·카레 분말 등)'},
@{id=2;  vn='Công ty  TNHH Thiết bị máy móc Đại Chính Quang'; kr='다이찐꽝 기계설비'; addr='D8 - TT18 Đường Bạch Thái Bưởi KĐT Văn Quán - Yên Phúc, P. Hà Đông, TP. Hà Nộ'; dist=95; matVN='Vật tư tiêu hao thiết bị (mực in)'; matKR='설비 소모품 (프린터 잉크)'},
@{id=3;  vn='Công ty cổ phần nhựa cao cấp hàng không'; kr='항공고급플라스틱'; addr='Ngõ 200 Nguyễn Sơn, P. Bồ Đề, Q. Long Biên, Hà Nội [법인·생산장]'; dist=90; matVN='Vật tư đóng gói (nĩa nhựa)'; matKR='포장 부자재 (플라스틱 포크)'},
@{id=4;  vn='Công ty TNHH nhựa Tân lập Thành'; kr='떤럽타인 플라스틱'; addr='19 Triệu Quang Phục, TP Hồ Chí Minh, Việt Nam'; dist=1700; matVN='Vật tư đóng gói (nĩa nhựa)'; matKR='포장 부자재 (플라스틱 포크)'},
@{id=5;  vn='Công ty Cổ Phần Tiến Hưng'; kr='띠엔흥'; addr='KCN Tiên Sơn, Xã Hoàn Sơn, H. Tiên Du, Tỉnh Bắc Ninh (MST 2300223949)'; dist=100; matVN='Nguyên liệu mì (bột mì G4N)'; matKR='면 원재료 (밀가루 G4N)'},
@{id=6;  vn='Công ty Cổ phần VCCE'; kr='VCCE'; addr='Số 771 đường Quang Trung, Phường Kiến Hưng, TP. Hà Nội'; dist=100; matVN='Nhiên liệu (viên nén gỗ)'; matKR='연료 (우드펠릿)'},
@{id=7;  vn='Công ty TNHH chế biến thủy sản Phúc Hải'; kr='푹하이 수산가공'; addr='Thôn Phúc Thụy, Xã Hải Hà, Huyện Hải Hậu, Tỉnh Nam Định, Việt Nam'; dist=190; matVN='Nguyên liệu soup (nước mắm)'; matKR='스프 원료 (피시소스)'},
@{id=8;  vn='CÔNG TY CỔ PHẦN SẢN XUẤT THƯƠNG MẠI DỊCH VỤ TRƯỜNG PHÁT'; kr='쯔엉팟 생산무역서비스'; addr='Cụm Công nghiệp Hoàng Xá, Xã Tu Vũ, Tỉnh Phú Thọ, Việt Nam'; dist=45; matVN='Tinh bột (bột sắn dây)'; matKR='전분류 (칡전분)'},
@{id=9;  vn='Công Ty Cổ phần Hương Liệu và Nguyên Liệu Thực Phẩm Hoàng Anh'; kr='호앙아인 향료·식품원료'; addr='Lô B10 Khu công nghiệp Hiệp Phước, Xã Hiệp Phước, TP Hồ Chí Minh, Việt Nam'; dist=1650; matVN='Hương liệu (hương thịt, hải sản, rau củ)'; matKR='향료류 (육류·해산물·야채 향)'},
@{id=10; vn='Công ty TNHH Uniace Vina'; kr='유니에이스 비나'; addr='Phòng 409, Tầng 4, Toà nhà The Garden, Đường Mễ Trì, P. Mỹ Đình 1, Q. Nam Từ Liêm, Hà Nội (MST 0110392550)'; dist=90; matVN='Nguyên liệu soup & rau (chất điều vị, rau sấy, tinh bột)'; matKR='스프·야채 원료 (조미소재, 건조야채, 전분)'},
@{id=11; vn='Công ty TNHH WWRC Việt Nam'; kr='WWRC 베트남'; addr='6/8 Đường Nguyễn Ư Dĩ, Phường An Khánh, TP Hồ Chí Minh, Việt Nam'; dist=1700; matVN='Phụ gia mì (phosphate STPP)'; matKR='면 첨가물 (인산염 STPP)'},
@{id=12; vn='CÔNG TY TNHH MTV XĂNG DẦU DẦU KHÍ TÂY BẮC'; kr='떠이박 석유(주유)'; addr='Số nhà 17, Khu 11, Xã Phù Ninh, Tỉnh Phú Thọ, Việt Nam'; dist=8; matVN='Nhiên liệu (dầu diesel)'; matKR='연료 (경유)'},
@{id=13; vn='Công ty TNHH thương mại đầu tư Phát triển Navico'; kr='나비코 무역투자개발'; addr='51/6B ấp 4, Xã Đông Thạnh, TP Hồ Chí Minh, Việt Nam'; dist=1700; matVN='Nguyên liệu soup (bột ngọt MSG)'; matKR='스프 원료 (MSG)'},
@{id=14; vn='Công ty TNHH Thắng Thịnh Phú Thọ'; kr='탕틴 푸토'; addr='Số 190, phố Tân An, Phường Tân Dân, Thành phố Việt Trì, Tỉnh Phú Thọ, Việt Nam.'; dist=20; matVN='Dầu mỡ (dầu ăn)'; matKR='유지류 (식용유)'},
@{id=15; vn='Công ty TNHH Peroma Việt Nam'; kr='페로마 베트남'; addr='Lô A1-1 KCN Tân Kim, Khu phố Tân Phước, Xã Cần Giuộc, Tỉnh Tây Ninh, Việt Nam'; dist=1650; matVN='Hương liệu (hương chanh)'; matKR='향료류 (레몬향)'},
@{id=16; vn='Công ty cổ phần thương mại Phạm Phan'; kr='팜판 무역'; addr='48 Lê Văn Quới, Phường Bình Trị Đông, TP Hồ Chí Minh, Việt Nam'; dist=1700; matVN='Bột gia vị soup & hương liệu'; matKR='스프 조미분말·향료류'},
@{id=17; vn='CÔNG TY TNHH SẢN XUẤT VÀ THƯƠNG MẠI QTS'; kr='QTS 생산무역'; addr='Thôn Nhuệ, Xã Hoài Đức, TP Hà Nội, Việt Nam'; dist=100; matVN='Vật tư đóng gói (túi PE)'; matKR='포장 부자재 (PE 봉투)'},
@{id=18; vn='CÔNG TY CỔ PHẦN BMP GROUP'; kr='BMP 그룹'; addr='Số 12 VSIP II-A, Đường Số 26, KCN Việt Nam - Singapore II-A, P. Vĩnh Tân, TP. Tân Uyên, Bình Dương [공장]'; dist=1650; matVN='Màng bao bì (màng gói mì & soup)'; matKR='포장 필름류 (면·스프 포장필름)'},
@{id=19; vn='CHI NHÁNH CÔNG TY TNHH IC FOOD SONLA TẠI THÀNH PHỐ HỒ CHÍ MINH'; kr='IC푸드 손라 호치민지점'; addr='Lầu 3, số 322 Tây Thạnh, Phường Tây Thạnh, TP Hồ Chí Minh, Việt Nam'; dist=1700; matVN='Bột gia vị soup (bột thịt bò, seasoning gà cay...)'; matKR='스프 조미분말류 (소고기 분말,불닭시즈닝 등)'},
@{id=20; vn='CHI NHÁNH CÔNG TY TNHH KIẾN VƯƠNG TẠI HƯNG YÊN'; kr='끼엔브엉 흥옌지점'; addr='Lô số CN3-1, Khu công nghiệp Minh Quang, Phường Bạch Sam, Thị xã Mỹ Hào, Tỉnh Hưng Yên, Việt Nam'; dist=125; matVN='Phụ gia thực phẩm soup (chất điều chỉnh độ acid, đường)'; matKR='스프 식품첨가물 (산미료·당류)'},
@{id=21; vn='CÔNG TY TNHH SILESIA FLAVOURS (VIỆT NAM)'; kr='실레시아 플레이버 베트남'; addr='Số 2A-4A, Đường Tôn Đức Thắng, Phường Sài Gòn, TP Hồ Chí Minh, Việt Nam'; dist=1700; matVN='Hương liệu (hương pizza)'; matKR='향료류 (피자향)'},
@{id=22; vn='CÔNG TY TNHH NARUCO VINA'; kr='나루코 비나'; addr='Tầng 08, Tòa nhà IDMC Duy Tân, số 21 Duy Tân, Phường Cầu Giấy, TP Hà Nội, Việt Nam'; dist=90; matVN='Bột gia vị soup'; matKR='스프 조미분말류'},
@{id=23; vn='CÔNG TY TNHH BẮC HÀ'; kr='박하'; addr='Số 188A - 188B, đường Võ Nguyên Giáp, Tổ dân phố Song Khê, Phường Tiền Phong, Tỉnh Bắc Ninh, Việt Nam'; dist=100; matVN='Nguyên liệu mì (tinh bột khoai mì)'; matKR='면 원재료 (타피오카 전분)'},
@{id=24; vn='CÔNG TY CỔ PHẦN FI SAIGON'; kr='FI 사이공'; addr='17 Huỳnh Đình Hai, Phường Bình Thạnh, TP Hồ Chí Minh, Việt Nam'; dist=1700; matVN='Phụ gia mì'; matKR='면 첨가물'},
@{id=25; vn='CÔNG TY TNHH BAO BÌ NM VIỆT NAM'; kr='NM 포장재 베트남'; addr='Số 2 đường TS6, KCN Tiên Sơn, Xã Tiên Du, Tỉnh Bắc Ninh [공장]'; dist=100; matVN='Màng bao bì'; matKR='포장 필름류'},
@{id=26; vn='CÔNG TY CỔ PHẦN XUẤT NHẬP KHẨU UYÊN VY'; kr='우옌비 수출입'; addr='86/58 Phổ Quang, Phường Tân Sơn Hòa, TP Hồ Chí Minh, Việt Nam'; dist=1700; matVN='Phụ gia thực phẩm soup (chất điều chỉnh độ acid, chống đông vón)'; matKR='스프 식품첨가물 (산미료·고결방지제)'},
@{id=27; vn='CÔNG TY CỔ PHẦN DƯỢC PHÚC THÁI'; kr='푹타이 제약'; addr='Lô số Cn10, khu công nghiệp Phú Nghĩa, Xã Phú Nghĩa, Thành phố Hà Nội, Việt Nam.'; dist=120; matVN='Phụ gia thực phẩm soup (acid succinic)'; matKR='스프 식품첨가물 (숙신산)'},
@{id=28; vn='CÔNG TY CỔ PHẦN NGUYÊN LIỆU THỰC PHẨM MONOVA'; kr='모노바 식품원료'; addr='Lô I/6, Đường số 4, Khu công nghiệp Vĩnh Lộc, Phường Bình Tân, TP Hồ Chí Minh, Việt Nam'; dist=1700; matVN='Hương liệu (hương ớt, sả)'; matKR='향료류 (고추·레몬그라스향)'},
@{id=29; vn='CÔNG TY CỔ PHẦN TẬP ĐOÀN TRÂN CHÂU'; kr='쩐쩌우 그룹'; addr='99P Cộng Hòa, Phường Tân Sơn Nhất, TP Hồ Chí Minh, Việt Nam'; dist=1700; matVN='Bột gia vị (đinh hương)'; matKR='향신료 분말 (정향)'},
@{id=30; vn='Công ty TNHH IC Food Việt Nam'; kr='IC푸드 베트남'; addr='Bản Suối Lìn, Xã Vân Hồ, Tỉnh Sơn La, Việt Nam'; dist=240; matVN='Rau củ (bắp cải sấy, rau muối)'; matKR='야채류 (건조 양배추·절임채소)'},
@{id=31; vn='CÔNG TY CỔ PHẦN ĐẦU TƯ CÔNG NGHỆ GEEKTEK'; kr='긱텍 기술투자'; addr='47A Lê Trọng Tấn, Phường Tân Sơn Nhì, TP Hồ Chí Minh, Việt Nam'; dist=1700; matVN='Vật phẩm khác (thiết bị điện tử)'; matKR='기타 비품 (전자제품)'},
@{id=32; vn='CÔNG TY TNHH FOODCHEM VIỆT NAM'; kr='푸드켐 베트남'; addr='25/49/25 Đường số 6, Phường Hiệp Bình, TP Hồ Chí Minh, Việt Nam'; dist=1700; matVN='Nguyên liệu soup (bột ngọt MSG)'; matKR='스프 원료 (MSG)'},
@{id=33; vn='CHI NHÁNH CÔNG TY TNHH IC FOOD VIETNAM TẠI THÀNH PHỐ HỒ CHÍ MINH'; kr='IC푸드 베트남 호치민지점'; addr='Lầu 3, số 322 Tây Thạnh, Phường Tây Thạnh, TP Hồ Chí Minh, Việt Nam'; dist=1700; matVN='Bột gia vị soup'; matKR='스프 조미분말류'},
@{id=34; vn='Công ty Cổ phần sản xuất Tân Thành'; kr='떤타인 생산'; addr='Đường 196, thôn Hoàng Nha, Xã Lạc Đạo, Tỉnh Hưng Yên, Việt Nam'; dist=120; matVN='Phụ gia mì (chất kiềm K2CO3)'; matKR='면 첨가물 (알칼리제 K2CO3)'},
@{id=35; vn='CÔNG TY CỔ PHẦN CÔNG NGHỆ THỰC PHẨM HỒNG DƯƠNG'; kr='홍즈엉 식품기술'; addr='Km 50 +250, bắc quốc lộ 5A, Phường Việt Hòa, TP Hải Phòng, Việt Nam'; dist=145; matVN='Nguyên liệu soup (muối tinh luyện)'; matKR='스프 원료 (정제소금)'},
@{id=36; vn='CÔNG TY TNHH JL GLOBAL FOODS'; kr='JL 글로벌푸드'; addr='27C Quốc Hương, Phường An Khánh, TP Hồ Chí Minh, Việt Nam'; dist=1700; matVN='Gia vị (hạt tiêu)'; matKR='향신료 (후추)'},
@{id=37; vn='CÔNG TY TNHH VẬN TẢI PHÚC LINH'; kr='푹린 운송'; addr='Số 13 ngõ 312 đường Ngô Gia Tự, phố Ngô Quyền, Phường Hoa Lư'; dist=165; matVN='Nhiên liệu (viên nén gỗ)'; matKR='연료 (우드펠릿)'},
@{id=38; vn='CÔNG TY TNHH MTV NATO VIỆT NAM'; kr='나토 베트남'; addr='Số 16/3, ngõ 390 đường Nguyễn Văn Cừ, Phường Bồ Đề, TP Hà Nội'; dist=90; matVN='Nhiên liệu (viên nén gỗ)'; matKR='연료 (우드펠릿)'},
@{id=39; vn='Công ty TNHH bao bì YFY Hà Nam'; kr='YFY 하남 포장재'; addr='Một phần lô J, KCN Đồng Văn II, P. Bạch Thượng, TX Duy Tiên, Hà Nam (MST 0700802249)'; dist=145; matVN='Bao bì thùng (thùng carton)'; matKR='포장 박스류 (카톤 박스)'},
@{id=40; vn='Chi nhánh Công ty TNHH Roha Dyechem Việt Nam tại Hà Nội'; kr='로하다이켐 베트남 하노이지점'; addr='Tầng 4 Tòa nhà Thái Lâm Plaza, số 52 đường Thanh Liệt, Thôn Vực, Phường Định Công, TP Hà Nội, Việt Nam'; dist=95; matVN='Phụ gia & chất tạo màu thực phẩm (capsicum)'; matKR='식품첨가물·착색료 (캡시쿰)'},
@{id=41; vn='Công ty Ajinomoto Việt Nam'; kr='아지노모토 베트남'; addr='KCN Biên Hòa I, P. Trấn Biên, TP. Biên Hòa, Tỉnh Đồng Nai (MST 3600244645)'; dist=1650; matVN='Nguyên liệu điều vị soup (chất tăng vị, đạm thực vật)'; matKR='스프 조미소재 (정미강화제, 식물성단백)'},
@{id=42; vn='Công ty TNHH Sản xuất và Thương mại Tấn Cường'; kr='떤끄엉 생산무역'; addr='Số 36B ngõ 158 phố Nguyễn Sơn, Phường Bồ Đề, TP Hà Nội, Việt Nam'; dist=90; matVN='Vật tư đóng gói (băng keo OPP)'; matKR='포장 부자재 (OPP 테이프)'},
@{id=43; vn='Công ty Cổ phần Thương mại và Công nghệ Thực phẩm Hoàng Lâm'; kr='호앙럼 식품기술무역'; addr='CCN Hà Mãn - Trí Quả, Xã Xuân Lâm, TX Thuận Thành, Tỉnh Bắc Ninh [공장]'; dist=105; matVN='Nguyên liệu soup (bột kem)'; matKR='스프 원료 (분말크림)'},
@{id=44; vn='Công ty Cổ phần Chế biến Nông sản Thực phẩm Tân Hương'; kr='떤흐엉 농산식품가공'; addr='Đội 7, thôn Văn Thai, Xã Cẩm Văn, H. Cẩm Giàng, Tỉnh Hải Dương (MST 0800645991)'; dist=130; matVN='Rau & gia vị (hành lá sấy, bột gừng, bột ớt...)'; matKR='야채·향신료류 (건조 대파, 생강·고추 분말 등)'},
@{id=45; vn='Công ty TNHH Sản xuất Bột mỳ VIMAFLOUR'; kr='비마플라워 제분'; addr='KCN Cái Lân, P. Bãi Cháy, TP. Hạ Long, Tỉnh Quảng Ninh (MST 5700101210)'; dist=220; matVN='Nguyên liệu mì (bột mì)'; matKR='면 원재료 (밀가루)'},
@{id=46; vn='Công ty TNHH Anphachem'; kr='안파켐'; addr='Lô H4-2, Đường N3, KCN Đông Nam, Xã Bình Mỹ, H. Củ Chi, TP. Hồ Chí Minh [공장]'; dist=1700; matVN='Phụ gia mì & bột soup (bột phô mai)'; matKR='면 첨가물·스프 분말 (치즈분말)'},
@{id=47; vn='Công ty Cổ phần Hóa chất Á Châu'; kr='아주화학'; addr='Lô K4B, KCN Lê Minh Xuân, Đường Số 4, Xã Bình Lợi, TP. Hồ Chí Minh (MST 0304918352)'; dist=1700; matVN='Nguyên liệu mì & soup (gluten, tinh bột, phụ gia, bột rau)'; matKR='면·스프 원료 (글루텐, 전분, 첨가물, 야채분말)'},
@{id=48; vn='Công ty TNHH Brenntag Việt Nam'; kr='브렌탁 베트남'; addr='Lô 7, Đường TS9, KCN Tiên Sơn, Xã Đại Đồng, Tỉnh Bắc Ninh [박닌 지점·물류기지]'; dist=100; matVN='Phụ gia mì (CMC)'; matKR='면 첨가물 (CMC)'},
@{id=49; vn='Công ty TNHH Wilmar Marketing CLV'; kr='윌마 마케팅 CLV'; addr='Tầng 2 và Tầng 10, Tòa nhà CornerStone, số 16 Phan Chu Trinh, Q. Hoàn Kiếm, Hà Nội (MST 0104128741)'; dist=90; matVN='Bột mì & dầu mỡ (dầu cọ, dầu đậu nành, dầu mè)'; matKR='밀가루·유지류 (팜유, 대두유, 참기름)'},
@{id=50; vn='CÔNG TY TNHH TM PHỔ BÌNH'; kr='포빈 무역'; addr='289 Lũy Bán Bích, Phường Phú Thạnh, Thành phố Hồ Chí Minh, Việt Nam.'; dist=1700; matVN='Phụ gia mì (gum guar)'; matKR='면 첨가물 (구아검)'},
@{id=51; vn='Công ty TNHH Sản xuất & Kinh doanh Minh Khánh'; kr='민카인 생산판매'; addr='Số 289, đường Nguyễn Văn Linh, Phường Phúc Lợi, Thành phố Hà Nội'; dist=95; matVN='Nguyên liệu soup (muối tinh luyện)'; matKR='스프 원료 (정제소금)'},
@{id=52; vn='Công ty TNHH thương mại dịch vụ Đạt Mỹ'; kr='닷미 무역서비스'; addr='12-14, Khu dân cư An Lạc Đường số 16, Phường An Lạc, TP Hồ Chí Minh, Việt Nam'; dist=1700; matVN='Vật tư tiêu hao thiết bị (mực in)'; matKR='설비 소모품 (프린터 잉크)'},
@{id=53; vn='Công ty TNHH lương thực Hà Việt'; kr='하비엣 식량'; addr='Km số 9, quốc lộ 1A Pháp Vân, Phường Yên Sở, TP Hà Nội, Việt Nam'; dist=100; matVN='Nguyên liệu soup (dầu mỡ, bột)'; matKR='스프 원료 (유지·분말)'},
@{id=54; vn='Công ty TNHH In Đại Thành'; kr='다이타인 인쇄'; addr='P3-a7, khu tập thể du lịch 12, Ngõ 279 Đội Cấn, P. Liễu Giai, Q. Ba Đình, Hà Nội (MST 0105831989)'; dist=90; matVN='Vật tư in ấn (tem nhãn)'; matKR='인쇄 부자재 (라벨 스티커)'},
@{id=55; vn='Công ty cổ phần Đức Hiếu'; kr='득히에우'; addr='Tổ dân phố Ngọc Lâm, P. Đường Hào, Tỉnh Hưng Yên (MST 0900234441)'; dist=125; matVN='Màng bao bì'; matKR='포장 필름류'},
@{id=56; vn='Công ty cổ phần đầu tư và sản xuất nông sản Trình Nhi'; kr='찐니 농산투자생산'; addr='Lô F2, KCN Phú Hội, Xã Phú Hội, H. Đức Trọng, Tỉnh Lâm Đồng (MST 0313903296)'; dist=1650; matVN='Rau củ (rau sấy, kimchi)'; matKR='야채류 (건조 야채·김치)'},
@{id=57; vn='CÔNG TY TRÁCH NHIỆM HỮU HẠN TRƯỜNG HƯNG'; kr='쯔엉흥'; addr='Ấp Thạnh Hưng, Xã Tân Châu, Tỉnh Tây Ninh, Việt Nam'; dist=1750; matVN='Nguyên liệu mì (tinh bột biến tính)'; matKR='면 원재료 (변성전분)'},
@{id=58; vn='CÔNG TY TNHH HÓA CHẤT & THỰC PHẨM'; kr='화학·식품'; addr='106/10 Đường Phan Văn Trị, Phường Bình Thạnh, TP Hồ Chí Minh, Việt Nam'; dist=1700; matVN='Nguyên liệu topping (đạm thực vật TVP)'; matKR='건더기류 (식물성 단백 TVP)'},
@{id=59; vn='Công ty TNHH IC Food Sonla'; kr='IC푸드 손라'; addr='Bản Suối Lìn, Xã Vân Hồ, Tỉnh Sơn La, Việt Nam'; dist=240; matVN='Rau củ (bắp cải sấy, rau muối)'; matKR='야채류 (건조 양배추·절임채소)'},
@{id=60; vn='CÔNG TY TNHH SẢN XUẤT THƯƠNG MẠI G.B.C.O'; kr='G.B.C.O 생산무역'; addr='20 Đường 14, Khu Phố 3, Phường An Khánh, TP Hồ Chí Minh, Việt Nam'; dist=1700; matVN='Nguyên liệu mì & soup (gluten, phụ gia, MSG)'; matKR='면·스프 원료 (글루텐, 첨가물, MSG)'},
@{id=61; vn='Công ty TNHH Taixin Printing Vina'; kr='타이신 프린팅 비나'; addr='Số 19, đường 11, KCN - Đô thị và Dịch vụ VSIP Bắc Ninh, Xã Đại Đồng, H. Tiên Du, Tỉnh Bắc Ninh (MST 2300373253)'; dist=100; matVN='Vật tư đóng gói (ly giấy cỡ nhỏ)'; matKR='포장 부자재 (소컵 용기)'},
@{id=62; vn='Công ty TNHH MTV Thương Mại Ngân Đăng'; kr='응언당 무역'; addr='Số 7/28 ngõ 20, đường Phạm Văn Đồng, Phường Tứ Minh, Thành phố Hải Phòng, Việt Nam ; Tình ...'; dist=125; matVN='Gia vị & rau (tỏi, hành tây tươi, bột ớt)'; matKR='향신료·야채류 (생마늘·양파, 고추분말)'},
@{id=63; vn='CÔNG TY TNHH HENGSAN VIỆT NAM'; kr='헹산 베트남'; addr='Số 4, Tầng 1, Tòa OCT1 ĐN1 X1, Tổ 53, Phường Định Công, TP Hà Nội, Việt Nam'; dist=95; matVN='Rau sấy & rong biển'; matKR='건조 야채·해조류'},
@{id=64; vn='Công ty cổ phần bao bì công nghệ Thuận Phát'; kr='투언팟 포장기술'; addr='Thôn Kim Tháp, Xã Nguyệt Đức, Thị xã Thuận Thành, Tỉnh Bắc Ninh (MST 2301148282)'; dist=105; matVN='Bao bì thùng (thùng carton)'; matKR='포장 박스류 (카톤 박스)'},
@{id=65; vn='Công ty TNHH Semba - NFC Việt Nam'; kr='셈바-NFC 베트남'; addr='Số 6-7 Đường Phan Tôn, Phường Tân Định, TP Hồ Chí Minh, Việt Nam'; dist=1700; matVN='Nguyên liệu soup (màu caramel)'; matKR='스프 원료 (카라멜 색소)'},
@{id=66; vn='Chi nhánh Hà Nội - Công ty TNHH Vĩnh Nam Anh'; kr='빈남아인 하노이지점'; addr='Số nhà LK04, Khu nhà ở thấp tầng Ngõ 38 đường Xuân La, Phường Xuân Đỉnh, TP Hà Nội, Việt Nam'; dist=90; matVN='Phụ gia thực phẩm soup (chất điều chỉnh độ acid, đường)'; matKR='스프 식품첨가물 (산미료·당류)'},
@{id=67; vn='Công ty cổ phần Công nghệ phẩm Ba Đình'; kr='바딘 공업제품'; addr='Số 39, phố Phó Đức Chính, Phường Ba Đình, TP Hà Nội, Việt Nam'; dist=90; matVN='Nguyên liệu điều vị & hương soup (I+G, chiết xuất nấm)'; matKR='스프 조미소재·향료 (I+G, 버섯추출물)'},
@{id=68; vn='Công ty TNHH Neo Nam Việt'; kr='네오 남비엣'; addr='72/2B Bành Văn Trân, Phường Tân Sơn Nhất, TP Hồ Chí Minh, Việt Nam'; dist=1700; matVN='Nguyên liệu mì (tinh bột biến tính)'; matKR='면 원재료 (변성전분)'},
@{id=69; vn='CÔNG TY TNHH PHỤ GIA THỰC PHẨM VIỆT NAM'; kr='베트남 식품첨가물'; addr='Nhà số 5, ngách 49/16 phố Trần Cung, Phường Nghĩa Đô, TP Hà Nội, Việt Nam'; dist=90; matVN='Phụ gia mì & soup (chất làm đặc, chất tạo ngọt)'; matKR='면·스프 첨가물 (증점제, 감미료)'},
@{id=70; vn='CÔNG TY TNHH SAMHWA VIỆT NAM'; kr='삼화 베트남'; addr='Lô CN07, Khu công nghiệp Cẩm Khê, Xã Cẩm Khê, Tỉnh Phú Thọ, Việt Nam'; dist=45; matVN='Bột gia vị soup (bột tương ớt gochujang)'; matKR='스프 조미분말류 (고추장 분말)'},
@{id=71; vn='Công ty Cổ phần Xuất nhập khẩu Đại Cát Lợi'; kr='다이깟러이 수출입'; addr='22/76 Cư xá Lữ Gia, Đường Lữ Gia, Phường Phú Thọ, TP Hồ Chí Minh, Việt Nam'; dist=1700; matVN='Phụ gia mì (chất kiềm K2CO3, Na2CO3)'; matKR='면 첨가물 (알칼리제 K2CO3·Na2CO3)'},
@{id=72; vn='Công ty TNHH xuất nhập khẩu New Life'; kr='뉴라이프 수출입'; addr='Số 5 ngõ 65, phố Mai Dịch, Phường Phú Diễn, TP Hà Nội, Việt Nam'; dist=90; matVN='Phụ gia mì (vitamin B2 - riboflavin)'; matKR='면 첨가물 (비타민 B2) 리보플라빈'},
@{id=73; vn='CÔNG TY TNHH NAM PHƯƠNG V.N'; kr='남프엉 V.N'; addr='260 Nguyễn Thái Sơn, Phường Hạnh Thông, TP Hồ Chí Minh, Việt Nam'; dist=1700; matVN='Gia vị (hạt tiêu)'; matKR='향신료 (후추)'},
@{id=74; vn='Công ty TNHH Phương Anh PT'; kr='프엉아인 PT'; addr='Khu Thống Nhất, Xã Cẩm Khê, Tỉnh Phú Thọ, Việt Nam.'; dist=45; matVN='Nhiên liệu (viên nén gỗ)'; matKR='연료 (우드펠릿)'},
@{id=75; vn='Công ty Cổ phần bao bì nhựa Thiên Hà'; kr='티엔하 플라스틱 포장재'; addr='Tổ dân phố Lường, Phường Bạch Sam, Thị xã Mỹ Hào, Tỉnh Hưng Yên (MST 0900213804)'; dist=125; matVN='Màng bao bì (màng gói mì & soup)'; matKR='포장 필름류 (면·스프 포장필름)'},
@{id=76; vn='Công ty TNHH DKSH Performance Materials Việt Nam'; kr='DKSH 퍼포먼스 머티리얼즈 베트남'; addr='Tầng 8, Tòa nhà Viettel Complex, 285 Cách Mạng Tháng Tám, Phường Hòa Hưng, TP Hồ Chí Minh, Việt Nam'; dist=1700; matVN='Hương liệu húng quế'; matKR='바질 향료'},
@{id=77; vn='Công ty Cổ phần hàng tiêu dùng Biên Hòa'; kr='비엔호아 소비재'; addr='Số 224, Đường Hà Huy Giáp, Phường Trấn Biên, TP Đồng Nai, Việt Nam'; dist=1650; matVN='Nguyên liệu soup (đường)'; matKR='스프 원료 (설탕)'},
@{id=78; vn='CÔNG TY TNHH LTF VIỆT NAM'; kr='LTF 베트남'; addr='Tầng 4, Số 11, Lô Ơ 2, Bán đảo Linh Đàm, Phường Hoàng Liệt, TP Hà Nội, Việt Nam'; dist=95; matVN='Vật tư đóng gói (màng co POF, túi)'; matKR='포장 부자재 (POF 수축필름, 봉투)'},
@{id=79; vn='CÔNG TY TNHH DỊCH VỤ VÀ KỸ THUẬT SÁNG TẠO'; kr='창조기술서비스'; addr='Số 346/29 Đường Bình Lợi, Phường Bình Lợi Trung, TP Hồ Chí Minh, Việt Nam'; dist=1700; matVN='Vật tư tiêu hao thiết bị (mực ribbon)'; matKR='설비 소모품 (리본 잉크)'},
@{id=80; vn='CÔNG TY TNHH THƯƠNG MẠI VÀ SẢN XUẤT PA VIỆT NAM'; kr='PA 베트남 무역생산'; addr='Số 4, ngách 30, ngõ 134, đường Thạch Bàn, Phường Long Biên, TP Hà Nội, Việt Nam'; dist=90; matVN='Vật tư in ấn (tem nhãn)'; matKR='인쇄 부자재 (라벨 스티커)'},
@{id=81; vn='Công ty TNHH Achiva Việt Nam'; kr='아치바 베트남'; addr='Số 2L, phố Hoàng Hoa Thám, Phường Tây Hồ, TP Hà Nội, Việt Nam'; dist=90; matVN='Vật tư đóng gói (băng keo OPP)'; matKR='포장 부자재 (OPP 테이프)'},
@{id=82; vn='Công ty cổ phần bao bì Tân Tiến'; kr='떤띠엔 포장재'; addr='Lô II4-II5-II10-II11, cụm 4, nhóm CN II, KCN Tân Bình, Đường số 13, P. Tây Thạnh, Q. Tân Phú, TP. Hồ Chí Minh (MST 0300391040)'; dist=1700; matVN='Vật tư đóng gói (nắp ly, màng)'; matKR='포장 부자재 (컵 뚜껑, 필름)'},
@{id=83; vn='CÔNG TY TNHH THỰC PHẨM RONG BIỂN'; kr='해조류식품'; addr='38/10A Trần Khắc Chân, Phường Tân Định, TP Hồ Chí Minh, Việt Nam'; dist=1700; matVN='Rong biển (lá kim sấy)'; matKR='해조류 (건조 김)'},
@{id=84; vn='CÔNG TY TNHH YEONGIL INDUSTRIAL EQUIPMENT VIỆT NAM'; kr='영일산업기계 베트남'; addr='Tầng 6 Tòa nhà VNPT, số 33 Lý Thái Tổ, Phường Kinh Bắc, Tỉnh Bắc Ninh, Việt Nam'; dist=100; matVN='Vật tư tiêu hao thiết bị (mực in, dung môi)'; matKR='설비 소모품 (인쇄잉크, 용제)'},
@{id=85; vn='Công ty Cổ phần Phú Mai Anh'; kr='푸마이아인'; addr='2/4 Lê Lai, Phường Bảy Hiền, TP Hồ Chí Minh, Việt Nam'; dist=1700; matVN='Phụ gia mì & soup (chất chống oxy hóa...)'; matKR='면·스프 첨가물 (산화방지제 등)'},
@{id=86; vn='Công ty TNHH Vật Tư Công nghệ phẩm TTN'; kr='TTN 공업제품자재'; addr='Kiot số 7, Tầng 1, Tòa CT2 Khu đô thị Bắc Linh Đàm, Phường Định Công, TP Hà Nội, Việt Nam'; dist=95; matVN='Phụ gia mì & bột soup (chất nhũ hóa, bột phô mai)'; matKR='면 첨가물·스프 분말 (유화제, 치즈분말)'},
@{id=87; vn='Công ty TNHH Lâm Hải Đăng'; kr='럼하이당'; addr='13A Đường TL44, Phường An Phú Đông, TP Hồ Chí Minh, Việt Nam'; dist=1700; matVN='Phụ gia thực phẩm soup (natri succinate)'; matKR='스프 식품첨가물 (숙신산나트륨)'},
@{id=88; vn='Công ty Cổ phần Trường Thịnh'; kr='쯔엉틴'; addr='Khu Hành Chính Hưng Tiến, Xã Đoan Hùng, Tỉnh Phú Thọ, Việt Nam'; dist=70; matVN='Nhiên liệu (viên nén gỗ)'; matKR='연료 (우드펠릿)'}
)

$outDir = "D:\생산지원\본부장님 숙제\supplier-map"
Write-Output "Total records: $($raw.Count)"

function Get-LocationType($addr) {
    if ($addr -match '\[법인·생산장\]') { return 'factory_and_office' }
    if ($addr -match '\[공장\]') { return 'factory' }
    if ($addr -match '\[박닌 지점·물류기지\]') { return 'branch' }
    return 'unknown'
}

function Get-AddressTag($addr) {
    if ($addr -match '\[([^\]]+)\]') { return $matches[1] }
    return $null
}

function Get-GeocodeQuery($addr) {
    $q = $addr -replace '\[[^\]]*\]', ''
    $q = $q -replace '\(MST[^)]*\)', ''
    $q = $q -replace '\s+', ' '
    $q = $q.Trim().Trim(',').Trim('.').Trim()
    if ($q -notmatch '(?i)viet ?nam|việt nam') { $q = "$q, Việt Nam" }
    return $q
}

$headers = @{ 'User-Agent' = 'PaldoVina-PhuTho-SupplierMap/1.0 (internal factory logistics mapping tool)' }

$suppliers = New-Object System.Collections.ArrayList
$geoLog = New-Object System.Collections.ArrayList

foreach ($r in $raw) {
    $locType = Get-LocationType $r.addr
    $tag = Get-AddressTag $r.addr
    $query = Get-GeocodeQuery $r.addr

    $lat = $null
    $lon = $null
    $status = 'manual_required'
    $displayName = $null

    try {
        $encQ = [uri]::EscapeDataString($query)
        $url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=vn&q=$encQ"
        $resp = Invoke-RestMethod -Uri $url -Headers $headers -Method Get -TimeoutSec 15
        if ($resp -and $resp.Count -gt 0) {
            $lat = [double]$resp[0].lat
            $lon = [double]$resp[0].lon
            $status = 'geocoded'
            $displayName = $resp[0].display_name
        } else {
            $status = 'failed'
        }
    } catch {
        $status = 'failed'
        Write-Output "  [ERROR] id=$($r.id): $($_.Exception.Message)"
    }

    Write-Output "id=$($r.id) status=$status query=[$query] -> $lat,$lon"
    [void]$geoLog.Add([PSCustomObject]@{ id=$r.id; query=$query; status=$status; lat=$lat; lon=$lon; displayName=$displayName })

    $obj = [ordered]@{
        id = $r.id
        supplierName = $r.vn
        supplierNameKR = $r.kr
        address = $r.addr
        addressTag = $tag
        locationType = $locType
        distanceKm = $r.dist
        reportedDistanceKm = $r.dist
        calculatedRoadDistanceKm = $null
        distanceDifferenceKm = $null
        materialCategory = $r.matVN
        materialDetail = $r.matKR
        latitude = $lat
        longitude = $lon
        locationVerified = $false
        locationStatus = $status
        moq = $null
        deliveryUnit = $null
        vehicleType = $null
        vehicleCBM = $null
        deliveryFrequencyPerWeek = $null
        deliveryDays = @()
        loadingRate = $null
        notes = ''
    }
    [void]$suppliers.Add($obj)

    Start-Sleep -Milliseconds 1100
}

$json = $suppliers | ConvertTo-Json -Depth 6
[System.IO.File]::WriteAllText("$outDir\data\suppliers.json", $json, $utf8NoBom)

$logJson = $geoLog | ConvertTo-Json -Depth 4
[System.IO.File]::WriteAllText("$outDir\geocode_log.json", $logJson, $utf8NoBom)

$okCount = ($geoLog | Where-Object { $_.status -eq 'geocoded' }).Count
$failCount = ($geoLog | Where-Object { $_.status -eq 'failed' }).Count
Write-Output "Done. Geocoded: $okCount / $($raw.Count), Failed: $failCount"
