# Việc cần làm ở backend

Danh sách những việc backend cần bổ sung để frontend dựng lại các chức năng đang để trống
(các trang `return null` và các comment `TODO(BACKEND)` trong `cloud-drive-frontend`).
Mỗi mục gồm: vấn đề, endpoint đề xuất và hướng implement.

Đường dẫn và tên lớp trong tài liệu này chỉ là đề xuất. Khi implement xong, hãy báo lại
hợp đồng API thật (method, URL, DTO, mã lỗi) để frontend tích hợp theo đúng code.

Thứ tự ưu tiên:

| # | Hạng mục | Mức ưu tiên | Frontend đang chờ |
|---|---|---|---|
| 0 | Sửa các API hiện có | Cao — làm trước | Profile, Plans, Admin Users/Packages |
| 1 | Quản lý file và thư mục | Cao | `MyFilesPage` |
| 2 | Thùng rác | Cao | `TrashPage` |
| 3 | Chia sẻ file | Trung bình | `SharedPage` |
| 4 | Thống kê admin thật | Trung bình | 3 thẻ đã gỡ ở Admin Dashboard |
| 5 | Mua gói và thanh toán | Trung bình | Nút chọn gói ở `PlansPage` |
| 6 | Admin cấu hình gói và giá | Trung bình | Nút "Cấu hình gói" ở `AdminPackagesPage` |
| 7 | Thông báo | Thấp | `NotificationsPage`, `AdminBroadcastPage` |
| 8 | Hồ sơ admin | Thấp | `AdminProfilePage` |
| 9 | Đổi mật khẩu, avatar | Thấp | Phần đã gỡ ở `ProfilePage` |

---

## Quy ước chung (áp dụng cho mọi mục)

- **Cấu trúc package:** giữ theo kiểu hiện có, mỗi tính năng có các package con
  `controller / dto / service / repository / entity`. Ví dụ: `org.clouddrive.file.*`,
  `org.clouddrive.notification.*`.
- **DTO:** dùng `record` cho response, như `UserResponse` và `StatResponse`. Request có
  ràng buộc thì đặt annotation validation lên DTO và **luôn có `@Valid`** ở controller.
- **Lỗi:** mỗi lỗi nghiệp vụ là một exception riêng (ví dụ `FileNotFoundException`,
  `StorageQuotaExceededException`), được xử lý trong `GlobalHandleException` và trả về
  `ProblemDetail` (`title`, `detail`, `errors`). Frontend hiện đọc đúng ba trường này.
  Gợi ý mã lỗi:
  - `404` khi không tìm thấy tài nguyên, hoặc tài nguyên không thuộc user đang gọi.
    Không trả `403` trong trường hợp này để tránh lộ việc tài nguyên đó tồn tại.
  - `409` khi trùng tên.
  - `413` hoặc `409` khi vượt hạn mức dung lượng.
- **Xác định user hiện tại:** luôn lấy từ `jwt.getSubject()` rồi gọi
  `userRepository.findByKeycloakUserId(...)`, giống `UserController`. Không bao giờ nhận
  `userId` của chính mình từ request.
- **Chống IDOR:** mọi truy vấn file phải lọc theo chủ sở hữu, ví dụ
  `findByIdAndOwnerId(id, ownerId)`. Không dùng `findById` rồi mới kiểm tra quyền sau.
- **Phân trang:** API trả danh sách có thể dài (file, user, thông báo) nên nhận
  `Pageable` và trả `Page<...>`. Hoặc dùng một record `PageResponse<T>(content, page,
  size, totalElements)` để JSON ổn định hơn.
- **Schema:** `ddl-auto: validate` nghĩa là Hibernate không tự tạo bảng, bạn phải tự viết
  `CREATE TABLE` cho mọi entity mới. Nên cân nhắc thêm **Flyway** (`flyway-core` +
  `flyway-mysql`) để quản lý migration có version, thay vì chạy script tay.
- **Security:** thêm rule mới vào `SecurityConfig` đúng theo nhóm path `/api/user/**`
  (USER) hoặc `/api/admin/**` (ADMIN). Nếu đặt path mới ngoài hai nhóm này, chúng sẽ rơi
  vào `anyRequest().authenticated()`, nghĩa là mọi role đều gọi được. Hãy chủ động quyết
  định điều đó.

---

## 0. Sửa các API hiện có

### 0.1 `PATCH /api/user/me` không validate và ghi đè null

**Vấn đề:**
- Controller thiếu `@Valid`, nên các ràng buộc `@Email` và `@Pattern` trong
  `UserRequest` không có tác dụng.
- `UserService.updateUserInfo` gán thẳng cả 3 trường. Request thiếu `email` sẽ ghi
  `null` vào cột `NOT NULL`, gây lỗi 500.
- Cột `full_name` dài 100 ký tự, nhưng DTO cho phép tới 255.

**Hướng implement:**
- Thêm `@Valid` vào `@RequestBody UserRequest`.
- Chọn một trong hai ngữ nghĩa và ghi rõ:
  - **PUT (thay toàn bộ):** đổi DTO thành record với `@NotBlank` cho `fullName` và
    `email`.
  - **PATCH (cập nhật một phần):** chỉ cập nhật trường nào khác `null`. Khi đó cần
    truyền giá trị cũ vào `keycloakAdminClient.updateUser` cho các trường không đổi.
- Sửa `@Size(max = 100)` cho `fullName` để khớp DB.
- Đổi email cần kiểm tra trùng trước (`existsByEmail`, loại trừ chính user đó) và trả
  `409` qua `InfoAlreadyExistsException`. Ràng buộc unique ở DB vẫn là chốt chặn cuối.
- Ghi chú: `KeycloakAdminClient.updateUser` đang bỏ qua `phone`. Nếu muốn đồng bộ số
  điện thoại sang Keycloak, hãy đưa nó vào `attributes`.

### 0.2 `GET /api/user/packages` và `/api/admin/packages` trả trùng gói

**Vấn đề:** `findAllActivePackagesWithPrice` JOIN với **mọi** dòng `packages_pricing`
mà không lọc theo thời gian. Gói có lịch sử giá sẽ xuất hiện nhiều lần. Frontend đang
phải tự gộp và tự chọn dòng giá còn hiệu lực.

**Hướng implement:**
- Thêm điều kiện thời gian vào query. Dùng cùng quy ước với `PackagePricing.isValidAt`:
  `validFrom` tính là đã bao gồm, `validTo` thì không.
  ```sql
  WHERE p.active = true
    AND pp.validFrom <= :now
    AND (pp.validTo IS NULL OR pp.validTo > :now)
  ```
- Trả thêm `effectivePrice`, tính ở backend bằng `PackagePricing.effectivePrice()`, để
  công thức chỉ tồn tại ở một chỗ.
- Thêm `ORDER BY p.storageLimitBytes`.
- Có thể đổi projection interface sang record `StoragePackageResponse(id, name,
  storageLimitBytes, basePrice, discountPercent, effectivePrice, validFrom, validTo)` và
  dùng JPQL constructor expression `SELECT new ...`.
- Gói chưa có dòng giá còn hiệu lực: quyết định ẩn đi (giữ INNER JOIN), hoặc vẫn trả về
  với giá `null` (dùng LEFT JOIN và đưa điều kiện thời gian vào `ON`).

### 0.3 `UserResponse` thiếu `packageId`

**Vấn đề:** frontend phải ghép user với gói bằng **tên gói**. Cách này dễ sai khi đổi tên
gói.

**Hướng implement:** thêm trường `Long packageId` vào `UserResponse` và lấy giá trị từ
`storagePackage.getId()`.

### 0.4 `GET /api/admin/users`: N+1 query, không phân trang

**Vấn đề:**
- `findAllByRole` không có `@EntityGraph`. Mỗi user lại kích hoạt thêm một query nạp
  `storagePackage` (đang "chạy được" chỉ vì `spring.jpa.open-in-view` mặc định bật).
- API không có phân trang.

**Hướng implement:**
- Thêm `@EntityGraph(attributePaths = "storagePackage")` cho `findAllByRole`.
- Đặt `@Transactional(readOnly = true)` cho `AdminService.getAllUsers`.
- Đặt `spring.jpa.open-in-view: false` để lỗi lazy lộ ra ngay khi dev.
- Nhận `Pageable`, cùng tham số lọc và tìm kiếm tuỳ chọn (`q`, `packageId`, `status`).
  Có thể dùng `Specification` hoặc query JPQL có điều kiện.

### 0.5 `PUT /api/admin/users/{userId}/status` khoá được cả admin

**Vấn đề:** `findById` lấy bất kỳ user nào, kể cả tài khoản ADMIN và chính admin đang
thao tác.

**Hướng implement:**
- Chỉ cho đổi trạng thái user có `role = USER`, ví dụ dùng
  `findByIdAndRole(userId, Role.USER)`.
- Từ chối khi `keycloakUserId` của user mục tiêu trùng với `jwt.getSubject()`.
- Khi khoá tài khoản, nên gọi thêm `POST /admin/realms/{realm}/users/{id}/logout` của
  Keycloak để huỷ các phiên đang mở. Nếu không, access token đã cấp vẫn còn hạn.

---

## 1. Quản lý file và thư mục (ưu tiên cao nhất)

### Entity `FileNode` (bảng `files`)

File và thư mục dùng chung một bảng theo cấu trúc cây.

| Trường | Kiểu | Ghi chú |
|---|---|---|
| `id` | `BIGINT` PK | |
| `owner` | `@ManyToOne(LAZY) User` | `owner_id`, NOT NULL |
| `parent` | `@ManyToOne(LAZY) FileNode` | `parent_id`, `null` = thư mục gốc |
| `name` | `VARCHAR(255)` | |
| `type` | enum `FOLDER` / `FILE` | |
| `mimeType` | `VARCHAR(127)` | `null` với thư mục |
| `category` | enum `DOCUMENT`/`IMAGE`/`VIDEO`/`OTHER` | Tính từ mime khi upload, phục vụ lọc theo loại |
| `sizeBytes` | `BIGINT` | `0` với thư mục |
| `storageKey` | `VARCHAR(500)` | Đường dẫn hoặc key trên storage. Không trả ra ngoài |
| `deletedAt` | `DATETIME` | `null` = chưa xoá. Dùng cho thùng rác |
| `createdAt`, `updatedAt` | `DATETIME` | `@CreationTimestamp` / `@UpdateTimestamp` |

Thêm index `(owner_id, parent_id, deleted_at)`. Kiểm tra trùng tên trong cùng thư mục ở
tầng service, vì MySQL không có unique index có điều kiện kiểu `WHERE deleted_at IS NULL`.

### Lưu nội dung file

Tạo interface `StorageService` với các hàm `store(InputStream, key, size)`,
`load(key) -> Resource` và `delete(key)`. Có hai cách implement:

- `LocalFileStorageService`: ghi xuống thư mục cấu hình `app.storage.root`. Phù hợp khi
  dev.
- `S3StorageService` (MinIO hoặc S3): dùng khi deploy thật, có thể thêm service MinIO vào
  `docker-compose.yml`.

Lưu ý khi đặt key và nhận file:
- Đặt `storageKey` là UUID, **không dùng tên file gốc**, để tránh path traversal và trùng
  lặp.
- Cấu hình `spring.servlet.multipart.max-file-size` và `max-request-size`.

### Endpoint (role USER)

| Method | URL | Mô tả |
|---|---|---|
| GET | `/api/user/files?parentId=&page=&size=&sort=` | Liệt kê con trực tiếp (chưa xoá) của thư mục. `parentId` trống = thư mục gốc |
| GET | `/api/user/files/{id}` | Metadata của file/thư mục, kèm `breadcrumb: [{id, name}]` |
| GET | `/api/user/files/search?q=&category=` | Tìm theo tên hoặc loại trong toàn bộ file của user |
| GET | `/api/user/files/stats` | Dung lượng và số lượng theo `category` (trang gốc dùng để hiển thị thống kê) |
| POST | `/api/user/files/folders` | Body `{ name, parentId }` → `201` + `FileNodeResponse` |
| POST | `/api/user/files/upload` | `multipart/form-data`: `file`, `parentId` → `201` + `FileNodeResponse` |
| GET | `/api/user/files/{id}/download` | Trả stream nội dung file |
| PATCH | `/api/user/files/{id}` | Đổi tên hoặc di chuyển: `{ name?, parentId? }` |
| DELETE | `/api/user/files/{id}` | Chuyển vào thùng rác (xoá mềm), `204` |

### Hướng implement

**Kiểm tra hạn mức khi upload.** Hai request upload song song có thể cùng vượt hạn mức
nếu kiểm tra kiểu "đọc rồi ghi". Hãy cập nhật dung lượng bằng một câu UPDATE nguyên tử:
```java
@Modifying
@Query("""
    UPDATE User u SET u.storageUsedBytes = u.storageUsedBytes + :size
    WHERE u.id = :userId
      AND u.storageUsedBytes + :size <= u.storagePackage.storageLimitBytes
""")
int reserveStorage(Long userId, long size);
```
Hibernate có thể không hỗ trợ đường dẫn qua quan hệ trong câu UPDATE. Khi đó dùng
subquery hoặc native query. Nếu số dòng bị ảnh hưởng là `0` thì ném
`StorageQuotaExceededException`.

**Thứ tự upload:**
1. Giữ chỗ dung lượng.
2. Ghi file lên storage.
3. Lưu `FileNode`.
4. Nếu bước 2 hoặc 3 lỗi: hoàn lại dung lượng và xoá file trên storage. Cách xử lý
   giống kiểu rollback Keycloak trong `RegistrationService`.

**Download:**
- Trả về `ResponseEntity<Resource>` với header
  `Content-Disposition: attachment; filename*=UTF-8''...` (dùng `ContentDisposition`
  builder để mã hoá tên tiếng Việt).
- Đặt `Content-Type` theo `mimeType`.
- CORS đã expose sẵn `Content-Disposition`.

**Di chuyển thư mục:** không được chuyển một thư mục vào chính nó hoặc vào thư mục con
của nó. Hãy đi ngược chuỗi `parent` từ thư mục đích để kiểm tra.

**Breadcrumb:** đi ngược theo `parent` (độ sâu thường nhỏ). Nếu cây sâu, dùng
recursive CTE của MySQL 8.

**Mật khẩu bảo vệ file/thư mục:** giao diện cũ có tính năng này (tuỳ chọn). Nếu làm, hãy
lưu hash BCrypt trong `FileNode`, kiểm tra ở server, và cấp quyền mở khoá ngắn hạn. Không
bao giờ trả hash ra ngoài.

---

## 2. Thùng rác

### Endpoint (role USER)

| Method | URL | Mô tả |
|---|---|---|
| GET | `/api/user/trash?page=&size=` | Các mục **gốc** đã xoá: id, name, type, sizeBytes, deletedAt, `purgeAt` |
| POST | `/api/user/trash/{id}/restore` | Khôi phục mục và các mục con của nó |
| DELETE | `/api/user/trash/{id}` | Xoá vĩnh viễn |
| DELETE | `/api/user/trash` | Dọn sạch thùng rác |

### Hướng implement

**Xoá mềm:**
- Khi xoá một thư mục, gán **cùng một giá trị `deletedAt`** cho cả thư mục và mọi mục con
  còn sống.
- Lúc khôi phục, chỉ khôi phục những mục có đúng `deletedAt` đó. Các mục con đã bị xoá
  riêng từ trước vẫn nằm trong thùng rác.
- Danh sách thùng rác chỉ hiển thị mục gốc: những mục đã xoá mà cha của nó chưa bị xoá,
  hoặc có `deletedAt` khác với cha.

**Khôi phục khi thư mục cha cũng đang trong thùng rác (hoặc đã mất):** khôi phục về thư
mục gốc, hoặc khôi phục luôn cả chuỗi thư mục cha. Hãy chọn một cách và ghi rõ trong API.
Nếu trùng tên với mục đang có ở nơi khôi phục, tự đổi tên (ví dụ `abc (1)`) hoặc trả
`409`.

**Xoá vĩnh viễn:**
1. Xoá các dòng DB (cả mục con).
2. Trừ `storageUsedBytes` bằng tổng `sizeBytes`.
3. Xoá nội dung trên storage **sau khi** transaction commit, dùng
   `TransactionSynchronization.afterCommit` hoặc
   `@TransactionalEventListener(phase = AFTER_COMMIT)`.

**Tự dọn sau 30 ngày:**
- Thêm `@EnableScheduling` và một job `@Scheduled(cron = "0 0 3 * * *")` xoá các mục có
  `deletedAt < now - 30 ngày`.
- Đưa số ngày giữ lại thành cấu hình, ví dụ `app.trash.retention-days: 30`.
- Trả `purgeAt` về cho frontend thay vì để frontend tự tính.

**Dung lượng của file trong thùng rác:** nên **vẫn tính** vào `storageUsedBytes` cho tới
khi xoá vĩnh viễn (giống Google Drive), để tránh lạm dụng thùng rác.

---

## 3. Chia sẻ file

### Entity `FileShare` (bảng `file_shares`)

Các trường: `id`, `file` (`FileNode`), `sharedWith` (`User`), `permission` (enum
`VIEW`, có thể thêm `EDIT` sau), `createdAt`. Thêm unique `(file_id, shared_with_id)`.

### Endpoint

| Method | URL | Mô tả |
|---|---|---|
| POST | `/api/user/files/{id}/shares` | Body `{ email, permission }`: chia sẻ cho user theo email |
| GET | `/api/user/files/{id}/shares` | Danh sách người đang được chia sẻ (chỉ chủ sở hữu xem được) |
| DELETE | `/api/user/files/{id}/shares/{userId}` | Thu hồi chia sẻ |
| GET | `/api/user/shared?page=&size=` | Các mục người khác chia sẻ trực tiếp cho tôi, kèm thông tin chủ sở hữu (`ownerName`, `ownerEmail`) và `sharedAt` |
| GET | `/api/user/shared/{folderId}/children` | Nội dung bên trong một thư mục được chia sẻ |

### Hướng implement

- **Kiểm tra quyền đọc:** viết một hàm dùng chung `canRead(user, fileNode)`. Hàm trả đúng
  khi user là chủ sở hữu, hoặc khi **file đó hay một thư mục tổ tiên của nó** được chia
  sẻ cho user và chưa bị xoá. Dùng hàm này cho download, liệt kê và breadcrumb, để mọi
  điểm truy cập kiểm tra quyền theo cùng một cách.
- **Khi chia sẻ:**
  - Không cho chia sẻ cho chính mình hoặc cho tài khoản `LOCKED`.
  - Email không tồn tại: trả `404` với thông báo chung chung, để không thành công cụ dò
    xem email nào đã đăng ký.
- **Tách endpoint download cho file được chia sẻ:** dùng `canRead` thay cho kiểm tra chủ
  sở hữu. Có thể tái dùng `/api/user/files/{id}/download`, miễn là service gọi `canRead`.
- **Gửi thông báo:** khi chia sẻ thành công, tạo một thông báo cho người nhận (xem mục 7).

---

## 4. Thống kê admin thật (`GET /api/admin/stats`)

**Vấn đề:** `AdminService.getStats` đang gán cứng `paidUsers`, `storageUsedBytes`,
`storageLimitBytes` và `totalPaidAmount` bằng `0`.

**Hướng implement:** thêm các query aggregate vào repository.

- `paidUsers`: đếm user role USER có gói khác gói mặc định (`app.default-package`), hoặc
  đang có subscription còn hạn sau khi làm mục 5.
  ```java
  @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role AND u.storagePackage.name <> :defaultPackage")
  ```
- `storageUsedBytes`: `SELECT COALESCE(SUM(u.storageUsedBytes), 0) FROM User u WHERE u.role = USER`.
- `storageLimitBytes`: `SELECT COALESCE(SUM(u.storagePackage.storageLimitBytes), 0) ...`.
- `totalPaidAmount`: tổng `amount` của các payment có trạng thái `PAID` (cần mục 5).
  Lưu ý kiểu dữ liệu: `StatResponse` đang dùng `long`, nên đổi sang `BigDecimal` cho
  thống nhất với cột tiền `DECIMAL(15,2)`.

Nếu cần biểu đồ "người dùng theo gói" chính xác mà không phải tải toàn bộ user, thêm
`GET /api/admin/stats/packages` trả `[{ packageId, packageName, userCount }]`, dùng
`GROUP BY`.

---

## 5. Mua và đổi gói

### Entity

`Payment` (hoặc `Subscription`) với các trường: `id`, `user`, `storagePackage`,
`pricing` (`PackagePricing` áp dụng lúc mua), `amount` (`BigDecimal`, chốt tại thời điểm
mua), `status` (`PENDING` / `PAID` / `FAILED` / `CANCELLED`), `createdAt`, `paidAt`,
`periodStart`, `periodEnd`.

### Endpoint (role USER)

| Method | URL | Mô tả |
|---|---|---|
| POST | `/api/user/subscriptions` | Body `{ packageId }` → tạo đơn và trả về thông tin thanh toán |
| GET | `/api/user/subscriptions` | Lịch sử mua gói của tôi |
| POST | `/api/payments/callback` (hoặc IPN) | Endpoint cổng thanh toán gọi về. Phải `permitAll` và xác thực chữ ký |

### Hướng implement

**Tính giá ở server.** Lấy dòng giá đang hiệu lực, tính tiền bằng `effectivePrice()` và
lưu lại `pricing_id` cùng `amount`. Không bao giờ nhận giá tiền từ client.

**Kiểm tra trước khi tạo đơn:**
- Gói phải đang active và có giá đang hiệu lực.
- Nếu là hạ gói, `storageUsedBytes` phải nhỏ hơn hoặc bằng hạn mức của gói mới. Nếu
  không, trả `409` kèm thông điệp rõ ràng.

**Thanh toán:**
- Bản thật: tích hợp VNPay hoặc MoMo. Trả `paymentUrl` cho frontend redirect, sau đó
  xác nhận qua callback hoặc IPN có kiểm tra chữ ký và tính idempotent (một đơn chỉ được
  chuyển sang `PAID` một lần).
- Bản tạm cho môi trường dev: endpoint `POST /api/user/subscriptions/{id}/confirm` chỉ
  bật bằng profile `dev` (`@Profile("dev")`), để không vô tình chạy ở production.

**Khi thanh toán xong:** trong cùng một transaction, chuyển payment sang `PAID` và đổi
`user.storagePackage`. Gửi thông báo "Đã kích hoạt gói ..." (mục 7).

**Hết hạn gói:** job `@Scheduled` hằng ngày đưa user có `periodEnd` đã qua về gói mặc
định. Nếu dữ liệu đang vượt hạn mức gói mặc định, chỉ chặn upload, không xoá dữ liệu.

---

## 6. Admin cấu hình gói và giá

### Endpoint (role ADMIN)

| Method | URL | Mô tả |
|---|---|---|
| POST | `/api/admin/packages` | Tạo gói `{ name, storageLimitBytes }` |
| PATCH | `/api/admin/packages/{id}` | Đổi `storageLimitBytes` hoặc `active` |
| GET | `/api/admin/packages/{id}/pricings` | Lịch sử giá của một gói |
| POST | `/api/admin/packages/{id}/pricings` | Thêm dòng giá mới `{ basePrice, discountPercent, validFrom, validTo? }` |

### Hướng implement

- **Giảm dung lượng gói:** từ chối (`409`) nếu còn user của gói đó đang dùng nhiều hơn
  hạn mức mới. Kiểm tra bằng
  `existsByStoragePackageIdAndStorageUsedBytesGreaterThan(id, newLimit)`.
- **Không cho ngừng kích hoạt gói mặc định** (`app.default-package`), vì
  `RegistrationService` cần gói này khi đăng ký.
- **Thêm dòng giá mới:** đúng như ghi chú trong `PackagePricing`, không sửa dòng cũ.
  1. Khoá các dòng giá của gói bằng `@Lock(PESSIMISTIC_WRITE)`.
  2. Đóng dòng đang hiệu lực bằng cách đặt `validTo = validFrom` của dòng mới.
  3. Đảm bảo các khoảng thời gian không chồng nhau.
  4. Validate: `basePrice >= 0`, `0 <= discountPercent <= 100`, và `validTo > validFrom`
     nếu có.
- **Cache:** `getActivePackage` có `@Cacheable("storage-packages")`, nên mọi thao tác ghi
  vào gói phải có `@CacheEvict(value = "storage-packages", allEntries = true)`.

---

## 7. Thông báo

### Entity

- `Notification`: `id`, `recipient` (`User`), `type` (`SHARE` / `SYSTEM` / `PROMOTION`),
  `title`, `content`, `fileId` (nullable, dùng cho thông báo chia sẻ), `campaign`
  (nullable), `readAt` (nullable), `createdAt`. Thêm index `(recipient_id, read_at, created_at)`.
- `NotificationCampaign`: `id`, `title`, `content`, `targetUserId` (nullable = gửi tất
  cả), `recipientCount`, `createdBy`, `createdAt`.

### Endpoint

| Method | URL | Quyền | Mô tả |
|---|---|---|---|
| GET | `/api/user/notifications?page=&size=` | USER | Thông báo của tôi, mới nhất trước |
| GET | `/api/user/notifications/unread-count` | USER | `{ count }`, dùng cho badge ở sidebar và topbar |
| PATCH | `/api/user/notifications/{id}/read` | USER | Đánh dấu đã đọc |
| PATCH | `/api/user/notifications/read-all` | USER | Đánh dấu tất cả đã đọc |
| POST | `/api/admin/notifications` | ADMIN | `{ title, content, recipientUserId? }`: gửi cho một user hoặc tất cả |
| GET | `/api/admin/notifications/campaigns?page=&size=` | ADMIN | Lịch sử các đợt đã gửi |

### Hướng implement

- **Gửi cho tất cả:** tạo campaign, rồi `INSERT ... SELECT` một lần cho mọi user role
  USER đang `ACTIVE` (native query), thay vì lặp từng user trong Java. Với lượng user lớn,
  chuyển sang `@Async` và cập nhật `recipientCount` sau.
- **Bảo mật thao tác đọc:** khi đánh dấu đã đọc, lọc theo `recipient` là user hiện tại.
- **Tách logic tạo thông báo:** dùng `ApplicationEventPublisher` để phát event (ví dụ
  `FileSharedEvent`, `SubscriptionActivatedEvent`) và để `NotificationService` lắng nghe
  bằng `@TransactionalEventListener`. Như vậy module file và module thanh toán không phụ
  thuộc trực tiếp vào module thông báo.
- **Realtime (tuỳ chọn):** SSE qua `SseEmitter` hoặc WebSocket. Phiên bản đầu chỉ cần
  frontend gọi lại `unread-count` định kỳ.

---

## 8. Hồ sơ cho admin

**Vấn đề:** `/api/user/**` yêu cầu `hasRole("USER")`, nên admin bị `403` khi gọi
`/api/user/me`.

**Hướng implement:** chọn một trong hai cách.

- **Cách A (gọn):** tách `/me` ra một controller riêng, ví dụ `/api/me`, với rule
  `.requestMatchers("/api/me").hasAnyRole("USER", "ADMIN")`. Tái dùng
  `UserService.getCurrentUser` và `updateUserInfo`. Admin vẫn có `storagePackage` (vì
  `RegistrationService.saveUser` gán gói cho mọi user), nên `UserResponse.from` vẫn chạy
  đúng.
- **Cách B:** thêm `GET/PATCH /api/admin/me` dùng chung service.

Báo lại cho frontend path đã chọn để nối `AdminProfilePage`.

---

## 9. Đổi mật khẩu và avatar

### 9.1 Đổi mật khẩu

Mật khẩu do Keycloak quản lý. Có ba lựa chọn, xếp theo thứ tự khuyến nghị:

1. **Không làm API, dùng Keycloak.**
   - Cách 1: frontend gọi `keycloak.accountManagement()` để mở Account Console.
   - Cách 2: backend gọi Admin API
     `PUT /admin/realms/{realm}/users/{id}/execute-actions-email` với
     `["UPDATE_PASSWORD"]`.

   Backend không phải xử lý mật khẩu nên an toàn nhất.
2. **Làm API `POST /api/user/me/password`** với `{ currentPassword, newPassword }`:
   - Xác thực mật khẩu hiện tại bằng cách gọi token endpoint với
     `grant_type=password`. Cách này cần bật *Direct Access Grants* cho một client riêng;
     đây là đánh đổi về bảo mật, cần cân nhắc.
   - Sau đó gọi `PUT /admin/realms/{realm}/users/{id}/reset-password` với
     `CredentialRepresentation.password(newPassword)` (`temporary=false`). Có thể thêm
     method này vào `KeycloakAdminClient`.
   - Validate độ dài mật khẩu giống `RegistrationRequest` (8–128 ký tự), và để Keycloak
     áp password policy.
3. Không lưu và không log mật khẩu ở bất kỳ đâu.

### 9.2 Avatar

| Method | URL | Mô tả |
|---|---|---|
| POST | `/api/user/me/avatar` | `multipart/form-data` (`file`) → trả `avatarUrl` mới |
| DELETE | `/api/user/me/avatar` | Xoá avatar |

- Kiểm tra nội dung thật của file (magic bytes hoặc đọc bằng `ImageIO`), không tin vào
  `Content-Type` client gửi.
- Chỉ nhận JPG, PNG hoặc WebP, tối đa 2 MB. Có thể resize về 160×160 ở server.
- Lưu qua `StorageService` (mục 1), xoá ảnh cũ sau khi lưu ảnh mới thành công.
- Phục vụ ảnh theo một trong hai cách:
  - Bucket public chỉ dành cho avatar, rồi lưu URL đó vào `avatarUrl`.
  - Endpoint `GET /api/public/avatars/{key}`. Path `/api/public/**` đã `permitAll`.
    Key phải là UUID khó đoán.

---

## Checklist khi hoàn thành mỗi mục

- [ ] Entity mới đã có `CREATE TABLE` (hoặc Flyway migration) và khởi động được với `ddl-auto: validate`.
- [ ] Rule mới trong `SecurityConfig` đúng role.
- [ ] Request DTO có `@Valid` và ràng buộc khớp với độ dài cột DB.
- [ ] Exception mới đã được map sang `ProblemDetail` trong `GlobalHandleException`.
- [ ] Mọi truy vấn dữ liệu của user đều lọc theo user lấy từ JWT.
- [ ] Đã test bằng Postman/curl với access token của cả USER và ADMIN (`403` đúng chỗ).
- [ ] Đã ghi lại hợp đồng API (method, URL, request, response, mã lỗi) để frontend tích hợp.
