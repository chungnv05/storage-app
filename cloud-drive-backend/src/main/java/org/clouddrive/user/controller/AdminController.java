package org.clouddrive.user.controller;

import org.clouddrive.common.enums.UserStatus;
import org.clouddrive.packages.dto.StoragePackageResponse;
import org.clouddrive.packages.service.StoragePackageService;
import org.clouddrive.user.dto.StatResponse;
import org.clouddrive.user.dto.UserResponse;
import org.clouddrive.user.service.AdminService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final AdminService adminService;
    private final StoragePackageService storagePackageService;

    public AdminController(AdminService adminService, StoragePackageService storagePackageService) {
        this.adminService = adminService;
        this.storagePackageService = storagePackageService;
    }

    @GetMapping("/users")
    public List<UserResponse> getAllUsers() {
        return adminService.getAllUsers();
    }

    @GetMapping("/packages")
    public List<StoragePackageResponse> getAllPackages() {
        return storagePackageService.getAllActivePackages();
    }

    @GetMapping("/stats")
    public StatResponse getStats() {
        return adminService.getStats();
    }

    @PutMapping("/users/{userId}/status")
    public void updateUserStatus(@AuthenticationPrincipal Jwt jwt,
                                 @PathVariable Long userId,
                                 @RequestParam UserStatus status) {
        adminService.updateUserStatus(jwt.getSubject(), userId, status);
    }


}
