package org.clouddrive.packages;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StoragePackageRepository extends JpaRepository<StoragePackage, Long> {
    Optional<StoragePackage> findByNameAndActiveTrue(String name);
}
