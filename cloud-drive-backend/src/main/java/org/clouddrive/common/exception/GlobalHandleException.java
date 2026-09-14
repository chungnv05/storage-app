package org.clouddrive.common.exception;

import java.util.LinkedHashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;


@RestControllerAdvice
public class GlobalHandleException extends ResponseEntityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalHandleException.class);

    @ExceptionHandler(InfoAlreadyExistsException.class)
    public ProblemDetail handleInfoAlreadyExistsException(InfoAlreadyExistsException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
        problemDetail.setTitle("Thông tin đã tồn tại");
        return problemDetail;
    }

    @ExceptionHandler(PackageNotFoundException.class)
    public ProblemDetail handlePackageNotFoundException(PackageNotFoundException ex) {
        log.error("Lỗi cấu hình gói lưu trữ: {}", ex.getMessage(), ex);
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Hệ thống đang gặp sự cố, vui lòng thử lại sau"
        );
        problemDetail.setTitle("Lỗi hệ thống");
        return problemDetail;
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ProblemDetail handleUserNotFoundException(UserNotFoundException ex) {
        // Token hợp lệ nhưng DB không có user: dữ liệu Keycloak và DB đang lệch nhau
        log.warn(ex.getMessage());
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.NOT_FOUND,
                "Không tìm thấy thông tin tài khoản"
        );
        problemDetail.setTitle("Không tìm thấy tài khoản");
        return problemDetail;
    }

    @ExceptionHandler(KeycloakIntegrationException.class)
    public ProblemDetail handleKeycloakIntegrationException(KeycloakIntegrationException ex) {
        log.error("Lỗi khi gọi Keycloak Admin API: {}", ex.getMessage(), ex);
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Hệ thống đang gặp sự cố, vui lòng thử lại sau"
        );
        problemDetail.setTitle("Lỗi hệ thống");
        return problemDetail;
    }

    @ExceptionHandler(KeycloakUnavailableException.class)
    public ProblemDetail handleKeycloakUnavailableException(KeycloakUnavailableException ex) {
        log.error("Keycloak không phản hồi: {}", ex.getMessage(), ex);
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.SERVICE_UNAVAILABLE,
                "Dịch vụ xác thực tạm thời không khả dụng, vui lòng thử lại sau"
        );
        problemDetail.setTitle("Dịch vụ tạm thời không khả dụng");
        return problemDetail;
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request
    ) {
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getBindingResult()
                .getFieldErrors()
                .forEach(error -> errors.putIfAbsent(error.getField(), error.getDefaultMessage()));

        ProblemDetail problemDetail = ex.getBody();
        problemDetail.setTitle("Dữ liệu không hợp lệ");
        problemDetail.setDetail("Vui lòng kiểm tra lại thông tin đã nhập");
        problemDetail.setProperty("errors", errors);

        return handleExceptionInternal(ex, problemDetail, headers, status, request);
    }

}
