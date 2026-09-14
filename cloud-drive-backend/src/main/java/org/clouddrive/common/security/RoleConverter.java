package org.clouddrive.common.security;

import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import jakarta.validation.constraints.NotBlank;
import org.clouddrive.config.AppSecurityProperties;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * Chuyển access token của Keycloak thành {@link JwtAuthenticationToken}.
 *
 * <p>Keycloak đặt role ở hai nơi tách biệt và Spring Security không đọc chỗ nào
 * trong số đó theo mặc định (mặc định chỉ đọc {@code scope}/{@code scp}):
 * <ul>
 *   <li>{@code realm_access.roles} – role cấp realm, dùng chung mọi client.</li>
 *   <li>{@code resource_access.<client-id>.roles} – role riêng của client này.</li>
 * </ul>
 * Cả hai được gộp lại và thêm tiền tố {@code ROLE_} để {@code hasRole("ADMIN")}
 * trong {@code SecurityConfig} hoạt động. Các {@code scope} vẫn được giữ lại
 * dưới tiền tố {@code SCOPE_} để có thể phân quyền theo scope khi cần.
 */
@Component
public class RoleConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private static final String REALM_ACCESS_CLAIM = "realm_access";
    private static final String RESOURCE_ACCESS_CLAIM = "resource_access";
    private static final String ROLES_CLAIM = "roles";
    private static final String PREFERRED_USERNAME_CLAIM = "preferred_username";
    private static final String ROLE_PREFIX = "ROLE_";

    /** Giữ nguyên hành vi mặc định: sinh authority {@code SCOPE_*} từ claim scope. */
    private final JwtGrantedAuthoritiesConverter scopeConverter = new JwtGrantedAuthoritiesConverter();

    private final String clientId;

    public RoleConverter(AppSecurityProperties properties) {
        this.clientId = properties.clientId();
    }

    @Override
    public AbstractAuthenticationToken convert(@NotBlank Jwt jwt) {
        Set<GrantedAuthority> authorities = new LinkedHashSet<>(scopeConverter.convert(jwt));
        authorities.addAll(toAuthorities(realmRoles(jwt)));
        authorities.addAll(toAuthorities(clientRoles(jwt)));

        return new JwtAuthenticationToken(jwt, authorities, principalName(jwt));
    }

    /** {@code realm_access: { "roles": ["admin", ...] }} */
    private Collection<String> realmRoles(Jwt jwt) {
        return rolesOf(asMap(jwt.getClaim(REALM_ACCESS_CLAIM)));
    }

    /** {@code resource_access: { "<client-id>": { "roles": ["admin", ...] } }} */
    private Collection<String> clientRoles(Jwt jwt) {
        if (!StringUtils.hasText(clientId)) {
            return List.of();
        }
        Map<String, Object> resourceAccess = asMap(jwt.getClaim(RESOURCE_ACCESS_CLAIM));
        return rolesOf(asMap(resourceAccess.get(clientId)));
    }

    private Collection<String> rolesOf(Map<String, Object> accessClaim) {
        Object roles = accessClaim.get(ROLES_CLAIM);
        if (!(roles instanceof Collection<?> values)) {
            return List.of();
        }
        return values.stream()
                .filter(String.class::isInstance)
                .map(String.class::cast)
                .toList();
    }

    private Set<GrantedAuthority> toAuthorities(Collection<String> roles) {
        return roles.stream()
                .filter(StringUtils::hasText)
                .map(this::normalize)
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    /**
     * Keycloak thường đặt tên role dạng {@code kebab-case} chữ thường
     * ({@code file-admin}), trong khi {@code hasRole("FILE_ADMIN")} so khớp chính xác
     * chuỗi {@code ROLE_FILE_ADMIN}, nên phải chuẩn hoá trước.
     * Dùng {@link Locale#ROOT} để tránh lỗi chữ {@code i} của locale Thổ Nhĩ Kỳ.
     */
    private String normalize(String role) {
        String normalized = role.trim().replace('-', '_').replace(' ', '_').toUpperCase(Locale.ROOT);
        return normalized.startsWith(ROLE_PREFIX) ? normalized : ROLE_PREFIX + normalized;
    }

    /**
     * {@code sub} là UUID nên khó đọc trong log; ưu tiên {@code preferred_username}
     * và chỉ lùi về {@code sub} khi mapper tương ứng chưa được bật.
     */
    private String principalName(Jwt jwt) {
        String username = jwt.getClaimAsString(PREFERRED_USERNAME_CLAIM);
        return StringUtils.hasText(username) ? username : jwt.getSubject();
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> asMap(Object claim) {
        return claim instanceof Map<?, ?> map ? (Map<String, Object>) map : Map.of();
    }
}
