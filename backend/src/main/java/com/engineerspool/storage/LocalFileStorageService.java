package com.engineerspool.storage;

import com.engineerspool.entity.FileType;
import com.engineerspool.exception.BadRequestException;
import com.engineerspool.exception.NotFoundException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.storage", name = "provider", havingValue = "local", matchIfMissing = true)
public class LocalFileStorageService implements FileStorageService {

    private final StorageProperties properties;
    private Path rootPath;

    @PostConstruct
    void init() throws IOException {
        rootPath = Paths.get(properties.getLocalRoot()).toAbsolutePath().normalize();
        Files.createDirectories(rootPath);
    }

    @Override
    public StorageResult store(MultipartFile file) {
        validate(file);
        String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "note" : file.getOriginalFilename());
        if (originalName.contains("..") || originalName.contains("/") || originalName.contains("\\")) {
            throw new BadRequestException("Invalid file name.");
        }
        FileType fileType = resolveFileType(originalName);
        String storageKey = UUID.randomUUID() + "." + fileType.name().toLowerCase(Locale.ROOT);
        Path destination = rootPath.resolve(storageKey).normalize();
        if (!destination.startsWith(rootPath)) {
            throw new BadRequestException("Invalid storage path.");
        }
        try {
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new BadRequestException("Could not store file.");
        }
        return new StorageResult(storageKey, "local://" + storageKey, originalName, fileType, file.getSize());
    }

    @Override
    public Resource loadAsResource(String storageKey) {
        Path filePath = rootPath.resolve(storageKey).normalize();
        if (!filePath.startsWith(rootPath)) {
            throw new BadRequestException("Invalid storage path.");
        }
        try {
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }
            throw new NotFoundException("Stored file was not found.");
        } catch (MalformedURLException ex) {
            throw new BadRequestException("Invalid stored file URL.");
        }
    }

    @Override
    public void delete(String storageKey) {
        if (storageKey == null || storageKey.isBlank()) {
            return;
        }
        Path filePath = rootPath.resolve(storageKey).normalize();
        if (!filePath.startsWith(rootPath)) {
            return;
        }
        try {
            Files.deleteIfExists(filePath);
        } catch (IOException ignored) {
            // A missing old file should not block metadata deletion.
        }
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is required.");
        }
        if (file.getSize() > properties.getMaxFileSizeBytes()) {
            throw new BadRequestException("File exceeds the configured maximum size.");
        }
        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            throw new BadRequestException("File name is required.");
        }
        FileType type = resolveFileType(originalName);
        if (!properties.getAllowedTypes().contains(type.name())) {
            throw new BadRequestException("File type is not allowed.");
        }
    }

    private FileType resolveFileType(String filename) {
        String extension = StringUtils.getFilenameExtension(filename);
        if (extension == null || extension.isBlank()) {
            throw new BadRequestException("File extension is required.");
        }
        try {
            return FileType.valueOf(extension.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Allowed file types are PDF, DOC, DOCX, PPT, PPTX and ZIP.");
        }
    }
}
