package com.engineerspool.controller;

import com.engineerspool.dto.CatalogOptionResponse;
import com.engineerspool.dto.DownloadResource;
import com.engineerspool.dto.NoteResponse;
import com.engineerspool.dto.ProgrammingGroupResponse;
import com.engineerspool.service.PublicNoteService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notes")
public class PublicNotesController {

    private final PublicNoteService publicNoteService;

    @GetMapping("/rgpv/semesters")
    public List<CatalogOptionResponse> rgpvSemesters() {
        return publicNoteService.listRgpvSemesters();
    }

    @GetMapping("/rgpv/semesters/{semesterId}/branches")
    public List<CatalogOptionResponse> branches(@PathVariable Long semesterId) {
        return publicNoteService.listBranchesForSemester(semesterId);
    }

    @GetMapping("/rgpv")
    public List<NoteResponse> rgpvNotes(
            @RequestParam(required = false) Long semester,
            @RequestParam(required = false) Long branch,
            @RequestParam(required = false) Long subject
    ) {
        return publicNoteService.listRgpv(semester, branch, subject);
    }

    @GetMapping("/programming")
    public List<ProgrammingGroupResponse> programmingNotes() {
        return publicNoteService.listProgrammingGrouped();
    }

    @GetMapping("/programming/{category}")
    public List<NoteResponse> programmingByCategory(@PathVariable String category) {
        return publicNoteService.listProgrammingByCategory(category);
    }

    @GetMapping("/common")
    public List<NoteResponse> commonDocuments() {
        return publicNoteService.listCommonDocuments();
    }

    @GetMapping("/search")
    public List<NoteResponse> search(@RequestParam String q) {
        return publicNoteService.search(q);
    }

    @GetMapping("/recent")
    public List<NoteResponse> recent() {
        return publicNoteService.recentlyAdded();
    }

    @GetMapping("/popular")
    public List<NoteResponse> popular() {
        return publicNoteService.popularDownloads();
    }

    @GetMapping("/{id}")
    public NoteResponse getNote(@PathVariable UUID id) {
        return publicNoteService.getPublishedNote(id);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<?> download(@PathVariable UUID id, HttpServletRequest request) {
        DownloadResource download = publicNoteService.download(id, request);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(download.contentType()))
                .contentLength(download.fileSize())
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + download.fileName() + "\"")
                .body(download.resource());
    }

    @GetMapping("/{id}/preview")
    public ResponseEntity<?> preview(@PathVariable UUID id) {
        DownloadResource preview = publicNoteService.preview(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(preview.fileSize())
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + preview.fileName() + "\"")
                .body(preview.resource());
    }
}
