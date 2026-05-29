package com.engineerspool.dto;

import jakarta.validation.constraints.NotBlank;

public record GoogleLoginRequest(
    @NotBlank(message = "Google ID token credential is required.")
    String credential
) {}
