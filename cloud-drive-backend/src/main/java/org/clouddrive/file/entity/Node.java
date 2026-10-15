package org.clouddrive.file.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.clouddrive.common.enums.FileCategory;
import org.clouddrive.common.enums.NodeType;
import org.clouddrive.user.entiy.User;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "files",
        indexes = {
                @Index(
                        name = "idx_files_owner_parent_deleted",
                        columnList = "owner_id, parent_id, deleted_at"
                )
        }
)
@Getter
@Setter
public class Node {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Người sở hữu file hoặc thư mục
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    // Thư mục cha; null nếu nằm ở thư mục gốc
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Node parent;

    @Column(nullable = false, length = 255)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NodeType type;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private FileCategory category;

    @Column(name = "mime_type", length = 127)
    private String mimeType;

    @Column(name = "size_bytes", nullable = false)
    private long sizeBytes = 0L;

    // Key định danh object trên MinIO hoặc storage khác
    @Column(name = "storage_key", length = 500)
    private String storageKey;

    // null nghĩa là chưa bị xóa
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
