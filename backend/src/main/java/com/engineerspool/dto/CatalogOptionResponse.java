package com.engineerspool.dto;

public record CatalogOptionResponse(
        Long id,
        String name,
        String slug,
        String code,
        String fullName,
        String description
) {
}
