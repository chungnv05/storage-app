package org.clouddrive.user.service;

import org.clouddrive.common.enums.Role;
import org.clouddrive.common.enums.UserStatus;
import org.clouddrive.packages.repository.StoragePackageRepository;
import org.clouddrive.packages.dto.StoragePackageResponse;
import org.clouddrive.user.dto.StatResponse;
import org.clouddrive.user.dto.UserResponse;
import org.clouddrive.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {
    private final StoragePackageRepository storagePackageRepository;
    private final UserRepository userRepository;

    public AdminService(StoragePackageRepository storagePackageRepository, UserRepository userRepository) {
        this.storagePackageRepository = storagePackageRepository;
        this.userRepository = userRepository;
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAllByRole(Role.USER).stream()
                .map(UserResponse::from)
                .collect(Collectors.toList());
    }

    public List<StoragePackageResponse> getAllActivePackages() {
        return storagePackageRepository.findAllActivePackagesWithPrice();
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


}
