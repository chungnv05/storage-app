package org.clouddrive.user.controller;

import org.clouddrive.packages.dto.StoragePackageResponse;
import org.clouddrive.user.dto.StatResponse;
import org.clouddrive.user.dto.UserResponse;
import org.clouddrive.user.service.AdminService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public List<UserResponse> getAllUsers() {
        return adminService.getAllUsers();
    }

    @GetMapping("/packages")
    public List<StoragePackageResponse> getAllPackages() {
        return adminService.getAllActivePackages();
    }

    @GetMapping("/stats")
    public StatResponse getStats() {
        return adminService.getStats();
    }


}
