package org.clouddrive.auth;

import java.util.List;

import org.clouddrive.common.exception.InfoAlreadyExistsException;
import org.clouddrive.common.exception.PackageNotFoundException;
import org.clouddrive.keycloak.representation.CredentialRepresentation;
import org.clouddrive.keycloak.KeycloakAdminClient;
import org.clouddrive.keycloak.representation.UserRepresentation;
import org.clouddrive.packages.StoragePackage;
import org.clouddrive.packages.StoragePackageRepository;
import org.clouddrive.packages.StoragePackageService;
import org.clouddrive.user.User;
import org.clouddrive.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

@Service
public class RegistrationService {

    private static final Logger log = LoggerFactory.getLogger(RegistrationService.class);

    private final String defaultPackageName;
    private final UserRepository userRepository;
    private final StoragePackageService storagePackageService;
    private final KeycloakAdminClient keycloakAdminClient;

    public RegistrationService(
            UserRepository userRepository,
            StoragePackageService storagePackageService,
            KeycloakAdminClient keycloakAdminClient,
            @Value("${app.default-package}") String defaultPackageName
    ) {
        this.userRepository = userRepository;
        this.storagePackageService = storagePackageService;
        this.keycloakAdminClient = keycloakAdminClient;
        this.defaultPackageName = defaultPackageName;
    }

    public void registerUser(RegistrationRequest request) {
        StoragePackage defaultPackage = storagePackageService.getActivePackage(defaultPackageName);


        UserRepresentation userRepresentation = new UserRepresentation(
                request.userName(),
                request.email(),
                request.firstName(),
                request.lastName(),
                true,
                false,
                List.of(CredentialRepresentation.password(request.password()))
        );

        String keycloakUserId = keycloakAdminClient.createUser(userRepresentation, request.role());

        try {
            saveUser(request, keycloakUserId, defaultPackage);
        } catch (DataIntegrityViolationException ex) {
            // Request khác cùng email/số điện thoại đã được lưu trước (vượt qua checkInfoAlreadyExists cùng lúc)
            log.warn("Vi phạm ràng buộc dữ liệu khi lưu user, keycloakUserId={}", keycloakUserId, ex);
            rollbackKeycloakUser(keycloakUserId, ex);
            throw new InfoAlreadyExistsException("Email hoặc số điện thoại đã tồn tại");
        } catch (RuntimeException ex) {
            rollbackKeycloakUser(keycloakUserId, ex);
            throw ex;
        }

        log.info("Đăng ký thành công, keycloakUserId={}", keycloakUserId);
    }

    /**
     * Không đặt @Transactional cho registerUser: save() tự chạy trong transaction riêng và commit
     * ngay khi trả về, nên mọi lỗi ghi DB (kể cả lỗi lúc commit) đều bị bắt trong khối try ở trên.
     * Nếu bọc cả hàm trong transaction, commit sẽ xảy ra sau khi hàm kết thúc, ngoài khối try,
     * và user trên Keycloak sẽ không được xoá khi commit lỗi.
     */
    private void saveUser(RegistrationRequest request, String keycloakUserId, StoragePackage storagePackage) {
        User user = new User();
        user.setKeycloakUserId(keycloakUserId);
        user.setEmail(request.email());
        user.setFullName(request.fullName());
        user.setPhone(request.phone());
        user.setRole(request.role());
        user.setStoragePackage(storagePackage);
        userRepository.save(user);
    }

    private void rollbackKeycloakUser(String keycloakUserId, RuntimeException cause) {
        try {
            keycloakAdminClient.deleteUser(keycloakUserId);
            log.info("Đã xoá user trên Keycloak sau khi lưu DB thất bại, keycloakUserId={}", keycloakUserId);
        } catch (RuntimeException deleteEx) {
            // Không che lỗi gốc; ghi log để xoá tay user bị lệch trên Keycloak
            log.error("KHÔNG xoá được user trên Keycloak, cần xoá thủ công, keycloakUserId={}", keycloakUserId, deleteEx);
            cause.addSuppressed(deleteEx);
        }
    }


}
