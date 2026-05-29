package com.engineerspool.service;

import com.engineerspool.dto.CatalogOptionResponse;
import com.engineerspool.dto.DownloadResource;
import com.engineerspool.dto.NoteResponse;
import com.engineerspool.dto.ProgrammingGroupResponse;
import com.engineerspool.entity.DownloadLog;
import com.engineerspool.entity.Note;
import com.engineerspool.entity.NoteType;
import com.engineerspool.exception.NotFoundException;
import com.engineerspool.mapper.NoteMapper;
import com.engineerspool.repository.BranchRepository;
import com.engineerspool.repository.DownloadLogRepository;
import com.engineerspool.repository.NoteRepository;
import com.engineerspool.repository.ProgrammingCategoryRepository;
import com.engineerspool.repository.SemesterRepository;
import com.engineerspool.storage.FileStorageService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PublicNoteService {

    private final NoteRepository noteRepository;
    private final SemesterRepository semesterRepository;
    private final BranchRepository branchRepository;
    private final ProgrammingCategoryRepository programmingCategoryRepository;
    private final DownloadLogRepository downloadLogRepository;
    private final FileStorageService fileStorageService;
    private final DownloadRateLimiter downloadRateLimiter;
    private final NoteMapper noteMapper;

    @Transactional(readOnly = true)
    public List<CatalogOptionResponse> listRgpvSemesters() {
        return semesterRepository.findByActiveTrueOrderByNumberAsc().stream()
                .map(noteMapper::semester)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CatalogOptionResponse> listBranchesForSemester(Long semesterId) {
        if (!semesterRepository.existsById(semesterId)) {
            throw new NotFoundException("Semester not found.");
        }
        return branchRepository.findByActiveTrueOrderByNameAsc().stream()
                .map(noteMapper::branch)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NoteResponse> listRgpv(Long semesterId, Long branchId, Long subjectId) {
        return noteRepository.findPublishedRgpv(NoteType.RGPV, semesterId, branchId, subjectId)
                .stream()
                .map(noteMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProgrammingGroupResponse> listProgrammingGrouped() {
        return programmingCategoryRepository.findByActiveTrueOrderByDisplayOrderAscNameAsc().stream()
                .map(category -> new ProgrammingGroupResponse(
                        noteMapper.programmingCategory(category),
                        noteRepository.findProgrammingByCategorySlug(category.getSlug()).stream()
                                .map(noteMapper::toResponse)
                                .toList()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NoteResponse> listProgrammingByCategory(String categorySlug) {
        return noteRepository.findProgrammingByCategorySlug(categorySlug).stream()
                .map(noteMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NoteResponse> listCommonDocuments() {
        return noteRepository.findPublishedByType(NoteType.COMMON).stream()
                .map(noteMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NoteResponse> search(String query) {
        if (query == null || query.isBlank()) {
            return List.of();
        }
        return noteRepository.searchPublished(query.trim(), PageRequest.of(0, 30)).stream()
                .map(noteMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public NoteResponse getPublishedNote(UUID id) {
        Note note = noteRepository.findById(id)
                .filter(Note::isPublished)
                .orElseThrow(() -> new NotFoundException("Note not found."));
        return noteMapper.toResponse(note);
    }

    @Transactional(readOnly = true)
    public List<NoteResponse> recentlyAdded() {
        return noteRepository.findTop8ByPublishedTrueOrderByCreatedAtDesc().stream()
                .map(noteMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NoteResponse> popularDownloads() {
        return noteRepository.findTop8ByPublishedTrueOrderByDownloadCountDesc().stream()
                .map(noteMapper::toResponse)
                .toList();
    }

    @Transactional
    public DownloadResource download(UUID id, HttpServletRequest request) {
        Note note = noteRepository.findById(id)
                .filter(Note::isPublished)
                .orElseThrow(() -> new NotFoundException("Note not found."));
        String ipAddress = clientIp(request);
        downloadRateLimiter.check(ipAddress);
        noteRepository.incrementDownloadCount(note.getId());
        downloadLogRepository.save(DownloadLog.builder()
                .note(note)
                .ipAddress(ipAddress)
                .userAgent(request.getHeader("User-Agent"))
                .downloadedAt(Instant.now())
                .build());
        Resource resource = fileStorageService.loadAsResource(note.getStorageKey());
        return new DownloadResource(resource, note.getFileName(), contentType(note), note.getFileSize());
    }

    @Transactional(readOnly = true)
    public DownloadResource preview(UUID id) {
        Note note = noteRepository.findById(id)
                .filter(Note::isPublished)
                .orElseThrow(() -> new NotFoundException("Note not found."));
        if (note.getFileType() != com.engineerspool.entity.FileType.PDF) {
            throw new NotFoundException("Preview is available only for PDF files.");
        }
        Resource resource = fileStorageService.loadAsResource(note.getStorageKey());
        return new DownloadResource(resource, note.getFileName(), contentType(note), note.getFileSize());
    }

    private String clientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String contentType(Note note) {
        return switch (note.getFileType()) {
            case PDF -> "application/pdf";
            case DOC -> "application/msword";
            case DOCX -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case PPT -> "application/vnd.ms-powerpoint";
            case PPTX -> "application/vnd.openxmlformats-officedocument.presentationml.presentation";
            case ZIP -> "application/zip";
        };
    }
}
