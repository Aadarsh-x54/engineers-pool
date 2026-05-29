package com.engineerspool.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record GoogleTokenInfo(
    String iss,
    String sub,
    String aud,
    String email,
    @JsonProperty("email_verified") String emailVerified,
    String name,
    String picture
) {}
