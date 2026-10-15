package org.clouddrive.user.service;

import org.clouddrive.common.enums.UserStatus;
import org.clouddrive.user.dto.StatResponse;
import org.clouddrive.user.dto.UserResponse;

import java.util.List;

public interface AdminService {

    List<UserResponse> getAllUsers();

    StatResponse getStats();

    void updateUserStatus(String keycloakAdminId, Long userId, UserStatus newStatus);

}
