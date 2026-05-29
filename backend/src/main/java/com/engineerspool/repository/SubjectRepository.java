package com.engineerspool.repository;

import com.engineerspool.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findByActiveTrueOrderByNameAsc();

    List<Subject> findBySemesterIdAndBranchIdAndActiveTrueOrderByNameAsc(Long semesterId, Long branchId);

    Optional<Subject> findBySlugAndSemesterIdAndBranchId(String slug, Long semesterId, Long branchId);
}
