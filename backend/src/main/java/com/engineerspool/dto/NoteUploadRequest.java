package com.engineerspool.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class NoteUploadRequest {

    @NotBlank
    private String title;

    private String description;

    private Long semesterId;

    private Long branchId;

    private Long subjectId;

    private String subjectName;

    private Long programmingCategoryId;

    private String tags;

    private boolean published = true;

    @NotNull
    private MultipartFile file;
}
