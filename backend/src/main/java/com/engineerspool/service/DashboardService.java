package com.engineerspool.service;

import com.engineerspool.dto.DashboardStatsResponse;
import com.engineerspool.mapper.NoteMapper;
import com.engineerspool.entity.NoteType;
import com.engineerspool.repository.NoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final NoteRepository noteRepository;
    private final NoteMapper noteMapper;

    @Transactional(readOnly = true)
    public DashboardStatsResponse stats() {
        return new DashboardStatsResponse(
                noteRepository.count(),
                noteRepository.sumDownloadCount(),
                noteRepository.countByNoteType(NoteType.RGPV),
                noteRepository.countByNoteType(NoteType.PROGRAMMING),
                noteRepository.countByNoteType(NoteType.COMMON),
                noteRepository.findTop8ByPublishedTrueOrderByCreatedAtDesc().stream().map(noteMapper::toResponse).toList(),
                noteRepository.findTop8ByPublishedTrueOrderByDownloadCountDesc().stream().map(noteMapper::toResponse).toList()
        );
    }
}
