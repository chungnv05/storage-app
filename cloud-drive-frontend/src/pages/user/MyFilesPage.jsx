function MyFilesPage() {
  // TODO(BACKEND): Chưa có API quản lý file/thư mục của user (route /files và /files/:folderId).
  // Cần nhóm API:
  //   - Liệt kê nội dung một thư mục (gốc hoặc theo folderId): id, tên, loại, kích thước,
  //     ngày tạo, thư mục cha; kèm đường dẫn breadcrumb của thư mục hiện tại.
  //   - Tạo thư mục; tải file lên (multipart) có kiểm tra hạn mức dung lượng của gói;
  //     tải file xuống / xem trước.
  //   - Chuyển file/thư mục vào thùng rác.
  //   - Chia sẻ / thu hồi chia sẻ cho tài khoản khác.
  //   - (Tuỳ chọn) đặt mật khẩu bảo vệ file/thư mục — phải kiểm tra phía server.
  //   - Thống kê dung lượng theo loại file cho trang gốc.
  // Chỉ dựng lại giao diện khi backend đã có các API tương ứng.
  return null;
}

export default MyFilesPage;
