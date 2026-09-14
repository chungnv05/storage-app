package org.clouddrive.user;

import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    /** Nạp luôn storagePackage trong cùng một query để tránh LazyInitializationException và query thừa. */
    @EntityGraph(attributePaths = "storagePackage")
    Optional<User> findByKeycloakUserId(String keycloakUserId);
}
