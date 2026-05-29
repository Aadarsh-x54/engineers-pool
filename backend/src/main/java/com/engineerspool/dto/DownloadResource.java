package com.engineerspool.dto;

import org.springframework.core.io.Resource;

public record DownloadResource(
        Resource resource,
        String fileName,
        String contentType,
        Long fileSize
) {
}
