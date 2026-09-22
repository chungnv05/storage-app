package org.clouddrive.packages.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface StoragePackageResponse {
    Long getId();

    String getName();

    long getStorageLimitBytes();

    BigDecimal getBasePrice();

    BigDecimal getDiscountPercent();

    LocalDateTime getValidFrom();

    LocalDateTime getValidTo();
}
