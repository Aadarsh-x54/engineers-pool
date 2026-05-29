package com.engineerspool.repository;

import com.engineerspool.entity.ProgrammingCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProgrammingCategoryRepository extends JpaRepository<ProgrammingCategory, Long> {
    List<ProgrammingCategory> findByActiveTrueOrderByDisplayOrderAscNameAsc();

    Optional<ProgrammingCategory> findBySlug(String slug);
}
