package com.engineerspool.mapper;

import com.engineerspool.dto.CatalogOptionResponse;
import com.engineerspool.dto.NoteResponse;
import com.engineerspool.entity.Branch;
import com.engineerspool.entity.Note;
import com.engineerspool.entity.ProgrammingCategory;
import com.engineerspool.entity.Semester;
import com.engineerspool.entity.Subject;
import com.engineerspool.util.FileSizeFormatter;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class NoteMapper {

    public NoteResponse toResponse(Note note) {
        String downloadUrl = "/api/notes/%s/download".formatted(note.getId());
        return new NoteResponse(
                note.getId(),
                note.getTitle(),
                note.getDescription(),
                downloadUrl,
                downloadUrl,
                note.getFileName(),
                note.getFileType(),
                note.getFileSize(),
                FileSizeFormatter.humanReadable(note.getFileSize()),
                note.getNoteType(),
                semester(note.getSemester()),
                branch(note.getBranch()),
                subject(note.getSubject()),
                programmingCategory(note.getProgrammingCategory()),
                note.getTags() == null ? List.of() : note.getTags(),
                note.getDownloadCount(),
                note.isPublished(),
                note.getCreatedAt(),
                note.getUpdatedAt()
        );
    }

    public CatalogOptionResponse semester(Semester semester) {
        if (semester == null) {
            return null;
        }
        return new CatalogOptionResponse(
                semester.getId(),
                semester.getName(),
                semester.getSlug(),
                String.valueOf(semester.getNumber()),
                semester.getName(),
                null
        );
    }

    public CatalogOptionResponse branch(Branch branch) {
        if (branch == null) {
            return null;
        }
        return new CatalogOptionResponse(
                branch.getId(),
                branch.getName(),
                branch.getSlug(),
                branch.getCode(),
                branch.getFullName(),
                null
        );
    }

    public CatalogOptionResponse subject(Subject subject) {
        if (subject == null) {
            return null;
        }
        return new CatalogOptionResponse(
                subject.getId(),
                subject.getName(),
                subject.getSlug(),
                subject.getCode(),
                subject.getName(),
                null
        );
    }

    public CatalogOptionResponse programmingCategory(ProgrammingCategory category) {
        if (category == null) {
            return null;
        }
        return new CatalogOptionResponse(
                category.getId(),
                category.getName(),
                category.getSlug(),
                null,
                category.getName(),
                category.getDescription()
        );
    }
}
