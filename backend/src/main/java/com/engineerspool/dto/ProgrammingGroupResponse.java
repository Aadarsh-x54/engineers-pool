package com.engineerspool.dto;

import java.util.List;

public record ProgrammingGroupResponse(
        CatalogOptionResponse category,
        List<NoteResponse> notes
) {
}
