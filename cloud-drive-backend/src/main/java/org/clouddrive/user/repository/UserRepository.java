package org.clouddrive.user.repository;

import java.util.List;
import java.util.Optional;

import org.clouddrive.common.enums.Role;
import org.clouddrive.common.enums.UserStatus;
import org.clouddrive.user.entiy.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    /** Nạp luôn storagePackage trong cùng một query để tránh LazyInitializationException và query thừa. */
    @EntityGraph(attributePaths = "storagePackage")
    Optional<User> findByKeycloakUserId(String keycloakUserId);

    List<User> findAllByRole(Role role);
    long countByRole(Role role);
    long countByRoleAndStatus(Role role, UserStatus status);

}
