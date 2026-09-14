# Cấu hình ứng dụng cloud-drive-backend

Tài liệu này giải thích **toàn bộ** cấu hình của backend: mỗi file làm gì, vì sao
từng lựa chọn lại như vậy, và những cạm bẫy đã gặp để người sau không vấp lại.

Đối tượng đọc: người mới vào dự án, hoặc chính bạn sau ba tháng nữa.

---

## 1. Bản đồ các file cấu hình

| File | Trách nhiệm |
|---|---|
| `.env` | Giá trị thật của môi trường. **Không commit.** |
| `.env.example` | Mẫu để copy thành `.env`, có chú thích từng biến. |
| `src/main/resources/application.yml` | Khai báo cấu hình, đọc giá trị từ `.env`. |
| `config/AppSecurityProperties.java` | Gom cấu hình bảo mật thành một đối tượng có kiểu rõ ràng. |
| `config/JwtDecoderConfig.java` | Quyết định **token nào đáng tin**. |
| `config/KeycloakProperties.java` | Địa chỉ Admin API của Keycloak và timeout khi gọi. |
| `config/KeycloakConfig.java` | `RestClient` **gọi ngược sang Keycloak**, tự mang token. |
| `config/SecurityConfig.java` | Quyết định **người đã đăng nhập được làm gì**. |
| `common/security/RoleConverter.java` | Đọc role từ token Keycloak. |
| `common/security/ProblemDetail*.java` | Định dạng response lỗi 401/403 cho frontend. |

Nguyên tắc chia file: **"ai đấy?"** tách khỏi **"được làm gì?"**. Hai câu hỏi này
thay đổi vì những lý do khác nhau, nên để chung một file sẽ khiến file đó bị sửa
liên tục vì hai lý do không liên quan.

---

## 2. `.env` và cách nó được nạp

```yaml
spring:
  config:
    import: optional:file:.env[.properties]
```

Dòng này bảo Spring đọc file `.env` như một file `.properties`.

- `optional:` — thiếu file thì app **vẫn khởi động**. Tiện khi chạy trên môi
  trường thật, nơi giá trị đến từ biến môi trường thật chứ không từ file.
- `[.properties]` — nói rõ định dạng, vì tên file `.env` không có đuôi nhận biết.

Hệ quả cần nhớ: vì là cú pháp `.properties`, **không** viết `export`, **không**
đặt giá trị trong dấu nháy. `DB_PASSWORD="abc"` sẽ cho ra mật khẩu có cả dấu nháy.

Khi thêm một biến mới, phải sửa **ba** chỗ: `.env`, `.env.example`, và
`application.yml`. Quên `.env.example` là người tiếp theo clone repo sẽ không
biết biến đó tồn tại.

---

## 3. `application.yml` — giải thích từng khối

### 3.1. Cơ sở dữ liệu

```yaml
spring.jpa.hibernate.ddl-auto: validate
```

`validate` nghĩa là Hibernate **chỉ đối chiếu** entity với bảng đang có, không tự
sửa cấu trúc. Đây là lựa chọn đúng cho mọi môi trường trừ lúc học thử:
`update` có thể âm thầm đổi schema theo cách bạn không lường trước, còn
`create-drop` thì **xoá sạch dữ liệu** mỗi lần khởi động lại.

Đổi lại, app sẽ **không khởi động được** nếu schema chưa khớp. Việc tạo và nâng
cấp bảng nên giao cho một công cụ migration (Flyway hoặc Liquibase) — hiện dự án
chưa có, đây là việc còn tồn.

### 3.2. Resource server

```yaml
spring.security.oauth2.resourceserver.jwt.issuer-uri: ${KEYCLOAK_ISSUER_URI}
```

Giá trị này phải khớp **chính xác từng ký tự** với claim `iss` trong token, kể cả
dấu `/` ở cuối. Cạm bẫy hay gặp nhất khi chạy Docker: frontend gọi Keycloak qua
`localhost:8080` còn backend gọi qua tên service `keycloak:8080`, thế là token
mang `iss` khác với cái backend mong đợi và mọi request đều 401. Cách xử lý: đặt
`KC_HOSTNAME` cho Keycloak để issuer giống nhau ở mọi nơi.

Cách kiểm tra nhanh: lấy một access token thật, dán vào <https://jwt.io>, đọc
trường `iss`, so với giá trị trong `.env`.

### 3.3. Actuator

```yaml
management.endpoints.web.exposure.include: health,info
```

Chỉ mở hai endpoint. Mặc định của Boot còn kín hơn nữa, và đó là chủ ý: các
endpoint như `env` hay `configprops` sẽ phơi bày cấu hình — bao gồm cả tên biến
môi trường — ra ngoài. Mỗi lần muốn thêm một endpoint vào đây, hãy tự hỏi ai được
phép gọi nó.

---

## 4. `AppSecurityProperties` — vì sao không dùng `@Value`

```java
@Validated
@ConfigurationProperties(prefix = "app.security")
public record AppSecurityProperties(
        @NotBlank String audience,
        @NotBlank String clientId,
        @NotEmpty List<@NotBlank String> allowedOrigins) {}
```

Ba lý do, đều rút ra từ lỗi thật đã gặp trong dự án này:

1. **Sai config bị phát hiện ngay lúc khởi động.** Trước đây `application.yml` đọc
   `${CORS_ALLOWED_ORIGIN}` còn `.env` khai `CORS_ALLOWED_ORIGINS`. App chết với một
   stack trace về "placeholder", không nói được thuộc tính nào thiếu. Có
   `@Validated`, thông báo lỗi chỉ thẳng vào tên thuộc tính.

2. **Kiểu dữ liệu phản ánh đúng ý định.** `allowedOrigins` là `List<String>`. Nếu
   để `String` rồi truyền `"a.com,b.com"`, cả chuỗi bị coi là **một** origin literal
   không khớp với gì cả — và **không có lỗi nào được báo**. Kiểu hỏng im lặng này tốn
   thời gian gấp nhiều lần một exception.

3. **Một nguồn sự thật.** `RoleConverter`, `JwtDecoderConfig` và `SecurityConfig`
   cùng đọc từ đây, không ai tự viết lại chuỗi `"${app.security...}"` của mình.

Bean được bật nhờ `@ConfigurationPropertiesScan` trên `CloudDriveBackendApplication`.

---

## 5. `JwtDecoderConfig` — token nào đáng tin

### 5.1. Vì sao phải tự khai báo bean

Nếu chỉ đặt `issuer-uri`, Spring Boot tự tạo `JwtDecoder` với đúng **hai** phép
kiểm tra: hạn dùng (`exp`/`nbf`) và nơi phát hành (`iss`). **Không có `aud`.**

Nghĩa là mọi token do realm Keycloak đó ký đều lọt — kể cả token cấp cho client
khác như `account` hay `security-admin-console`. Người dùng chỉ cần lấy token từ
một client bất kỳ trong realm là gọi được API này. Lỗi kinh điển mang tên
**confused deputy**: token phát cho mục đích A bị đem dùng ở dịch vụ B.

Khai báo một bean `JwtDecoder` khiến auto-config của Boot nhường chỗ.

### 5.2. Bộ validator

```java
new DelegatingOAuth2TokenValidator<>(
        JwtValidators.createDefaultWithIssuer(issuerUri),   // giữ lại exp + iss
        audienceValidator()                                  // thêm aud
);
```

Điểm dễ sai nhất: **phải giữ `createDefaultWithIssuer`**. Nhiều người thay thế
toàn bộ validator bằng mỗi audience, vô tình bỏ luôn kiểm tra hạn dùng — token hết
hạn từ năm ngoái vẫn dùng được. Test `vanTuChoiTokenHetHan` tồn tại để chặn đúng
kiểu hồi quy này.

Claim `aud` có thể là chuỗi đơn hoặc mảng nên phải đọc dưới dạng danh sách. Token
thiếu hẳn `aud` bị **từ chối**, không mặc định cho qua.

### 5.3. Việc bắt buộc phải làm phía Keycloak

Keycloak **không** tự thêm client-id vào `aud`. Vào client scope tạo một protocol
mapper loại **Audience**. Quên bước này thì **mọi** request đều 401 và rất dễ tưởng
nhầm là code sai.

### 5.4. Đánh đổi đã chọn

`NimbusJwtDecoder.withIssuerLocation(...)` gọi mạng tới Keycloak **ngay lúc khởi
động** để tải metadata. Hệ quả: Keycloak chưa sẵn sàng thì backend **không khởi
động được**.

Chấp nhận đánh đổi này vì nó là kiểu *fail fast*: sai cấu hình issuer bị phát hiện
lúc deploy, chứ không phải lúc người dùng đầu tiên đăng nhập. Nhưng cần nhớ để đặt
`depends_on` và healthcheck cho đúng trong docker-compose.

---

## 6. `SecurityConfig` — được làm gì

### 6.1. Đường đi của một request

Thứ tự dưới đây là điều quan trọng nhất trong cả file:

```
Request
  │
  ├─ CorsFilter ──────────► preflight OPTIONS dừng ở đây, trả 200
  │                          (chưa hề kiểm tra token)
  ├─ BearerTokenAuthenticationFilter
  │     └─ JwtDecoder ──► kiểm tra chữ ký, exp, iss, aud
  │     └─ RoleConverter ──► đọc role, tạo Authentication
  │
  ├─ AuthorizationFilter ──► so khớp requestMatchers
  │
  └─ Controller
```

Hỏng ở đâu thì đi đường nào:

- Token sai/thiếu → `ProblemDetailAuthenticationEntryPoint` → **401**
- Thiếu role → `ProblemDetailAccessDeniedHandler` → **403**

### 6.2. CSRF

```java
.csrf(AbstractHttpConfigurer::disable)
```

An toàn vì API này **hoàn toàn không xác thực bằng cookie** — token nằm trong
header `Authorization`, mà header thì trang web khác không tự gắn vào được.

Giả định này mất hiệu lực ngay khi xuất hiện bất kỳ cơ chế nào dựa trên cookie
(ví dụ chuyển refresh token sang cookie `HttpOnly`). Lúc đó **phải bật lại CSRF**.
Đừng xoá comment này trong code.

### 6.3. CORS

Vì sao khai báo trong chain chứ không dùng `@CrossOrigin` hay `addCorsMappings`:
hai cách kia chạy ở tầng `DispatcherServlet`, tức là **sau** toàn bộ security
filter chain. Preflight `OPTIONS` **không mang header `Authorization`**, nên nếu để
nó đi tới bước phân quyền thì nhận 401 và trình duyệt chặn luôn request thật phía
sau — request GET của bạn thậm chí chưa rời khỏi trình duyệt.

Từng thiết lập và lý do:

| Thiết lập | Lý do |
|---|---|
| `allowedOrigins` từ config | Không hardcode `localhost`, nếu không nó sẽ theo bạn lên production |
| `allowedHeaders` có `Content-Type` | `application/json` **không** phải simple header; thiếu nó là mọi request có body JSON hỏng |
| `exposedHeaders` | Mặc định JS **không đọc được** các header này dù server có gửi |
| `allowCredentials(false)` | Token đi trong header, không phải cookie. Bật `true` sẽ khiến trình duyệt đính kèm cookie cross-origin, mâu thuẫn với việc đã tắt CSRF |
| `maxAge` 30 phút | Không đặt thì **mỗi** request thật đều kèm một `OPTIONS`, gấp đôi round-trip |
| Đăng ký `/api/**` | Actuator không phục vụ trình duyệt nên không cần CORS |

`exposedHeaders` đáng chú ý nhất với ứng dụng lưu trữ file:

- `Content-Disposition` — không expose thì FE tải file về mà **không biết tên gốc**
- `Location` — không đọc được URL tài nguyên vừa tạo sau khi upload
- `ETag` — không làm được cache có điều kiện hay upload tiếp tục dở dang

**Không** thêm `.requestMatchers(OPTIONS, "/**").permitAll()`. Đó là cách vá triệu
chứng của việc đặt CORS sai chỗ; khi `CorsFilter` đã đúng vị trí, nó tự trả lời
preflight rồi dừng.

### 6.4. Thứ tự `requestMatchers`

Quy tắc: **khớp trước thì thắng**, nên đi từ cụ thể đến tổng quát.

```java
.requestMatchers(EndpointRequest.to(HealthEndpoint.class, InfoEndpoint.class)).permitAll()
.requestMatchers("/error").permitAll()
.requestMatchers("/api/public/**").permitAll()
.requestMatchers("/api/admin/**").hasRole("ADMIN")
.requestMatchers("/api/user/**").hasRole("USER")
.anyRequest().authenticated()
```

Hai dòng đầu là hai lỗi vận hành thật, không phải lý thuyết:

- **Actuator.** Healthcheck của Docker/Kubernetes gọi **ẩn danh**. Để
  `anyRequest().authenticated()` nuốt mất thì probe nhận 401, container bị coi là
  chết dù ứng dụng vẫn chạy bình thường. Dùng `EndpointRequest` thay vì viết tay
  chuỗi `/actuator/health` để cấu hình tự đi theo nếu ai đó đổi `base-path`.

- **`/error`.** Khi controller ném exception, servlet container **forward nội bộ**
  sang `/error`. Chặn đường này sẽ biến lỗi 500 thật thành 401/403, che mất nguyên
  nhân gốc — một kiểu bug rất tốn thời gian vì bạn sẽ đi tìm ở nhầm chỗ.

### 6.5. Phân cấp role

```java
RoleHierarchyImpl.withDefaultRolePrefix().role("ADMIN").implies("USER").build();
```

Không có dòng này, `hasRole("USER")` so khớp chuỗi một cách máy móc: tài khoản chỉ
có `ROLE_ADMIN` bị **403** ở mọi endpoint dành cho USER — trái hoàn toàn với trực
giác của cả người dùng lẫn người viết code.

Bean khai báo `static` vì nó phải sẵn sàng rất sớm, trước khi hạ tầng của method
security được khởi tạo.

### 6.6. `@EnableMethodSecurity`

Đã bật sẵn nhưng **chưa dùng tới**, và đây là phần quan trọng cho chặng tiếp theo.

Phân quyền theo tiền tố URL (`/api/user/**`, `/api/admin/**`) chỉ trả lời được câu
hỏi *"vai trò nào được vào khu vực nào"*. Nó **không** trả lời được câu hỏi trung
tâm của một ứng dụng drive: *"file này có phải của bạn không?"*.

Quyền đọc một file phụ thuộc vào **chủ sở hữu file** và danh sách chia sẻ, không
phụ thuộc vào tiền tố URL. Nên chặng sau, URL nên chuyển sang hướng tài nguyên
(`/api/v1/files/{id}`) và việc kiểm tra quyền chuyển vào `@PreAuthorize` cùng một
service kiểm tra quyền sở hữu.

---

## 7. Xử lý lỗi 401/403

### 7.1. Vì sao cần lớp riêng

Lỗi xác thực và phân quyền xảy ra trong **servlet filter**, tức là **trước khi**
request tới `DispatcherServlet`. `@RestControllerAdvice` chỉ bắt được exception
phát sinh **bên trong** `DispatcherServlet`, nên nó **sẽ không bao giờ** được gọi
cho 401/403 — dù bạn viết nó đẹp đến đâu.

Muốn can thiệp phải cắm vào đúng hai điểm mở rộng: `AuthenticationEntryPoint` (401)
và `AccessDeniedHandler` (403).

### 7.2. 401 khác 403 thế nào

| | Ý nghĩa | Frontend nên làm gì |
|---|---|---|
| **401** | "Tôi không biết bạn là ai" — thiếu token, hết hạn, sai chữ ký, sai audience | Thử làm mới token, thất bại thì về trang đăng nhập |
| **403** | "Tôi biết bạn là ai, nhưng bạn không được phép" | Hiển thị "không có quyền", **không** về trang đăng nhập |

Nhầm 403 thành 401 sẽ tạo ra **vòng lặp đăng nhập vô tận**: người dùng đăng nhập
lại thành công rồi lại bị đá ra, mãi không hiểu vì sao.

### 7.3. Hình dạng response

Dùng `ProblemDetail` (chuẩn RFC 9457, content type `application/problem+json`) để
sau này lỗi nghiệp vụ từ `@RestControllerAdvice` cũng cùng một hình dạng — frontend
chỉ cần một hàm xử lý lỗi duy nhất.

```json
{
  "type": "about:blank",
  "title": "Unauthorized",
  "status": 401,
  "detail": "Request thiếu access token.",
  "instance": "/api/user/files",
  "code": "MISSING_TOKEN",
  "traceId": "0f7c...",
  "timestamp": "2026-09-11T07:49:54Z"
}
```

Các mã lỗi hiện có: `MISSING_TOKEN`, `INVALID_TOKEN`, `INSUFFICIENT_PERMISSION`, cùng các
mã nghiệp vụ trong `common/exception/ErrorCode.java` (xem mục 12.3).

Frontend phải `switch` theo `code`, **không** so khớp chuỗi trong `detail` — câu
chữ sẽ đổi, mã thì không.

### 7.4. Ba chi tiết dễ bị bỏ qua

1. **Giữ header `WWW-Authenticate`.** Cả hai lớp đều **ủy quyền** cho bản mặc định
   của Spring chạy trước, để nó đặt status và header chuẩn RFC 6750, rồi mới ghi
   thêm body JSON. Tự viết lại từ đầu sẽ làm mất header đó — các client OAuth chuẩn
   và Postman đều dựa vào nó.

2. **Mức log khác nhau.** 401 ghi `DEBUG` vì token hết hạn xảy ra liên tục trong
   vận hành bình thường, ghi `WARN` sẽ làm nhiễu log thật. 403 ghi `WARN` vì một
   người **đã xác thực** mà chạm vào endpoint ngoài quyền hạn là tín hiệu đáng chú
   ý. **Không bao giờ log nội dung token** — nó là credential.

3. **Header CORS phải còn trên response lỗi.** Thiếu nó, trình duyệt giấu toàn bộ
   response khỏi JavaScript: frontend không đọc được status lẫn body, chỉ nhận một
   lỗi mạng chung chung. Test `response401VanCoHeaderCorsDeFrontendDocDuoc` tồn tại
   để chốt điều này.

---

## 8. `RoleConverter` — đọc role từ token Keycloak

Spring Security mặc định **chỉ** đọc claim `scope` và sinh authority `SCOPE_*`.
Keycloak lại đặt role ở hai chỗ hoàn toàn khác:

| Claim của Keycloak | Ý nghĩa |
|---|---|
| `realm_access.roles` | Role cấp realm, dùng chung mọi client |
| `resource_access.<client-id>.roles` | Role riêng của client này |

Không có converter này, token hợp lệ nhưng `hasRole("ADMIN")` luôn thất bại —
nguyên nhân phổ biến nhất của tình trạng "token đúng mà vẫn 403".

Converter gộp cả hai nguồn, thêm tiền tố `ROLE_`, và **bỏ qua** role của các client
khác trong `resource_access` — role cấp cho client khác không nên mở quyền ở API này.

Hai chi tiết đáng chú ý:

- **Chuẩn hoá tên.** Keycloak thường đặt role kiểu `file-admin` chữ thường, còn
  `hasRole("FILE_ADMIN")` so khớp **chính xác** chuỗi `ROLE_FILE_ADMIN`. Converter
  viết hoa và đổi `-` thành `_`, dùng `Locale.ROOT` để tránh lỗi chữ `i` của locale
  Thổ Nhĩ Kỳ.
- **Đọc claim phòng thủ.** Dùng `getClaim` + kiểm tra kiểu thay vì `getClaimAsMap`,
  vì hàm sau **ném exception** khi claim sai kiểu, biến một lỗi 401 lẽ ra bình thường
  thành lỗi 500.

Tên principal lấy từ `preferred_username`, lùi về `sub` nếu thiếu — để log hiện tên
người dùng chứ không phải một chuỗi UUID.

---

## 9. Test

```bash
./mvnw test
```

| Lớp test | Chốt điều gì |
|---|---|
| `RoleConverterTest` | Gộp role realm + client, chuẩn hoá tên, bỏ qua claim sai kiểu |
| `JwtDecoderConfigTest` | Chặn token sai audience, và **vẫn** chặn token hết hạn |
| `SecurityConfigCorsTest` | Preflight đi qua trước bước phân quyền |
| `SecurityConfigAuthorizationTest` | 401 vs 403, định dạng body, phân cấp role, CORS trên response lỗi |
| `RegistrationServiceTest` | Thứ tự các bước, bù trừ khi ghi CSDL lỗi, lỗi gốc không bị lỗi bù trừ che mất |
| `KeycloakAdminClientTest` | Hợp đồng JSON với Keycloak, đọc id từ `Location`, phân loại 400/409/403, xoá idempotent |
| `AuthControllerTest` | Đăng ký không cần token, lỗi validate theo từng trường và không lặp lại mật khẩu |

Các test này chạy `@WebMvcTest` với `JwtDecoder` được mock, nên **không cần** Keycloak
hay MySQL.

**Ngoại lệ: `CloudDriveBackendApplicationTests.contextLoads`.** Test này nạp toàn bộ
context thật nên cần **cả MySQL lẫn Keycloak đang chạy** (`docker compose up`), vì
`ddl-auto: validate` phải đối chiếu schema và `JwtDecoder` phải tải metadata của
Keycloak lúc khởi động. Không có hạ tầng thì nó fail — đây là hạn chế sẵn có của
kiểu test này, không phải lỗi cấu hình. Cách xử lý triệt để là dùng Testcontainers
để test tự dựng MySQL và Keycloak; đó là việc còn tồn.

---

## 10. Danh sách kiểm tra khi dựng môi trường mới

1. `cp .env.example .env` rồi điền giá trị thật.
2. Dựng Keycloak, tạo realm và client.
3. **Tạo protocol mapper loại "Audience"** trong client scope — quên bước này thì
   mọi request đều 401.
4. Lấy một access token thật, dán vào <https://jwt.io>, xác nhận có đủ:
   - `iss` khớp **chính xác** `KEYCLOAK_ISSUER_URI`
   - `aud` chứa `KEYCLOAK_AUDIENCE`
   - `realm_access.roles` hoặc `resource_access.<client-id>.roles` có role mong đợi
5. Tạo database và chạy migration cho khớp với entity (`ddl-auto: validate`).
6. `./mvnw spring-boot:run`, gọi thử `GET /actuator/health` → phải trả `200` mà
   **không** cần token.

---

## 11. Gọi ngược sang Keycloak: `KeycloakConfig`

Các mục trên đều nói về **một chiều**: token đi từ Keycloak tới backend, backend kiểm
tra rồi cho qua. Mục này là chiều ngược lại — backend chủ động gọi sang Keycloak để
**tạo người dùng** khi ai đó đăng ký.

### 11.1. Vì sao không dùng tài khoản admin

Cách nhanh nhất là lấy username/password của tài khoản `admin` realm `master` rồi đăng
nhập bằng nó. Đừng. Tài khoản đó là của con người: mật khẩu sẽ bị đổi, sớm muộn sẽ bị
bật MFA (lúc đó luồng đăng nhập bằng mật khẩu hỏng ngay), và nó có quyền trên **mọi**
realm chứ không riêng `clouddrive`.

Cách đúng là **service account**: bản thân client `backend` đăng nhập bằng
`client_id` + `client_secret` (grant `client_credentials`), nhận một access token của
chính ứng dụng, rồi dùng token đó gọi Admin API.

### 11.2. Ba thứ phải bật trong Keycloak

Thiếu bất kỳ cái nào cũng hỏng, và thông báo lỗi **không** chỉ đúng nguyên nhân:

1. `Client authentication = On` — client public không có secret nên không dùng được
   `client_credentials`.
2. `Service accounts roles = On`.
3. Tab *Service account roles* → gán role của client `realm-management`:
   **`manage-users`**.

Cạm bẫy hay gặp nhất là bước 3: thiếu role thì token vẫn lấy được bình thường, chỉ tới
lúc gọi Admin API mới nhận `403`. Rất dễ chẩn đoán nhầm thành sai secret — nhưng sai
secret sẽ hỏng sớm hơn, ở bước lấy token, với `401 invalid_client`.

### 11.3. Chia cấu hình ra hai chỗ

```yaml
spring.security.oauth2.client.registration.keycloak-admin  # client-id, secret, grant
keycloak.server-url / realm / admin-client-registration-id  # địa chỉ Admin API
```

`client-id` và `client-secret` **chỉ** khai ở khối `spring...client.registration`, vì
đó là nơi Spring Security tự đọc để lấy token và lấy lại khi hết hạn. Chép thêm một
bản vào khối `keycloak:` là mời gọi cảnh hai giá trị lệch nhau mà không ai biết bản nào
đang thực sự được dùng.

Chú ý `token-uri` dùng `/realms/...`, **không** phải `/admin/realms/...`. Đường dẫn thứ
nhất là endpoint OIDC công khai; đường dẫn thứ hai là API quản trị. Nhầm thì nhận `404`.

### 11.4. Vì sao phải tự khai `OAuth2AuthorizedClientManager`

Mặc định Spring Boot tạo `DefaultOAuth2AuthorizedClientManager`, vốn cần một
`HttpServletRequest` để lưu token vào session. Nghĩa là mọi lời gọi nằm ngoài luồng
request — job theo lịch, luồng nền, test — sẽ hỏng.

`KeycloakConfig` thay nó bằng `AuthorizedClientServiceOAuth2AuthorizedClientManager`
và ghim một danh tính cố định cho service account. Ghim danh tính là quan trọng: nếu để
mặc định (đọc từ `SecurityContextHolder`), token sẽ bị lưu theo **từng người dùng đang
gọi API**, nên mỗi người lại làm Keycloak phát một token mới và bộ nhớ đệm gần như vô
dụng.

### 11.5. Timeout

`keycloak.connect-timeout` và `keycloak.read-timeout` hỏng theo hai kiểu khác nhau nên
phải đặt cả hai: cái đầu chặn trường hợp không mở nổi kết nối (sai host, Keycloak chưa
chạy), cái sau chặn trường hợp đã kết nối được nhưng Keycloak không trả lời. Mặc định
của cả hai là **chờ vô hạn** — đủ để một Keycloak treo giữ hết thread pool và kéo sập
cả những API chẳng liên quan gì tới đăng ký.

### 11.6. Đọc kết quả tạo user

`POST /admin/realms/{realm}/users` trả `201` với **thân rỗng**. Id của người dùng vừa
tạo chỉ nằm ở header `Location`, dạng `.../users/{uuid}` — đó là giá trị cần lưu vào
cột `users.keycloak_user_id`. Lấy id bằng cách cắt đoạn cuối đường dẫn, đừng so khớp
với URL đã gọi: khi Keycloak đứng sau reverse proxy, host trong `Location` có thể khác.

Mã lỗi cần phân biệt: `401` sai secret, `403` thiếu role `manage-users`, `409` email
hoặc username đã tồn tại (lỗi của người gọi, phải trả về frontend chứ không phải 500).

---

## 12. Luồng đăng ký: đồng bộ Keycloak và CSDL

`POST /api/auth/register` (mở cho người chưa đăng nhập, **chỉ** method POST).

```json
{ "email": "a@b.com", "password": "...", "lastName": "Nguyễn", "firstName": "Văn Tường", "phone": "0912345678" }
```

### 12.1. Vì sao là saga có bù trừ

Người dùng tồn tại ở **hai** nơi không chung transaction: Keycloak giữ danh tính và mật
khẩu, CSDL giữ hồ sơ và gói dung lượng. Không có transaction phân tán, nên
`RegistrationService` làm theo thứ tự:

```
1. Kiểm tra cục bộ: email đã có trong CSDL? gói mặc định có tồn tại?   ← hỏng thì chưa có gì phải dọn
2. POST Keycloak /users  → lấy id từ header Location
3. Ghi bảng users (transaction ngắn, chỉ bao CSDL)
      └─ hỏng → DELETE Keycloak /users/{id}  (bù trừ)
             └─ bù trừ cũng hỏng → log ERROR "MỒ CÔI" kèm id, ném lỗi GỐC
```

- **Keycloak đi trước** vì `keycloak_user_id` là `NOT NULL`, và một người dùng Keycloak
  thiếu hồ sơ cục bộ dễ phát hiện, dễ tự chữa hơn chiều ngược lại.
- **Không `@Transactional` trên cả luồng**: giữ connection CSDL trong lúc chờ HTTP tới
  Keycloak (tới 10 giây theo `read-timeout`) là cách nhanh nhất để cạn connection pool.
- **Bước 1 chỉ là lối tắt**, không phải chốt chặn: hai request cùng email song song đều
  qua được. Chốt chặn thật là ràng buộc duy nhất của Keycloak (username = email) và cột
  `users.email`.

### 12.2. Việc bắt buộc phía Keycloak và CSDL

1. Service account có role `manage-users` (xem 11.2).
2. **Realm settings → User registration → Default roles**: thêm role `user`. Backend không
   tự gán role, nên thiếu bước này thì người dùng đăng ký xong đăng nhập được nhưng mọi API
   `/api/user/**` đều 403.
3. Bảng `packages` phải có gói tên đúng `app.registration.default-package-name` (mặc định
   `FREE`) và `is_active = 1`. Thiếu thì mọi request đăng ký 500 — nhưng hỏng **trước** khi
   tạo gì trên Keycloak.
4. Nếu realm bật password policy, Keycloak là nơi quyết định cuối; backend chỉ chặn
   8–128 ký tự. Giới hạn trên để một mật khẩu vài MB không đốt CPU của thuật toán băm.

### 12.3. Mã lỗi

| HTTP | `code` | Khi nào |
|---|---|---|
| 400 | `VALIDATION_FAILED` | Sai định dạng; body có thêm `errors: { field: message }` |
| 400 | `PASSWORD_POLICY_VIOLATION` | Keycloak từ chối mật khẩu |
| 400 | `REGISTRATION_REJECTED` | Keycloak từ chối vì lý do khác (user profile) |
| 409 | `EMAIL_ALREADY_EXISTS` | Trùng ở CSDL hoặc ở Keycloak |
| 503 | `IDENTITY_PROVIDER_UNAVAILABLE` | Keycloak sập/timeout, **hoặc** sai secret / thiếu `manage-users` — xem log ERROR |

### 12.4. Những điểm an toàn đã cài sẵn — đừng gỡ

- `RegisterRequest` **không** có `role`/`status`: chặn tự đăng ký thành ADMIN.
- `toString()` của `RegisterRequest` và `NewKeycloakUser` che mật khẩu. Record tự sinh
  `toString` in **mọi** trường.
- Lỗi validate không bao giờ lặp lại giá trị đã gửi.
- Email được viết thường trước mọi bước; mật khẩu **không** bị `trim`.
- Response không trả `keycloakUserId`.

---

## 13. Việc còn tồn

| Việc | Vì sao cần |
|---|---|
| Tạo hồ sơ cục bộ khi đăng nhập lần đầu (JIT provisioning từ `sub` + `email` của JWT) | Chữa người dùng Keycloak "mồ côi" khi app chết giữa bước 2 và 3, hoặc khi bù trừ thất bại — nếu không, người đó không đăng ký lại được (409) mà cũng không có hồ sơ |
| Rate limit cho `/api/auth/register` | Endpoint công khai, mỗi request tạo một người dùng thật trên Keycloak |
| Xác thực email (`VERIFY_EMAIL`) | Hiện ai cũng đăng ký được bằng email của người khác; cần SMTP cho Keycloak trước |
| Khôi phục `ProblemDetailWriter`, `ProblemDetailAuthenticationEntryPoint`, `ProblemDetailAccessDeniedHandler` | Hai test `SecurityConfig*Test` đang tham chiếu tới các lớp này nhưng chúng không tồn tại, nên `mvnw test` không compile được |
| Công cụ migration (Flyway/Liquibase) | `ddl-auto: validate` cần schema có sẵn, hiện chưa ai tạo nó một cách có phiên bản |
| Testcontainers | Để `contextLoads` chạy được mà không cần hạ tầng dựng tay |
| Chuyển sang URL hướng tài nguyên + `@PreAuthorize` | Quyền trên file phụ thuộc chủ sở hữu, không phụ thuộc tiền tố URL |
| `@RestControllerAdvice` trả `ProblemDetail` | Để lỗi nghiệp vụ cùng hình dạng với lỗi bảo mật |
| Tách chain riêng cho actuator | Khi mở thêm endpoint quản trị, chúng cần luật riêng |
| `server.forward-headers-strategy` | Khi chạy sau reverse proxy, để nhận đúng scheme và host gốc |
