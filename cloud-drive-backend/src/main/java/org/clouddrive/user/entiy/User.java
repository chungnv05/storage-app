package org.clouddrive.user.entiy;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.clouddrive.common.enums.Role;
import org.clouddrive.common.enums.UserStatus;
import org.clouddrive.packages.entity.StoragePackage;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;


@Entity
@Table(name = "users")
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "keycloak_user_id",
            length = 100,
            nullable = false,
            updatable = false,
            unique = true
    )
    private String keycloakUserId;

    @Column(
            name = "email",
            length = 255,
            nullable = false,
            unique = true
    )
    private String email;

    @Column(
            name = "full_name",
            length = 100
    )
    private String fullName;

    @Column(
            name = "phone",
            length = 20
    )
    private String phone;

    @Column(
            name = "avatar_url",
            length = 500
    )
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "role",
            length = 30,
            nullable = false
    )
    private Role role = Role.USER;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "status",
            length = 30,
            nullable = false
    )
    private UserStatus status = UserStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "package_id",
            foreignKey = @ForeignKey(name = "fk_users_package"),
            nullable = false
    )
    private StoragePackage storagePackage;

    @Column(
            name = "storage_used_bytes",
            nullable = false
    )
    private long storageUsedBytes = 0L;

    @CreationTimestamp
    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;


}



