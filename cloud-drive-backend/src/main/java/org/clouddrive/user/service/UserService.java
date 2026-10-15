package org.clouddrive.user.service;

import org.clouddrive.user.dto.UserRequest;
import org.clouddrive.user.dto.UserResponse;

public interface UserService {

    UserResponse getCurrentUser(String keycloakUserId);

    void updateUserInfo(String keycloakUserId, UserRequest userRequest);

}
