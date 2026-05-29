package com.engineerspool.dto;

import com.engineerspool.security.PasswordStrength;
import jakarta.validation.constraints.NotBlank;

public record PasswordChangeRequest(
        @NotBlank String currentPassword,
        @NotBlank @PasswordStrength String newPassword
) {
}
