package org.clouddrive.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimNames;
import org.springframework.security.oauth2.jwt.JwtClaimValidator;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

/**
 * Quyết định token nào được coi là hợp lệ — tách khỏi {@link SecurityConfig},
 * nơi trả lời câu hỏi khác: ai đã đăng nhập thì được làm gì.
 *
 * <p><b>Vì sao phải tự khai báo bean này?</b> Nếu chỉ đặt {@code issuer-uri} trong
 * cấu hình, Spring Boot tự tạo {@code JwtDecoder} với đúng hai phép kiểm tra:
 * hạn dùng ({@code exp}/{@code nbf}) và nơi phát hành ({@code iss}).
 * <b>Không</b> có kiểm tra {@code aud}. Nghĩa là mọi token do realm Keycloak đó ký
 * đều lọt — kể cả token được cấp cho client khác như {@code account} hay
 * {@code security-admin-console}. Người dùng chỉ cần lấy token từ một client bất kỳ
 * trong realm là gọi được API này. Đây là lỗi kinh điển mang tên "confused deputy":
 * token phát cho mục đích A bị đem dùng ở dịch vụ B.
 *
 * <p>Khai báo một bean {@code JwtDecoder} sẽ khiến auto-config của Boot nhường chỗ,
 * và ta giành lại quyền quyết định danh sách phép kiểm tra.
 */
@Configuration
public class JwtDecoderConfig {

    private final String issuerUri;
    private final AppSecurityProperties properties;

    public JwtDecoderConfig(
            @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}") String issuerUri,
            AppSecurityProperties properties) {
        this.issuerUri = issuerUri;
        this.properties = properties;
    }

    /**
     * {@code withIssuerLocation} vẫn lo toàn bộ phần mật mã: tự tải bộ khoá công khai
     * (JWKS) của Keycloak và kiểm tra chữ ký. Ta chỉ bổ sung phần kiểm tra nội dung.
     */
    @Bean
    public JwtDecoder jwtDecoder() {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withIssuerLocation(issuerUri).build();
        decoder.setJwtValidator(jwtValidator());
        return decoder;
    }

    /**
     * Tách riêng để test được mà không cần gọi mạng tới Keycloak.
     *
     * <p>Lưu ý {@code createDefaultWithIssuer} phải được giữ lại: lỗi thường gặp là
     * thay thế toàn bộ validator bằng mỗi audience, vô tình bỏ luôn kiểm tra hạn dùng.
     */
    OAuth2TokenValidator<Jwt> jwtValidator() {
        return new DelegatingOAuth2TokenValidator<>(
                JwtValidators.createDefaultWithIssuer(issuerUri),
                audienceValidator()
        );
    }

    /**
     * Claim {@code aud} có thể là một chuỗi đơn hoặc một mảng, nên đọc dưới dạng danh sách.
     * Token thiếu hẳn {@code aud} phải bị từ chối, không được mặc định cho qua.
     *
     * <p>Keycloak KHÔNG tự thêm client-id vào {@code aud}: phải tạo một protocol mapper
     * loại "Audience" trong client scope. Quên bước đó thì mọi request sẽ 401.
     */
    private OAuth2TokenValidator<Jwt> audienceValidator() {
        String expected = properties.audience();
        return new JwtClaimValidator<List<String>>(
                JwtClaimNames.AUD,
                audience -> audience != null && audience.contains(expected)
        );
    }
}
