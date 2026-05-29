package com.engineerspool.storage;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    StorageResult store(MultipartFile file);

    Resource loadAsResource(String storageKey);

    void delete(String storageKey);
}
