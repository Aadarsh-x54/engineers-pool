package com.engineerspool.storage;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "app.storage")
public class StorageProperties {
    private String provider = "local";
    private String localRoot = "uploads";
    private List<String> allowedTypes = List.of("PDF", "DOC", "DOCX", "PPT", "PPTX", "ZIP");
    private long maxFileSizeBytes = 52_428_800L;
}
