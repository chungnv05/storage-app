package org.clouddrive.packages.service;

import org.clouddrive.packages.dto.StoragePackageResponse;
import org.clouddrive.packages.entity.StoragePackage;

import java.util.List;

public interface StoragePackageService {

    StoragePackage getActivePackage(String packageName);

    List<StoragePackageResponse> getAllActivePackages();

}
