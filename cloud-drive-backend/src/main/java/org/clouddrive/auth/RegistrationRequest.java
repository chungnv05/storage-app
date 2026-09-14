package org.clouddrive.auth;

import java.util.Locale;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.clouddrive.common.enums.Role;


public record RegistrationRequest(

        @NotBlank(message = "Tên đăng nhập không được để trống")
        @Size(max = 50, message = "Tên đăng nhập tối đa 50 ký tự")
        String userName,

        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không đúng định dạng")
        @Size(max = 255, message = "Email tối đa 255 ký tự")
        String email,

        @NotBlank(message = "Mật khẩu không được để trống")
        @Size(min = 8, max = 128, message = "Mật khẩu phải từ 8 đến 128 ký tự")
        String password,

        @NotBlank(message = "Họ không được để trống")
        @Size(max = 49, message = "Họ tối đa 49 ký tự")
        String lastName,

        @NotBlank(message = "Tên không được để trống")
        @Size(max = 50, message = "Tên tối đa 50 ký tự")
        String firstName,

        Role role,

        @Pattern(regexp = "^\\+?[0-9]{9,15}$", message = "Số điện thoại không hợp lệ")
        String phone
) {


    public RegistrationRequest {
        email = email == null ? null : email.strip().toLowerCase(Locale.ROOT);
        lastName = lastName == null ? null : lastName.strip();
        firstName = firstName == null ? null : firstName.strip();
        phone = phone == null || phone.isBlank() ? null : phone.strip();
    }


    public String fullName() {
        return lastName + " " + firstName;
    }


}
