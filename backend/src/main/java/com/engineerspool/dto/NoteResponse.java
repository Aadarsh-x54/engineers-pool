package com.engineerspool.dto;

import com.engineerspool.entity.FileType;
import com.engineerspool.entity.NoteType;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record NoteResponse(
        UUID id,
        String title,
        String description,
        String fileUrl,
        String downloadUrl,
        String fileName,
        FileType fileType,
        Long fileSize,
        String readableFileSize,
        NoteType noteType,
        CatalogOptionResponse semester,
        CatalogOptionResponse branch,
        CatalogOptionResponse subject,
        CatalogOptionResponse programmingCategory,
        List<String> tags,
        Long downloadCount,
        boolean published,
        Instant createdAt,
        Instant updatedAt
) {
}
