package org.clouddrive.user.dto;

public record StatResponse(
        long totalUsers,
        long activeUsers,
        long paidUsers,
        long storageUsedBytes,
        long storageLimitBytes,
        long totalPaidAmount
) {
}
