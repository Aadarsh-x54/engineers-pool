package com.engineerspool.dto;

import jakarta.validation.constraints.NotBlank;

public record SettingRequest(@NotBlank String value) {
}
