package org.clouddrive.packages.entity;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Bảng giá của một gói theo từng khoảng thời gian. Ánh xạ bảng {@code packages_pricing}.
 *
 * <p>Mỗi lần đổi giá là thêm một dòng mới chứ không sửa dòng cũ. Nhờ vậy vẫn tra
 * được hoá đơn cũ đã tính theo giá nào — thứ mà một hệ thống có thu tiền bắt buộc
 * phải làm được.
 */
@Entity
@Table(name = "packages_pricing")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PackagePricing {

    /** Mẫu số để quy đổi phần trăm giảm giá. */
    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);

    /** Số chữ số thập phân giữ lại khi chia, trước khi làm tròn về đơn vị tiền. */
    private static final int DIVISION_SCALE = 6;

    /** Khớp với {@code DECIMAL(15,2)} của cột {@code base_price}. */
    private static final int MONEY_SCALE = 2;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * {@code FetchType.LAZY} là chủ ý và cần thiết: mặc định của {@code @ManyToOne}
     * là EAGER, nghĩa là mỗi lần đọc một dòng giá, Hibernate tự động đọc thêm cả gói —
     * đọc danh sách 100 dòng giá sẽ thành 101 truy vấn. Khi thật sự cần cả hai, hãy
     * dùng {@code JOIN FETCH} trong câu truy vấn thay vì đổi về EAGER.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "package_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_package_pricing_package")
    )
    private StoragePackage storagePackage;

    /**
     * Tiền LUÔN dùng {@link BigDecimal}, tuyệt đối không dùng {@code double} hay
     * {@code float}: số thực nhị phân không biểu diễn chính xác được 0.1, nên cộng
     * dồn nhiều dòng sẽ lệch dần và không bao giờ khớp sổ sách.
     */
    @Column(name = "base_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal basePrice;

    @Column(name = "discount_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal discountPercent = BigDecimal.ZERO;

    @Column(name = "valid_from", nullable = false)
    private LocalDateTime validFrom;

    /** {@code null} nghĩa là còn hiệu lực vô thời hạn. */
    @Column(name = "valid_to")
    private LocalDateTime validTo;

    /**
     * {@code @CreationTimestamp} để Hibernate tự điền lúc insert.
     *
     * <p>Cột này có {@code DEFAULT CURRENT_TIMESTAMP} ở CSDL, nhưng nếu phó mặc cho
     * CSDL thì sau khi lưu, trường trong đối tượng Java vẫn là {@code null} cho tới
     * khi nạp lại. Để Hibernate điền thì giá trị có ngay, khỏi phải nạp lại.
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public PackagePricing(StoragePackage storagePackage, BigDecimal basePrice, LocalDateTime validFrom) {
        this.storagePackage = storagePackage;
        this.basePrice = basePrice;
        this.validFrom = validFrom;
    }

    /**
     * Giá thực trả sau khi trừ chiết khấu.
     *
     * <p>Đặt ở đây để công thức chỉ tồn tại một chỗ duy nhất. Nếu để mỗi nơi tự nhân
     * chia, sớm muộn sẽ có chỗ làm tròn khác chỗ kia và số tiền hiển thị lệch với số
     * tiền thu.
     *
     * <p>{@code HALF_UP} là kiểu làm tròn quen thuộc trong kế toán (0.5 làm tròn lên).
     */
    public BigDecimal effectivePrice() {
        BigDecimal keptRatio = BigDecimal.ONE.subtract(
                discountPercent.divide(ONE_HUNDRED, DIVISION_SCALE, RoundingMode.HALF_UP)
        );
        return basePrice.multiply(keptRatio).setScale(MONEY_SCALE, RoundingMode.HALF_UP);
    }

    /**
     * Dòng giá này có hiệu lực tại thời điểm {@code moment} hay không.
     *
     * <p>Quy ước: {@code valid_from} tính là ĐÃ bao gồm, {@code valid_to} là KHÔNG
     * bao gồm. Nhờ vậy dòng giá cũ kết thúc đúng lúc dòng mới bắt đầu mà không có
     * khoảnh khắc nào hai dòng cùng hiệu lực.
     */
    public boolean isValidAt(LocalDateTime moment) {
        if (moment.isBefore(validFrom)) {
            return false;
        }
        return validTo == null || moment.isBefore(validTo);
    }


}
