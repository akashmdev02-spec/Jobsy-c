package com.naukri.dto;

import com.naukri.entity.User;
import jakarta.validation.constraints.*;
import lombok.*;

public class AuthDtos {
    @Data public static class RegisterRequest {
        @NotBlank private String fullName;
        @Email @NotBlank private String email;
        @Size(min = 6) private String password;
        @NotNull private User.Role role;
        private String phone;
    }
    @Data public static class LoginRequest {
        @Email @NotBlank private String email;
        @NotBlank private String password;
    }
    @Data @AllArgsConstructor @NoArgsConstructor public static class AuthResponse {
        private String token;
        private Long userId;
        private String email;
        private String fullName;
        private String role;
    }
}
