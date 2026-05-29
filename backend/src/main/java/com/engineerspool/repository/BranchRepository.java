package com.engineerspool.repository;

import com.engineerspool.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BranchRepository extends JpaRepository<Branch, Long> {
    List<Branch> findByActiveTrueOrderByNameAsc();

    Optional<Branch> findBySlug(String slug);
}
