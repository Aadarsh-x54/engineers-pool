package com.engineerspool.dto;

import java.time.Instant;
import java.util.Set;

public record LoginResponse(
        String token,
        Instant expiresAt,
        String email,
        Set<String> roles
) {
}
