package com.engineerspool.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CatalogUpsertRequest {

    @NotBlank
    private String name;

    private String slug;

    private String code;

    private String fullName;

    private String description;

    private Integer number;

    private Integer displayOrder;

    private Boolean active = true;

    private Long universityId;

    private Long semesterId;

    private Long branchId;
}
