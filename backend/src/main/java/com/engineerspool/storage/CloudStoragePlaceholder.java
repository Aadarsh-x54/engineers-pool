package com.engineerspool.storage;

import com.engineerspool.exception.BadRequestException;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@ConditionalOnProperty(prefix = "app.storage", name = "provider", havingValue = "cloud")
public class CloudStoragePlaceholder implements FileStorageService {

    @Override
    public StorageResult store(MultipartFile file) {
        throw new BadRequestException("Cloud storage provider is not configured. Use local storage or add an S3/Cloudinary adapter.");
    }

    @Override
    public Resource loadAsResource(String storageKey) {
        throw new BadRequestException("Cloud storage provider is not configured.");
    }

    @Override
    public void delete(String storageKey) {
    }
}
