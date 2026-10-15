package org.clouddrive.packages.service.impl;

import org.clouddrive.packages.dto.StoragePackageResponse;
import org.clouddrive.packages.entity.StoragePackage;
import org.clouddrive.packages.repository.StoragePackageRepository;
import org.clouddrive.packages.service.StoragePackageService;
import org.springframework.cache.annotation.Cacheable;
import org.clouddrive.common.exception.PackageNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StoragePackageServiceImpl implements StoragePackageService {
    private final StoragePackageRepository storagePackageRepository;

    public StoragePackageServiceImpl(StoragePackageRepository storagePackageRepository) {
        this.storagePackageRepository = storagePackageRepository;
    }

    @Override
    @Cacheable(value = "storage-packages", key = "#packageName")
    public StoragePackage getActivePackage(String packageName) {
        return storagePackageRepository.findByNameAndActiveTrue(packageName)
                .orElseThrow(() ->
                        new PackageNotFoundException("Không tìm thấy gói: " + packageName));
    }

    @Override
    public List<StoragePackageResponse> getAllActivePackages() {
        return storagePackageRepository.findAllActivePackagesWithPrice();
    }

}
