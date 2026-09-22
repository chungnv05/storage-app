package org.clouddrive.user;

import org.clouddrive.common.exception.UserNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String keycloakUserId) {
        return userRepository.findByKeycloakUserId(keycloakUserId)
                .map(UserResponse::from)
                .orElseThrow(() -> new UserNotFoundException(
                        "Không tìm thấy user trong DB ứng với keycloakUserId=" + keycloakUserId
                ));
    }


}
