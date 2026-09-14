# LưuTrữ — Hai prototype web tĩnh

- Người dùng: `dist/index.html`
- Quản trị: `dist/admin.html`
- HTML, Bootstrap 5.3.3 CSS đóng gói cục bộ, CSS tùy chỉnh và JavaScript thuần.
- Responsive: sidebar thu gọn trên điện thoại, thẻ đổi số cột, bảng cuộn ngang.

## Trải nghiệm

Mở website đã xuất bản hoặc phục vụ thư mục `dist` qua HTTP tĩnh. Hai trang phải dùng cùng origin để chia sẻ dữ liệu mẫu. Không có công đoạn build hoặc backend.

Trang đầu mở sẵn phiên dùng thử. Có thể đăng xuất để thử đăng nhập/đăng ký.

| Vai trò | Email | Mật khẩu mẫu |
|---|---|---|
| Người dùng Plus | nhatanh@demo.vn | Demo123! |
| Người dùng Free | minhanh@demo.vn | Demo123! |
| Người dùng Pro | hoangnam@demo.vn | Demo123! |
| Admin | admin@demo.vn | Demo123! |

## Các luồng

Người dùng: tạo tài khoản Free, đăng nhập/đăng xuất, sửa hồ sơ/email/điện thoại, ảnh đại diện, đổi mật khẩu; quản lý thư mục lồng nhau; tải nhiều tệp hoặc kéo thả; tìm theo tên; lọc loại; chia sẻ và thu hồi quyền; nhóm tài liệu riêng/được chia sẻ; xem thông báo và mở tài liệu tương ứng; xóa/khôi phục/xóa vĩnh viễn; mua gói mô phỏng; thống kê loại tệp và dung lượng.

Admin: tổng quan số tài khoản theo từng gói, danh sách/lọc/tìm kiếm, chi tiết dung lượng đã dùng/còn lại và tổng thanh toán, khóa/mở khóa, cấu hình GB/giá/khuyến mãi theo ngày, gửi thông báo riêng/toàn bộ và lịch sử gửi.

Thử chia sẻ: đăng nhập Nhật Anh, chia sẻ thư mục cho Minh Anh, đăng xuất rồi đăng nhập Minh Anh và mở thông báo. Có thể sử dụng hai tab; phiên tài khoản dùng sessionStorage và dữ liệu dùng localStorage cùng origin. Admin và user có phiên riêng.

## Phạm vi mô phỏng

- Không phải hệ thống xác thực hoặc lưu trữ production. Dùng dữ liệu thử; không dùng mật khẩu thật.
- Metadata, tài khoản mẫu và thông báo nằm trong localStorage. Nội dung tệp tải lên nằm trong IndexedDB trên thiết bị; không đồng bộ nhiều thiết bị. Trình duyệt có thể giới hạn dung lượng dưới hạn mức của gói.
- Tệp có sẵn là metadata minh họa. Ảnh/video tải lên có thể xem trước; tệp tải lên có thể tải xuống.
- Free 3 GB, Plus 10 GB, Pro 20 GB mặc định. Giá Plus 49.000đ/tháng, Pro 99.000đ/tháng chỉ minh họa, admin có thể thay đổi. Đổi gói thay hạn mức, không cộng dồn; không xử lý tiền thật hoặc gia hạn tự động.
- Thùng rác vẫn chiếm dung lượng cho đến khi xóa vĩnh viễn. Tệp quá 30 ngày được dọn khi ứng dụng mở hoặc đang chạy; không có tác vụ nền trên server.
- Chia sẻ cấp quyền xem/tải xuống. Quyền thư mục được kế thừa xuống con. Thông báo mở đúng tệp/thư mục; tài liệu đã xóa/thu hồi quyền sẽ hiện thông báo không truy cập được.
- Khóa tài khoản có hiệu lực trong mô phỏng trình duyệt, không phải kiểm soát truy cập backend.

## Kiểm tra

Đã kiểm tra cú pháp JavaScript, dựng HTML cho 10 màn hình và parse các action, kiểm tra logic chia sẻ kế thừa/thu hồi, tìm kiếm, xóa/khôi phục/quá hạn, đổi gói/thanh toán mẫu, gửi toàn bộ, khóa và đăng xuất. Chưa thực hiện kiểm thử trình duyệt trực quan.


## Cập nhật: mật khẩu và nội dung thư mục

- Nút **Mã hóa** có trên tệp và thẻ thư mục. Nhập mật khẩu tối thiểu 8 ký tự và xác nhận lại.
- Tệp tải lên được mã hóa thực sự bằng Web Crypto AES-GCM 256-bit; khóa được dẫn xuất từ mật khẩu bằng PBKDF2/SHA-256 với salt ngẫu nhiên. Nội dung mã hóa và IV nằm trong IndexedDB. Không lưu mật khẩu tệp hoặc khóa giải mã vào localStorage/sessionStorage.
- Thư mục bảo vệ toàn bộ nội dung con, kể cả nội dung có sẵn trong thùng rác và tệp được tải thêm sau này. Có thể đặt mật khẩu riêng cho một tệp hoặc thư mục con bên trong thư mục đã được bảo vệ.
- Khi mở nội dung, người sở hữu và người được chia sẻ đều phải nhập các mật khẩu cần thiết. Mở khóa chỉ giữ trong bộ nhớ của phiên trang. Bấm **Khóa lại**, đăng xuất hoặc tải lại trang để khóa lại.
- Tệp mẫu không có nội dung thật: chúng trình diễn luồng đặt/nhập mật khẩu. Muốn thử mã hóa nội dung, hãy tải một tệp nhỏ của bạn lên, mã hóa, khóa lại, nhập mật khẩu rồi tải xuống.
- Tên tệp, cấu trúc thư mục và metadata không được mã hóa. Chức năng chưa hỗ trợ bỏ/đổi/khôi phục mật khẩu mã hóa. Đây vẫn là bản mẫu chạy cục bộ, chưa phải giải pháp bảo mật production.
- Cần chạy qua HTTPS hoặc localhost để Web Crypto hoạt động. Không mở trực tiếp bằng file://; tham khảo HUONG-DAN.txt.
- Bấm toàn bộ phần chính của thẻ thư mục để mở. Hiển thị riêng **Thư mục con** và **Tệp trong thư mục** ở cấp hiện tại; có breadcrumb đầy đủ và nút **Lên một cấp**. Tìm kiếm/lọc trong thư mục chỉ xét các mục trực tiếp của thư mục đó.
- Dữ liệu mẫu bổ sung: Dự án & công việc → Thiết kế giao diện → Bản bàn giao; mỗi cấp có tệp riêng để thử.
- Đã kiểm tra logic mật khẩu đúng/sai, giải mã khôi phục đúng nội dung, từ chối ciphertext bị sửa, mã hóa nhiều lớp, tải tệp vào thư mục đã bảo vệ, chia sẻ, khôi phục và danh sách mục con/breadcrumb. Chưa chạy kiểm thử trình duyệt trực quan.
