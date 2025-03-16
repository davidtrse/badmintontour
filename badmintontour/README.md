tôi cần viết 1 app reactjs về quản lý trận đấu giải cầu lông, có 2 nhánh và 4 nhóm:
npx create-next-app@latest		Nhánh 2: Bảng C	
[ROLEX] Minh-P.Hiếu		[ROLEX] a Hồng-Đạt	
[ROLEX] Đạt-Tú		[ROLEX] Ngọc Hiếu-Quang	
[TD] Hoàng-Hiếu		[Panda] Cung-Tuyên	
			
			
			
Nhánh 1: Bảng B		Nhánh 2: Bảng D	
[ROLEX] a Hoàng Anh-Thành		[ROLEX] Thương-Sơn	
[ROLEX] Bella-Hiệp		[ROLEX] a Cường-a Ninh	
[TD] Tùng-Tiến		[Panda] Vũ-Thịnh	

vòng bảng, đánh vòng tròn tìm ra 01 đội cao điểm nhất nhì, nếu bằng điểm thì so sánh hiệu số bàn thắng, thua
vòng tứ kết, nhất bảng A gặp Nhì bảng B, nhất bảng B gặp nhì A, nhất C gặp nhì D, nhất D gặp nhì C, tìm ra 4 cặp chiến thắng vào bán kết

vòng bán kết, nhất nhánh A đánh nhì nhánh B, nhất nhánh B đánh nhì nhánh A, phân loại nhất nhì nhánh bằng thủ công cho user chọn người thắng thua.

chung kết và tranh giải 3

tôi cũng cần bạn lên sơ đồ thi đấu

lưu data vào indexDB sao cho refresh không mất, cần có 1 nút để reset data khi cần. cần có nút test automation