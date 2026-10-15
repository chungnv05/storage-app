function AdminProfilePage() {
  // TODO(BACKEND): Chưa có API hồ sơ cho tài khoản admin (route /admin/profile).
  // GET/PATCH /api/user/me hiện yêu cầu role USER (SecurityConfig: /api/user/** hasRole USER),
  // nên admin sẽ nhận 403 nếu dùng chung ProfilePage.
  // Cần API (role ADMIN) đọc và cập nhật hồ sơ của chính admin: họ tên, email, số điện thoại.
  // Chỉ dựng lại giao diện khi backend đã có API tương ứng.
  return null;
}

export default AdminProfilePage;
