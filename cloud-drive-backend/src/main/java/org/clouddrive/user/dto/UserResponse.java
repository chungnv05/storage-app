package org.clouddrive.user.dto;

import java.time.LocalDateTime;

import org.clouddrive.common.enums.Role;
import org.clouddrive.common.enums.UserStatus;
import org.clouddrive.packages.StoragePackage;
import org.clouddrive.user.User;

public record UserResponse(
        Long id,
        String email,
        String fullName,
        String phone,
        String avatarUrl,
        Role role,
        UserStatus status,
        String packageName,
        long storageLimitBytes,
        long storageUsedBytes,
        LocalDateTime createdAt
) {

    public static UserResponse from(User user) {
        StoragePackage storagePackage = user.getStoragePackage();
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getAvatarUrl(),
                user.getRole(),
                user.getStatus(),
                storagePackage.getName(),
                storagePackage.getStorageLimitBytes(),
                user.getStorageUsedBytes(),
                user.getCreatedAt()
        );
    }
}
