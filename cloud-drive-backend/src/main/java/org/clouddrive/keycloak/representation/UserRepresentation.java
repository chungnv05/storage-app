package org.clouddrive.keycloak.representation;

import java.util.List;

public record UserRepresentation(
    String username,
    String email,
    String firstName,
    String lastName,
    boolean enabled,
    boolean emailVerified,
    List<CredentialRepresentation> credentials
) {
}
