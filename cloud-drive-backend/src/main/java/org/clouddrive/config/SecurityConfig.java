package org.clouddrive.config;

import java.time.Duration;
import java.util.List;

import org.clouddrive.common.security.RoleConverter;
import org.springframework.boot.actuate.info.InfoEndpoint;
import org.springframework.boot.health.actuate.endpoint.HealthEndpoint;
import org.springframework.boot.security.autoconfigure.actuate.web.servlet.EndpointRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;


@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    /** Chỉ các path dưới đây phục vụ trình duyệt nên mới cần CORS; actuator thì không. */
    private static final String API_PATTERN = "/api/**";

    /**
     * Các header mà phía frontend cần ĐỌC được từ response. Nếu không
     * liệt kê ở đây, trình duyệt vẫn nhận header nhưng giấu khỏi JS: tải file về
     * sẽ mất tên gốc ({@code Content-Disposition}), không đọc được URL tài nguyên
     * vừa tạo ({@code Location}) hay phiên bản để cache ({@code ETag}).
     */
    private static final List<String> EXPOSED_HEADERS = List.of(
            HttpHeaders.CONTENT_DISPOSITION,
            HttpHeaders.LOCATION,
            HttpHeaders.ETAG
    );

    /**
     * Thời gian trình duyệt cache kết quả preflight. Không đặt thì MỖI request
     * thật đều kèm một request {@code OPTIONS} đi trước, tức gấp đôi round-trip.
     */
    private static final Duration PREFLIGHT_CACHE = Duration.ofMinutes(30);

    private final RoleConverter roleConverter;
    private final AppSecurityProperties properties;

    public SecurityConfig(RoleConverter roleConverter,
                          AppSecurityProperties properties
                         ) {
        this.roleConverter = roleConverter;
        this.properties = properties;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                // Tự tìm bean CorsConfigurationSource bên dưới. Phải khai báo ở đây để
                // CorsFilter nằm TRƯỚC bước phân quyền: preflight không mang header
                // Authorization nên nếu để nó đi tới authorizeHttpRequests sẽ bị 401.
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(
                        SessionCreationPolicy.STATELESS
                ))
                .authorizeHttpRequests(authorize -> authorize
                        // Healthcheck và info không cần authentication.
                        .requestMatchers(EndpointRequest.to(HealthEndpoint.class, InfoEndpoint.class)).permitAll()
                        // Endpoint lỗi mặc định của spring boot.
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/api/public/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/user/**").hasRole("USER")
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(roleConverter))
                );
        return http.build();
    }



    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(properties.allowedOrigins());
        configuration.setAllowedMethods(List.of(
                HttpMethod.GET.name(),
                HttpMethod.POST.name(),
                HttpMethod.PUT.name(),
                HttpMethod.PATCH.name(),
                HttpMethod.DELETE.name()
        ));
        // Content-Type là bắt buộc: `application/json` KHÔNG phải simple header nên
        // thiếu nó là mọi request có body JSON đều bị chặn ngay từ preflight.
        configuration.setAllowedHeaders(List.of(
                HttpHeaders.AUTHORIZATION,
                HttpHeaders.CONTENT_TYPE
        ));
        configuration.setExposedHeaders(EXPOSED_HEADERS);
        // Token đi trong header Authorization, không phải cookie, nên không cần
        // allowCredentials. Bật nó sẽ khiến trình duyệt đính kèm cookie vào mọi
        // request cross-origin, mâu thuẫn với việc đã tắt CSRF ở trên.
        configuration.setAllowCredentials(false);
        configuration.setMaxAge(PREFLIGHT_CACHE);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration(API_PATTERN, configuration);
        return source;
    }
}
