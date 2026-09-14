package org.clouddrive.keycloak;


import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;

@Validated
@ConfigurationProperties(prefix = "keycloak")
public record KeycloakProperties(
        @NotBlank
        String serverUrl,
        @NotBlank
        String realm,
        @NotBlank
        String adminClientRegistrationId,
        @DefaultValue("3s")
        Duration connectTimeout,
        @DefaultValue("10s")
        Duration readTimeout
) {
    public KeycloakProperties {
        if (serverUrl != null) {
            while (serverUrl.endsWith("/")) {
                serverUrl = serverUrl.substring(0, serverUrl.length() - 1);
            }
        }
    }

    public String adminApiBaseUrl() {
        return serverUrl + "/admin/realms/" + realm;
    }

}
