package org.clouddrive.user.service;

import org.clouddrive.common.exception.UserNotFoundException;
import org.clouddrive.keycloak.KeycloakAdminClient;
import org.clouddrive.user.dto.UserRequest;
import org.clouddrive.user.dto.UserResponse;
import org.clouddrive.user.entiy.User;
import org.clouddrive.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final KeycloakAdminClient keycloakAdminClient;


    public UserService(UserRepository userRepository, KeycloakAdminClient keycloakAdminClient) {
        this.userRepository = userRepository;
        this.keycloakAdminClient = keycloakAdminClient;
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String keycloakUserId) {
        return userRepository.findByKeycloakUserId(keycloakUserId)
                .map(UserResponse::from)
                .orElseThrow(() -> new UserNotFoundException(
                        "Không tìm thấy user!"
                ));
    }

    public void updateUserInfo(String keycloakUserId, UserRequest userRequest) {
        User user = userRepository.findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() -> new UserNotFoundException(
                        "Không tìm thấy user!"
                ));
        String fullName = user.getFullName();
        String email = user.getEmail();
        String phone = user.getPhone();

        keycloakAdminClient.updateUser(keycloakUserId, userRequest.getFullName(), userRequest.getEmail(), userRequest.getPhone());


        try {
            user.setFullName(userRequest.getFullName());
            user.setEmail(userRequest.getEmail());
            user.setPhone(userRequest.getPhone());
            userRepository.saveAndFlush(user);
        } catch (Exception e) {
            // Nếu cập nhật vào database thất bại, rollback lại thông tin trên Keycloak
            keycloakAdminClient.updateUser(keycloakUserId, fullName, email, phone);
            throw e;
        }
    }


}
