package com.engineerspool.service;

import com.engineerspool.dto.NoteUpdateRequest;
import com.engineerspool.dto.NoteUploadRequest;
import com.engineerspool.entity.FileType;
import com.engineerspool.entity.Note;
import com.engineerspool.repository.BranchRepository;
import com.engineerspool.repository.NoteRepository;
import com.engineerspool.repository.ProgrammingCategoryRepository;
import com.engineerspool.repository.SemesterRepository;
import com.engineerspool.repository.SubjectRepository;
import com.engineerspool.storage.FileStorageService;
import com.engineerspool.storage.StorageResult;
import com.engineerspool.mapper.NoteMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AdminNoteServiceTest {

    private final NoteRepository noteRepository = mock(NoteRepository.class);
    private final SemesterRepository semesterRepository = mock(SemesterRepository.class);
    private final BranchRepository branchRepository = mock(BranchRepository.class);
    private final SubjectRepository subjectRepository = mock(SubjectRepository.class);
    private final ProgrammingCategoryRepository categoryRepository = mock(ProgrammingCategoryRepository.class);
    private final FileStorageService fileStorageService = mock(FileStorageService.class);
    private final NoteMapper noteMapper = mock(NoteMapper.class);
    private final AdminNoteService service = new AdminNoteService(
            noteRepository,
            semesterRepository,
            branchRepository,
            subjectRepository,
            categoryRepository,
            fileStorageService,
            noteMapper
    );

    @AfterEach
    void clearTransactionSynchronization() {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.clearSynchronization();
        }
    }

    @Test
    void createCleansUpStoredFileWhenDatabaseTransactionRollsBack() {
        beginSynchronization();
        when(fileStorageService.store(any())).thenReturn(storage("new.pdf"));
        when(noteRepository.save(any(Note.class))).thenAnswer(invocation -> invocation.getArgument(0));

        NoteUploadRequest request = new NoteUploadRequest();
        request.setTitle("Test note");
        request.setFile(new MockMultipartFile("file", "test.pdf", "application/pdf", new byte[]{1}));
        service.createCommon(request);

        completeSynchronization(TransactionSynchronization.STATUS_ROLLED_BACK);

        verify(fileStorageService).delete("new.pdf");
    }

    @Test
    void replacementKeepsOldFileUntilCommitAndCleansNewFileOnRollback() {
        beginSynchronization();
        UUID id = UUID.randomUUID();
        Note note = Note.builder().storageKey("old.pdf").build();
        when(noteRepository.findById(id)).thenReturn(Optional.of(note));
        when(fileStorageService.store(any())).thenReturn(storage("new.pdf"));
        when(noteRepository.save(any(Note.class))).thenReturn(note);

        NoteUpdateRequest request = new NoteUpdateRequest();
        request.setFile(new MockMultipartFile("file", "replacement.pdf", "application/pdf", new byte[]{1}));
        service.update(id, request);

        verify(fileStorageService, never()).delete("old.pdf");
        completeSynchronization(TransactionSynchronization.STATUS_ROLLED_BACK);

        verify(fileStorageService).delete("new.pdf");
        verify(fileStorageService, never()).delete("old.pdf");
    }

    @Test
    void replacementDeletesOldFileOnlyAfterCommit() {
        beginSynchronization();
        UUID id = UUID.randomUUID();
        Note note = Note.builder().storageKey("old.pdf").build();
        when(noteRepository.findById(id)).thenReturn(Optional.of(note));
        when(fileStorageService.store(any())).thenReturn(storage("new.pdf"));
        when(noteRepository.save(any(Note.class))).thenReturn(note);

        NoteUpdateRequest request = new NoteUpdateRequest();
        request.setFile(new MockMultipartFile("file", "replacement.pdf", "application/pdf", new byte[]{1}));
        service.update(id, request);

        completeSynchronization(TransactionSynchronization.STATUS_COMMITTED);

        verify(fileStorageService).delete("old.pdf");
        verify(fileStorageService, never()).delete("new.pdf");
    }

    private static StorageResult storage(String key) {
        return new StorageResult(key, "local://" + key, key, FileType.PDF, 1);
    }

    private static void beginSynchronization() {
        TransactionSynchronizationManager.initSynchronization();
    }

    private static void completeSynchronization(int status) {
        List<TransactionSynchronization> synchronizations =
                TransactionSynchronizationManager.getSynchronizations();
        TransactionSynchronizationManager.clearSynchronization();
        synchronizations.forEach(synchronization -> synchronization.afterCompletion(status));
    }
}
