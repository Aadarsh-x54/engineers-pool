package com.engineerspool.dto;

import java.util.List;

public record DashboardStatsResponse(
        long totalNotes,
        long totalDownloads,
        long totalRgpvMaterials,
        long totalProgrammingNotes,
        long totalCommonDocuments,
        List<NoteResponse> recentlyUploadedFiles,
        List<NoteResponse> popularDownloads
) {
}
