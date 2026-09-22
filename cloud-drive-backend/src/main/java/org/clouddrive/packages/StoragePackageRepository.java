package org.clouddrive.packages;

import org.clouddrive.packages.dto.StoragePackageResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StoragePackageRepository extends JpaRepository<StoragePackage, Long> {
    Optional<StoragePackage> findByNameAndActiveTrue(String name);


    @Query("""
    SELECT
        p.id AS id,
        p.name AS name,
        p.storageLimitBytes AS storageLimitBytes,
        pp.basePrice AS basePrice,
        pp.discountPercent AS discountPercent,
        pp.validFrom AS validFrom,
        pp.validTo AS validTo
    FROM StoragePackage p
    JOIN PackagePricing pp
        ON pp.storagePackage = p
    WHERE p.active = true
""")
    List<StoragePackageResponse> findAllActivePackagesWithPrice();
}
