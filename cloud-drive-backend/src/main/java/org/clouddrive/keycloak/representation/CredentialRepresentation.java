package org.clouddrive.keycloak.representation;

public record CredentialRepresentation(
    String type,
    String value,
    boolean temporary
) {

    public static CredentialRepresentation password(String value) {
        return new CredentialRepresentation("password", value, false);
    }
}
