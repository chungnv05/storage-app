package org.clouddrive.user.service;

import org.clouddrive.common.exception.InfoAlreadyExistsException;
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

        if (userRepository.existsByEmail(userRequest.getEmail())) {
            throw new InfoAlreadyExistsException(
                    "Email đã tồn tại!"
            );
        }

        User user = userRepository.findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() -> new UserNotFoundException(
                        "Không tìm thấy user!"
                ));
        String oldFullName = user.getFullName();
        String oldEmail = user.getEmail();
        String oldPhone = user.getPhone();

        String newFullName = userRequest.getFullName();
        String newEmail = userRequest.getEmail();
        String newPhone = userRequest.getPhone();

        if (newFullName.isEmpty()) {
            newFullName = oldFullName;
        }
        if (newEmail.isEmpty()) {
            newEmail = oldEmail;
        }
        if (newPhone.isEmpty()) {
            newPhone = oldPhone;
        }


        try {
            user.setFullName(newFullName);
            user.setEmail(newEmail);
            user.setPhone(newPhone);
            userRepository.saveAndFlush(user);
        } catch (Exception e) {
            // Nếu cập nhật vào database thất bại, rollback lại thông tin trên Keycloak
            keycloakAdminClient.updateUser(keycloakUserId, oldFullName, oldEmail, oldPhone);
            throw e;
        }
    }


}
