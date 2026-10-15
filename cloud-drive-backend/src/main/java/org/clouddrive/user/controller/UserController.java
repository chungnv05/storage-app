package org.clouddrive.user.controller;

import jakarta.validation.Valid;
import org.clouddrive.packages.dto.StoragePackageResponse;
import org.clouddrive.packages.service.StoragePackageService;
import org.clouddrive.user.dto.UserRequest;
import org.clouddrive.user.dto.UserResponse;
import org.clouddrive.user.service.UserService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;
    private final StoragePackageService storagePackageService;

    public UserController(UserService userService, StoragePackageService storagePackageService) {
        this.userService = userService;
        this.storagePackageService = storagePackageService;
    }

    /**
     * Dùng claim {@code sub} (id user trên Keycloak) để tìm user, không dùng email hay
     * preferred_username vì hai giá trị này có thể bị đổi trên Keycloak.
     */
    @GetMapping("/me")
    public UserResponse getCurrentUser(@AuthenticationPrincipal Jwt jwt) {
        return userService.getCurrentUser(jwt.getSubject());
    }

    @GetMapping("/packages")
    public List<StoragePackageResponse> getAllPackages() {
        return storagePackageService.getAllActivePackages();
    }

    @PatchMapping("/me")
    public void updateUserInfo(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody UserRequest userRequest) {
        userService.updateUserInfo(jwt.getSubject(), userRequest);
    }

}
