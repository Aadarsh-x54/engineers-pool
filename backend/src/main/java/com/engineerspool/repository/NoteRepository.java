package com.engineerspool.repository;

import com.engineerspool.entity.Note;
import com.engineerspool.entity.NoteType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface NoteRepository extends JpaRepository<Note, UUID> {

    List<Note> findTop8ByPublishedTrueOrderByCreatedAtDesc();

    List<Note> findTop8ByPublishedTrueOrderByDownloadCountDesc();

    long countByNoteType(NoteType noteType);

    long countByNoteTypeAndPublishedTrue(NoteType noteType);

    @Query("""
            select coalesce(sum(n.downloadCount), 0)
            from Note n
            """)
    long sumDownloadCount();

    @Query("""
            select n from Note n
            where n.published = true
              and n.noteType = :noteType
              and (:semesterId is null or n.semester.id = :semesterId)
              and (:branchId is null or n.branch.id = :branchId)
              and (:subjectId is null or n.subject.id = :subjectId)
            order by n.subject.name asc, n.createdAt desc
            """)
    List<Note> findPublishedRgpv(
            @Param("noteType") NoteType noteType,
            @Param("semesterId") Long semesterId,
            @Param("branchId") Long branchId,
            @Param("subjectId") Long subjectId
    );

    @Query("""
            select n from Note n
            where n.published = true
              and n.noteType = :noteType
            order by n.createdAt desc
            """)
    List<Note> findPublishedByType(@Param("noteType") NoteType noteType);

    @Query("""
            select n from Note n
            where n.published = true
              and n.noteType = com.engineerspool.entity.NoteType.PROGRAMMING
              and n.programmingCategory.slug = :categorySlug
            order by n.createdAt desc
            """)
    List<Note> findProgrammingByCategorySlug(@Param("categorySlug") String categorySlug);

    @Query("""
            select n from Note n
            left join n.subject s
            left join n.branch b
            left join n.programmingCategory pc
            where n.published = true
              and (
                lower(n.title) like lower(concat('%', :query, '%'))
                or lower(coalesce(n.description, '')) like lower(concat('%', :query, '%'))
                or lower(coalesce(n.fileName, '')) like lower(concat('%', :query, '%'))
                or lower(coalesce(s.name, '')) like lower(concat('%', :query, '%'))
                or lower(coalesce(b.name, '')) like lower(concat('%', :query, '%'))
                or lower(coalesce(pc.name, '')) like lower(concat('%', :query, '%'))
              )
            order by n.downloadCount desc, n.createdAt desc
            """)
    List<Note> searchPublished(@Param("query") String query, Pageable pageable);

    @Query("""
            select n from Note n
            where (:query is null or :query = ''
                or lower(n.title) like lower(concat('%', :query, '%'))
                or lower(coalesce(n.description, '')) like lower(concat('%', :query, '%')))
              and (:noteType is null or n.noteType = :noteType)
              and (:semesterId is null or n.semester.id = :semesterId)
              and (:branchId is null or n.branch.id = :branchId)
              and (:subjectId is null or n.subject.id = :subjectId)
              and (:categoryId is null or n.programmingCategory.id = :categoryId)
            order by n.createdAt desc
            """)
    Page<Note> searchAdmin(
            @Param("query") String query,
            @Param("noteType") NoteType noteType,
            @Param("semesterId") Long semesterId,
            @Param("branchId") Long branchId,
            @Param("subjectId") Long subjectId,
            @Param("categoryId") Long categoryId,
            Pageable pageable
    );

    @Modifying
    @Query("update Note n set n.downloadCount = n.downloadCount + 1 where n.id = :id")
    void incrementDownloadCount(@Param("id") UUID id);
}
