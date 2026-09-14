package org.clouddrive.keycloak;

import java.net.http.HttpClient;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.oauth2.client.AuthorizedClientServiceOAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientProviderBuilder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.client.OAuth2ClientHttpRequestInterceptor;
import org.springframework.web.client.RestClient;

@Configuration
public class KeycloakConfig {

    private static final Authentication SERVICE_ACCOUNT =
            new AnonymousAuthenticationToken(
                    "keycloak-admin",
                    "keycloak-admin",
                    AuthorityUtils.createAuthorityList("ROLE_ANONYMOUS")
            );

    @Bean
    OAuth2AuthorizedClientManager authorizedClientManager(
            ClientRegistrationRepository clientRegistrationRepository,
            OAuth2AuthorizedClientService authorizedClientService
    ) {

        var manager =
                new AuthorizedClientServiceOAuth2AuthorizedClientManager(
                        clientRegistrationRepository,
                        authorizedClientService
                );

        manager.setAuthorizedClientProvider(
                OAuth2AuthorizedClientProviderBuilder.builder()
                        .clientCredentials()
                        .build()
        );

        return manager;
    }

    @Bean
    RestClient keycloakAdminRestClient(
            RestClient.Builder builder,
            KeycloakProperties properties,
            OAuth2AuthorizedClientManager authorizedClientManager
    ) {

        var bearerTokenInterceptor =
                new OAuth2ClientHttpRequestInterceptor(
                        authorizedClientManager
                );

        bearerTokenInterceptor.setClientRegistrationIdResolver(
                request -> properties.adminClientRegistrationId()
        );

        bearerTokenInterceptor.setPrincipalResolver(
                request -> SERVICE_ACCOUNT
        );

        return builder
                .baseUrl(properties.adminApiBaseUrl())
                .requestFactory(requestFactory(properties))
                .requestInterceptor(bearerTokenInterceptor)
                .build();
    }

    private ClientHttpRequestFactory requestFactory(
            KeycloakProperties properties
    ) {

        HttpClient httpClient =
                HttpClient.newBuilder()
                        .connectTimeout(properties.connectTimeout())
                        .build();

        var factory =
                new JdkClientHttpRequestFactory(httpClient);

        factory.setReadTimeout(properties.readTimeout());

        return factory;
    }
}