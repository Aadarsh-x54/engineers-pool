package com.engineerspool.service;

import com.engineerspool.dto.NoteResponse;
import com.engineerspool.dto.NoteUpdateRequest;
import com.engineerspool.dto.NoteUploadRequest;
import com.engineerspool.entity.Note;
import com.engineerspool.entity.NoteType;
import com.engineerspool.exception.BadRequestException;
import com.engineerspool.exception.NotFoundException;
import com.engineerspool.mapper.NoteMapper;
import com.engineerspool.repository.BranchRepository;
import com.engineerspool.repository.NoteRepository;
import com.engineerspool.repository.ProgrammingCategoryRepository;
import com.engineerspool.repository.SemesterRepository;
import com.engineerspool.repository.SubjectRepository;
import com.engineerspool.storage.FileStorageService;
import com.engineerspool.storage.StorageResult;
import com.engineerspool.util.TagParser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.util.StringUtils;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminNoteService {

    private final NoteRepository noteRepository;
    private final SemesterRepository semesterRepository;
    private final BranchRepository branchRepository;
    private final SubjectRepository subjectRepository;
    private final ProgrammingCategoryRepository programmingCategoryRepository;
    private final FileStorageService fileStorageService;
    private final NoteMapper noteMapper;

    @Transactional
    public NoteResponse createRgpv(NoteUploadRequest request) {
        requireRgpvCatalog(request);
        return create(request, NoteType.RGPV);
    }

    @Transactional
    public NoteResponse createProgramming(NoteUploadRequest request) {
        if (request.getProgrammingCategoryId() == null) {
            throw new BadRequestException("Programming category is required.");
        }
        return create(request, NoteType.PROGRAMMING);
    }

    @Transactional
    public NoteResponse createCommon(NoteUploadRequest request) {
        return create(request, NoteType.COMMON);
    }

    @Transactional(readOnly = true)
    public Page<NoteResponse> searchAdmin(
            String query,
            NoteType noteType,
            Long semesterId,
            Long branchId,
            Long subjectId,
            Long categoryId,
            Pageable pageable
    ) {
        return noteRepository.searchAdmin(query, noteType, semesterId, branchId, subjectId, categoryId, pageable)
                .map(noteMapper::toResponse);
    }

    @Transactional
    public NoteResponse update(UUID id, NoteUpdateRequest request) {
        Note note = noteRepository.findById(id).orElseThrow(() -> new NotFoundException("Note not found."));
        if (StringUtils.hasText(request.getTitle())) {
            note.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            note.setDescription(request.getDescription().trim());
        }
        if (request.getSemesterId() != null && request.getBranchId() != null && StringUtils.hasText(request.getSubjectName())) {
            com.engineerspool.entity.Semester semester = semesterRepository.findById(request.getSemesterId())
                    .orElseThrow(() -> new NotFoundException("Semester not found."));
            com.engineerspool.entity.Branch branch = branchRepository.findById(request.getBranchId())
                    .orElseThrow(() -> new NotFoundException("Branch not found."));
            String subName = request.getSubjectName().trim();
            String slug = com.engineerspool.util.SlugUtil.toSlug(subName);
            com.engineerspool.entity.Subject subject = subjectRepository.findBySlugAndSemesterIdAndBranchId(slug, semester.getId(), branch.getId())
                    .orElseGet(() -> subjectRepository.save(com.engineerspool.entity.Subject.builder()
                            .name(subName)
                            .slug(slug)
                            .active(true)
                            .semester(semester)
                            .branch(branch)
                            .build()));
            note.setSubject(subject);
            note.setSemester(semester);
            note.setBranch(branch);
        } else {
            if (request.getSemesterId() != null) {
                note.setSemester(semesterRepository.findById(request.getSemesterId())
                        .orElseThrow(() -> new NotFoundException("Semester not found.")));
            }
            if (request.getBranchId() != null) {
                note.setBranch(branchRepository.findById(request.getBranchId())
                        .orElseThrow(() -> new NotFoundException("Branch not found.")));
            }
            if (request.getSubjectId() != null) {
                note.setSubject(subjectRepository.findById(request.getSubjectId())
                        .orElseThrow(() -> new NotFoundException("Subject not found.")));
            }
        }
        if (request.getProgrammingCategoryId() != null) {
            note.setProgrammingCategory(programmingCategoryRepository.findById(request.getProgrammingCategoryId())
                    .orElseThrow(() -> new NotFoundException("Programming category not found.")));
        }
        if (request.getTags() != null) {
            note.setTags(TagParser.parse(request.getTags()));
        }
        if (request.getPublished() != null) {
            note.setPublished(request.getPublished());
        }
        if (request.getFile() != null && !request.getFile().isEmpty()) {
            StorageResult storage = fileStorageService.store(request.getFile());
            scheduleFileCleanup(storage.storageKey(), note.getStorageKey());
            applyStorage(note, storage);
        }
        return noteMapper.toResponse(noteRepository.save(note));
    }

    @Transactional
    public NoteResponse publish(UUID id, boolean published) {
        Note note = noteRepository.findById(id).orElseThrow(() -> new NotFoundException("Note not found."));
        note.setPublished(published);
        return noteMapper.toResponse(noteRepository.save(note));
    }

    @Transactional
    public void delete(UUID id) {
        Note note = noteRepository.findById(id).orElseThrow(() -> new NotFoundException("Note not found."));
        noteRepository.delete(note);
        scheduleFileCleanup(null, note.getStorageKey());
    }

    private NoteResponse create(NoteUploadRequest request, NoteType noteType) {
        StorageResult storage = fileStorageService.store(request.getFile());
        scheduleFileCleanup(storage.storageKey(), null);
        Note note = Note.builder()
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .noteType(noteType)
                .downloadCount(0L)
                .published(request.isPublished())
                .tags(TagParser.parse(request.getTags()))
                .build();
        applyStorage(note, storage);

        if (request.getSemesterId() != null && request.getBranchId() != null && StringUtils.hasText(request.getSubjectName())) {
            com.engineerspool.entity.Semester semester = semesterRepository.findById(request.getSemesterId())
                    .orElseThrow(() -> new NotFoundException("Semester not found."));
            com.engineerspool.entity.Branch branch = branchRepository.findById(request.getBranchId())
                    .orElseThrow(() -> new NotFoundException("Branch not found."));
            String subName = request.getSubjectName().trim();
            String slug = com.engineerspool.util.SlugUtil.toSlug(subName);
            com.engineerspool.entity.Subject subject = subjectRepository.findBySlugAndSemesterIdAndBranchId(slug, semester.getId(), branch.getId())
                    .orElseGet(() -> subjectRepository.save(com.engineerspool.entity.Subject.builder()
                            .name(subName)
                            .slug(slug)
                            .active(true)
                            .semester(semester)
                            .branch(branch)
                            .build()));
            note.setSubject(subject);
            note.setSemester(semester);
            note.setBranch(branch);
        } else {
            if (request.getSemesterId() != null) {
                note.setSemester(semesterRepository.findById(request.getSemesterId())
                        .orElseThrow(() -> new NotFoundException("Semester not found.")));
            }
            if (request.getBranchId() != null) {
                note.setBranch(branchRepository.findById(request.getBranchId())
                        .orElseThrow(() -> new NotFoundException("Branch not found.")));
            }
            if (request.getSubjectId() != null) {
                note.setSubject(subjectRepository.findById(request.getSubjectId())
                        .orElseThrow(() -> new NotFoundException("Subject not found.")));
            }
        }

        if (request.getProgrammingCategoryId() != null) {
            note.setProgrammingCategory(programmingCategoryRepository.findById(request.getProgrammingCategoryId())
                    .orElseThrow(() -> new NotFoundException("Programming category not found.")));
        }
        return noteMapper.toResponse(noteRepository.save(note));
    }

    private void requireRgpvCatalog(NoteUploadRequest request) {
        if (request.getSemesterId() == null || request.getBranchId() == null || (request.getSubjectId() == null && !StringUtils.hasText(request.getSubjectName()))) {
            throw new BadRequestException("Semester, branch and subject are required for RGPV notes.");
        }
    }

    private void applyStorage(Note note, StorageResult storage) {
        note.setStorageKey(storage.storageKey());
        note.setFileUrl(storage.fileUrl());
        note.setFileName(storage.fileName());
        note.setFileType(storage.fileType());
        note.setFileSize(storage.fileSize());
    }

    private void scheduleFileCleanup(String rollbackStorageKey, String committedStorageKey) {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int status) {
                if (status == STATUS_COMMITTED) {
                    if (committedStorageKey != null) {
                        fileStorageService.delete(committedStorageKey);
                    }
                } else if (rollbackStorageKey != null) {
                    fileStorageService.delete(rollbackStorageKey);
                }
            }
        });
    }
}
