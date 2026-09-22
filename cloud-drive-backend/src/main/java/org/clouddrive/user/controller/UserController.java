package org.clouddrive.user.controller;

import org.clouddrive.user.dto.UserResponse;
import org.clouddrive.user.service.UserService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Dùng claim {@code sub} (id user trên Keycloak) để tìm user, không dùng email hay
     * preferred_username vì hai giá trị này có thể bị đổi trên Keycloak.
     */
    @GetMapping("/me")
    public UserResponse getCurrentUser(@AuthenticationPrincipal Jwt jwt) {
        return userService.getCurrentUser(jwt.getSubject());
    }

}
