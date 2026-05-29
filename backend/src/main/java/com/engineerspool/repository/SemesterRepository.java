package com.engineerspool.repository;

import com.engineerspool.entity.Semester;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SemesterRepository extends JpaRepository<Semester, Long> {
    List<Semester> findByActiveTrueOrderByNumberAsc();

    Optional<Semester> findBySlug(String slug);
}
