package com.engineerspool.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class NoteUpdateRequest {

    private String title;

    private String description;

    private Long semesterId;

    private Long branchId;

    private Long subjectId;

    private String subjectName;

    private Long programmingCategoryId;

    private String tags;

    private Boolean published;

    private MultipartFile file;
}
