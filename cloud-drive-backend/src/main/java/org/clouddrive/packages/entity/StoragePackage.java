package org.clouddrive.packages.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Table(name = "packages")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StoragePackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @Column(name = "storage_limit_bytes", nullable = false)
    private long storageLimitBytes;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;


    public StoragePackage(String name, long storageLimitBytes) {
        this.name = name;
        this.storageLimitBytes = storageLimitBytes;
    }


}
