package com.engineerspool.storage;

import com.engineerspool.entity.FileType;

public record StorageResult(
        String storageKey,
        String fileUrl,
        String fileName,
        FileType fileType,
        long fileSize
) {
}
