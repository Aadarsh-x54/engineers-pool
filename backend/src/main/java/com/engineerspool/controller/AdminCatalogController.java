package com.engineerspool.controller;

import com.engineerspool.dto.CatalogOptionResponse;
import com.engineerspool.dto.CatalogUpsertRequest;
import com.engineerspool.service.CatalogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class AdminCatalogController {

    private final CatalogService catalogService;

    @GetMapping("/semesters")
    public List<CatalogOptionResponse> semesters() {
        return catalogService.semesters();
    }

    @PostMapping("/semesters")
    public CatalogOptionResponse createSemester(@Valid @RequestBody CatalogUpsertRequest request) {
        return catalogService.createSemester(request);
    }

    @PutMapping("/semesters/{id}")
    public CatalogOptionResponse updateSemester(@PathVariable Long id, @Valid @RequestBody CatalogUpsertRequest request) {
        return catalogService.updateSemester(id, request);
    }

    @DeleteMapping("/semesters/{id}")
    public void deleteSemester(@PathVariable Long id) {
        catalogService.deleteSemester(id);
    }

    @GetMapping("/branches")
    public List<CatalogOptionResponse> branches() {
        return catalogService.branches();
    }

    @PostMapping("/branches")
    public CatalogOptionResponse createBranch(@Valid @RequestBody CatalogUpsertRequest request) {
        return catalogService.createBranch(request);
    }

    @PutMapping("/branches/{id}")
    public CatalogOptionResponse updateBranch(@PathVariable Long id, @Valid @RequestBody CatalogUpsertRequest request) {
        return catalogService.updateBranch(id, request);
    }

    @DeleteMapping("/branches/{id}")
    public void deleteBranch(@PathVariable Long id) {
        catalogService.deleteBranch(id);
    }

    @GetMapping("/subjects")
    public List<CatalogOptionResponse> subjects(
            @RequestParam(required = false) Long semester,
            @RequestParam(required = false) Long branch
    ) {
        return catalogService.subjects(semester, branch);
    }

    @PostMapping("/subjects")
    public CatalogOptionResponse createSubject(@Valid @RequestBody CatalogUpsertRequest request) {
        return catalogService.createSubject(request);
    }

    @PutMapping("/subjects/{id}")
    public CatalogOptionResponse updateSubject(@PathVariable Long id, @Valid @RequestBody CatalogUpsertRequest request) {
        return catalogService.updateSubject(id, request);
    }

    @DeleteMapping("/subjects/{id}")
    public void deleteSubject(@PathVariable Long id) {
        catalogService.deleteSubject(id);
    }

    @GetMapping("/programming-categories")
    public List<CatalogOptionResponse> programmingCategories() {
        return catalogService.programmingCategories();
    }

    @PostMapping("/programming-categories")
    public CatalogOptionResponse createProgrammingCategory(@Valid @RequestBody CatalogUpsertRequest request) {
        return catalogService.createProgrammingCategory(request);
    }

    @PutMapping("/programming-categories/{id}")
    public CatalogOptionResponse updateProgrammingCategory(@PathVariable Long id, @Valid @RequestBody CatalogUpsertRequest request) {
        return catalogService.updateProgrammingCategory(id, request);
    }

    @DeleteMapping("/programming-categories/{id}")
    public void deleteProgrammingCategory(@PathVariable Long id) {
        catalogService.deleteProgrammingCategory(id);
    }
}
