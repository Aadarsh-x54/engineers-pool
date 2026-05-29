package com.engineerspool.repository;

import com.engineerspool.entity.University;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UniversityRepository extends JpaRepository<University, Long> {
    Optional<University> findBySlug(String slug);
}
