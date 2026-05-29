package com.engineerspool.controller;

import com.engineerspool.dto.NoteResponse;
import com.engineerspool.dto.NoteUpdateRequest;
import com.engineerspool.dto.NoteUploadRequest;
import com.engineerspool.dto.PublishRequest;
import com.engineerspool.entity.NoteType;
import com.engineerspool.service.AdminNoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/notes")
public class AdminNotesController {

    private final AdminNoteService adminNoteService;

    @GetMapping
    public Page<NoteResponse> notes(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) NoteType noteType,
            @RequestParam(required = false) Long semester,
            @RequestParam(required = false) Long branch,
            @RequestParam(required = false) Long subject,
            @RequestParam(required = false) Long category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return adminNoteService.searchAdmin(q, noteType, semester, branch, subject, category, PageRequest.of(page, size));
    }

    @PostMapping(value = "/rgpv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public NoteResponse uploadRgpv(@Valid @ModelAttribute NoteUploadRequest request) {
        return adminNoteService.createRgpv(request);
    }

    @PostMapping(value = "/programming", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public NoteResponse uploadProgramming(@Valid @ModelAttribute NoteUploadRequest request) {
        return adminNoteService.createProgramming(request);
    }

    @PostMapping(value = "/common", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public NoteResponse uploadCommon(@Valid @ModelAttribute NoteUploadRequest request) {
        return adminNoteService.createCommon(request);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public NoteResponse update(@PathVariable UUID id, @ModelAttribute NoteUpdateRequest request) {
        return adminNoteService.update(id, request);
    }

    @PatchMapping("/{id}/publish")
    public NoteResponse publish(@PathVariable UUID id, @RequestBody PublishRequest request) {
        return adminNoteService.publish(id, request.published());
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        adminNoteService.delete(id);
    }
}
