package org.clouddrive.user.service;

import org.clouddrive.common.enums.Role;
import org.clouddrive.common.enums.UserStatus;
import org.clouddrive.common.exception.ForbiddenException;
import org.clouddrive.common.exception.UserNotFoundException;
import org.clouddrive.keycloak.KeycloakAdminClient;
import org.clouddrive.keycloak.representation.UserRepresentation;
import org.clouddrive.packages.repository.StoragePackageRepository;
import org.clouddrive.packages.dto.StoragePackageResponse;
import org.clouddrive.user.dto.StatResponse;
import org.clouddrive.user.dto.UserResponse;
import org.clouddrive.user.entiy.User;
import org.clouddrive.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {
    private final UserRepository userRepository;
    private final KeycloakAdminClient keycloakAdminClient;

    public AdminService(UserRepository userRepository,
                        KeycloakAdminClient keycloakAdminClient) {
        this.userRepository = userRepository;
        this.keycloakAdminClient = keycloakAdminClient;
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAllByRole(Role.USER).stream()
                .map(UserResponse::from)
                .collect(Collectors.toList());
    }

    public StatResponse getStats() {
        long totalUsers = userRepository.countByRole(Role.USER);

        long activeUsers =
                userRepository.countByRoleAndStatus(
                        Role.USER,
                        UserStatus.ACTIVE
                );

        long paidUsers = 0L; // xử lý payment sau

        long storageUsedBytes = 0L; // xử lý storageUsedBytes sau

        long storageLimitBytes = 0L; // xử lý storageLimitBytes sau

        long totalPaidAmount = 0L; // xử lý payment sau

        return new StatResponse(
                totalUsers,
                activeUsers,
                paidUsers,
                storageUsedBytes,
                storageLimitBytes,
                totalPaidAmount
        );
    }

    public void updateUserStatus(String keycloakAdminId, Long userId, UserStatus newStatus) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy user!"));

        if (keycloakAdminId.equals(user.getKeycloakUserId())) {
            throw new ForbiddenException("Không thể thay đổi trạng thái của chính mình!");
        }

        boolean enabled = toKeycloakEnabled(newStatus);

        keycloakAdminClient.updateUserStatus(
                user.getKeycloakUserId(),
                enabled
        );
        keycloakAdminClient.logoutUser(
                user.getKeycloakUserId()
        );

        try {
            user.setStatus(newStatus);
            userRepository.saveAndFlush(user);
        } catch (RuntimeException ex) {
            // Rollback Keycloak status if DB update fails
            keycloakAdminClient.updateUserStatus(
                    user.getKeycloakUserId(),
                    !enabled
            );
            throw ex;
        }

    }

    private boolean toKeycloakEnabled(UserStatus status) {
        return switch (status) {
            case ACTIVE -> true;
            case LOCKED -> false;
        };
    }



}
