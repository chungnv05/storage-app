package org.clouddrive.config;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;


@Validated
@ConfigurationProperties(prefix = "app.security")
public record AppSecurityProperties(
        @NotBlank String audience,
        @NotBlank String clientId,
        @NotEmpty List<@NotBlank String> allowedOrigins
) {
}
