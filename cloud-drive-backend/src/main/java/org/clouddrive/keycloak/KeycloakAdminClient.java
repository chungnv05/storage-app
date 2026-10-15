package org.clouddrive.keycloak;

import java.net.URI;
import java.util.List;

import org.clouddrive.common.enums.Role;
import org.clouddrive.common.enums.UserStatus;
import org.clouddrive.common.exception.InfoAlreadyExistsException;
import org.clouddrive.common.exception.KeycloakIntegrationException;
import org.clouddrive.common.exception.KeycloakUnavailableException;
import org.clouddrive.common.exception.UserNotFoundException;
import org.clouddrive.common.util.NameUtil;
import org.clouddrive.keycloak.representation.RoleRepresentation;
import org.clouddrive.keycloak.representation.UserRepresentation;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Component
public class KeycloakAdminClient {
    private final RestClient keycloakAdminRestClient;

    public KeycloakAdminClient(RestClient keycloakAdminRestClient) {
        this.keycloakAdminRestClient = keycloakAdminRestClient;
    }

    /**
     * Tạo user trên Keycloak và trả về id của user vừa tạo.
     * Không log {@code user} vì trong đó có mật khẩu dạng plain text.
     */
    public String createUser(UserRepresentation user, Role role) {
        URI location;
        try {
            location = keycloakAdminRestClient.post()
                    .uri("/users")
                    .body(user)
                    .retrieve()
                    .toBodilessEntity()
                    .getHeaders()
                    .getLocation();
        } catch (HttpClientErrorException.Conflict ex) {
            throw new InfoAlreadyExistsException("Email đã tồn tại");
        } catch (RestClientResponseException ex) {
            throw new KeycloakIntegrationException(
                    "Keycloak trả về " + ex.getStatusCode() + " khi tạo user: " + ex.getResponseBodyAsString(),
                    ex
            );
        } catch (ResourceAccessException ex) {
            throw new KeycloakUnavailableException("Không kết nối được tới Keycloak", ex);
        }

        return extractUserId(location);

    }

    private String extractUserId(URI location) {
        if (location == null || location.getPath() == null) {
            throw new KeycloakIntegrationException("Keycloak không trả về header Location khi tạo user");
        }

        String path = location.getPath();
        String userId = path.substring(path.lastIndexOf('/') + 1);
        if (userId.isBlank()) {
            throw new KeycloakIntegrationException("Không đọc được user id từ Location: " + location);
        }
        return userId;
    }

    // Cache theo role name tại đây, tạo 1 bean mới inject và gọi do @Cacheable không hoạt động trong cùng 1 class (Spring proxy)
    public RoleRepresentation getRealmRole(String roleName) {
        try {
            return keycloakAdminRestClient.get()
                    .uri("/roles/{roleName}", roleName)
                    .retrieve()
                    .body(RoleRepresentation.class);

        } catch (RestClientResponseException ex) {
            throw new KeycloakIntegrationException(
                    "Không lấy được role " + roleName
                            + " từ Keycloak: "
                            + ex.getResponseBodyAsString(),
                    ex
            );

        } catch (ResourceAccessException ex) {
            throw new KeycloakUnavailableException(
                    "Không kết nối được tới Keycloak",
                    ex
            );
        }
    }

    public void assignRealmRole(String userId, String roleName) {

        RoleRepresentation role = getRealmRole(roleName);

        try {
            keycloakAdminRestClient.post()
                    .uri("/users/{userId}/role-mappings/realm", userId)
                    .body(List.of(role))
                    .retrieve()
                    .toBodilessEntity();

        } catch (RestClientResponseException ex) {
            throw new KeycloakIntegrationException(
                    "Không assign được role " + roleName
                            + " cho user " + userId
                            + ": " + ex.getResponseBodyAsString(),
                    ex
            );


        } catch (ResourceAccessException ex) {
            throw new KeycloakUnavailableException(
                    "Không kết nối được tới Keycloak",
                    ex
            );
        }
    }

    public void deleteUser(String userId) {
        try {
            keycloakAdminRestClient.delete()
                    .uri("/users/{id}", userId)
                    .retrieve()
                    .toBodilessEntity();
        } catch (HttpClientErrorException.NotFound ex) {
            // User đã không còn trên Keycloak, không cần làm gì thêm
        } catch (RestClientResponseException ex) {
            throw new KeycloakIntegrationException(
                    "Keycloak trả về " + ex.getStatusCode() + " khi xoá user " + userId + ": " + ex.getResponseBodyAsString(),
                    ex
            );
        } catch (ResourceAccessException ex) {
            throw new KeycloakUnavailableException("Không kết nối được tới Keycloak", ex);
        }
    }

    public UserRepresentation getUser(String userId) {
        try {
            return keycloakAdminRestClient
                    .get()
                    .uri("/users/{userId}", userId)
                    .retrieve()
                    .body(UserRepresentation.class);

        } catch (HttpClientErrorException.NotFound ex) {
            throw new KeycloakIntegrationException(
                    "Không tìm thấy user " + userId + " trên Keycloak",
                    ex
            );

        } catch (RestClientResponseException ex) {
            throw new KeycloakIntegrationException(
                    "Keycloak trả về " + ex.getStatusCode()
                            + " khi lấy user " + userId
                            + ": " + ex.getResponseBodyAsString(),
                    ex
            );

        } catch (ResourceAccessException ex) {
            throw new KeycloakUnavailableException(
                    "Không kết nối được tới Keycloak",
                    ex
            );
        }
    }

    public void updateUserStatus(String keycloakUserId, boolean enabled) {
        UserRepresentation currentUser = getUser(keycloakUserId);

        UserRepresentation updatedUser = new UserRepresentation(
                currentUser.username(),
                currentUser.email(),
                currentUser.firstName(),
                currentUser.lastName(),
                enabled,
                currentUser.emailVerified(),
                currentUser.credentials()
        );

        try {
            keycloakAdminRestClient
                    .put()
                    .uri("/users/{userId}", keycloakUserId)
                    .body(updatedUser)
                    .retrieve()
                    .toBodilessEntity();

        } catch (HttpClientErrorException.NotFound ex) {
            throw new KeycloakIntegrationException(
                    "Không tìm thấy user " + keycloakUserId + " trên Keycloak",
                    ex
            );

        } catch (RestClientResponseException ex) {
            throw new KeycloakIntegrationException(
                    "Keycloak trả về " + ex.getStatusCode()
                            + " khi cập nhật trạng thái user "
                            + keycloakUserId
                            + ": " + ex.getResponseBodyAsString(),
                    ex
            );

        } catch (ResourceAccessException ex) {
            throw new KeycloakUnavailableException(
                    "Không kết nối được tới Keycloak",
                    ex
            );
        }
    }

    public void updateUser(String keycloakUserId, String fullName, String email, String phone) {
        UserRepresentation currentUser = getUser(keycloakUserId);

        String[] nameParts = NameUtil.splitFullName(fullName);
        String firstName = nameParts[0];
        String lastName = nameParts[1];

        UserRepresentation updatedUser = new UserRepresentation(
                currentUser.username(),
                email,
                firstName,
                lastName,
                currentUser.enabled(),
                currentUser.emailVerified(),
                currentUser.credentials()
        );

        try {
            keycloakAdminRestClient
                    .put()
                    .uri("/users/{userId}", keycloakUserId)
                    .body(updatedUser)
                    .retrieve()
                    .toBodilessEntity();

        } catch (HttpClientErrorException.Conflict ex) {
            throw new InfoAlreadyExistsException("Email đã tồn tại");
        } catch (RestClientResponseException ex) {
            throw new KeycloakIntegrationException(
                    "Keycloak trả về " + ex.getStatusCode()
                            + " khi cập nhật thông tin user "
                            + keycloakUserId
                            + ": " + ex.getResponseBodyAsString(),
                    ex
            );
        } catch (ResourceAccessException ex) {
            throw new KeycloakUnavailableException(
                    "Không kết nối được tới Keycloak",
                    ex
            );
        }
    }

    public void logoutUser(String keycloakUserId) {
        try {
            keycloakAdminRestClient.post()
                    .uri("/users/{userId}/logout", keycloakUserId)
                    .retrieve()
                    .toBodilessEntity();

        } catch (HttpClientErrorException.NotFound ex) {
            throw new UserNotFoundException(
                    "Không tìm thấy user " + keycloakUserId + " trên Keycloak"
            );

        } catch (RestClientResponseException ex) {
            throw new KeycloakIntegrationException(
                    "Keycloak trả về " + ex.getStatusCode()
                            + " khi logout user "
                            + keycloakUserId
                            + ": " + ex.getResponseBodyAsString(),
                    ex
            );

        } catch (ResourceAccessException ex) {
            throw new KeycloakUnavailableException(
                    "Không kết nối được tới Keycloak",
                    ex
            );
        }
    }

}
