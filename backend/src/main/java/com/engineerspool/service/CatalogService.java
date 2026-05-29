package com.engineerspool.service;

import com.engineerspool.dto.CatalogOptionResponse;
import com.engineerspool.dto.CatalogUpsertRequest;
import com.engineerspool.entity.Branch;
import com.engineerspool.entity.ProgrammingCategory;
import com.engineerspool.entity.Semester;
import com.engineerspool.entity.Subject;
import com.engineerspool.entity.University;
import com.engineerspool.exception.NotFoundException;
import com.engineerspool.mapper.NoteMapper;
import com.engineerspool.repository.BranchRepository;
import com.engineerspool.repository.ProgrammingCategoryRepository;
import com.engineerspool.repository.SemesterRepository;
import com.engineerspool.repository.SubjectRepository;
import com.engineerspool.repository.UniversityRepository;
import com.engineerspool.util.SlugUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CatalogService {

    private final UniversityRepository universityRepository;
    private final SemesterRepository semesterRepository;
    private final BranchRepository branchRepository;
    private final SubjectRepository subjectRepository;
    private final ProgrammingCategoryRepository programmingCategoryRepository;
    private final NoteMapper noteMapper;

    @Transactional(readOnly = true)
    public List<CatalogOptionResponse> semesters() {
        return semesterRepository.findAll().stream().map(noteMapper::semester).toList();
    }

    @Transactional
    public CatalogOptionResponse createSemester(CatalogUpsertRequest request) {
        Semester semester = Semester.builder()
                .name(request.getName().trim())
                .number(request.getNumber())
                .slug(slug(request))
                .active(active(request))
                .university(resolveUniversity(request.getUniversityId()))
                .build();
        return noteMapper.semester(semesterRepository.save(semester));
    }

    @Transactional
    public CatalogOptionResponse updateSemester(Long id, CatalogUpsertRequest request) {
        Semester semester = semesterRepository.findById(id).orElseThrow(() -> new NotFoundException("Semester not found."));
        semester.setName(request.getName().trim());
        semester.setSlug(slug(request));
        semester.setNumber(request.getNumber());
        semester.setActive(active(request));
        if (request.getUniversityId() != null) {
            semester.setUniversity(resolveUniversity(request.getUniversityId()));
        }
        return noteMapper.semester(semesterRepository.save(semester));
    }

    @Transactional(readOnly = true)
    public List<CatalogOptionResponse> branches() {
        return branchRepository.findAll().stream().map(noteMapper::branch).toList();
    }

    @Transactional
    public CatalogOptionResponse createBranch(CatalogUpsertRequest request) {
        Branch branch = Branch.builder()
                .name(request.getName().trim())
                .slug(slug(request))
                .code(request.getCode())
                .fullName(request.getFullName())
                .active(active(request))
                .university(resolveUniversity(request.getUniversityId()))
                .build();
        return noteMapper.branch(branchRepository.save(branch));
    }

    @Transactional
    public CatalogOptionResponse updateBranch(Long id, CatalogUpsertRequest request) {
        Branch branch = branchRepository.findById(id).orElseThrow(() -> new NotFoundException("Branch not found."));
        branch.setName(request.getName().trim());
        branch.setSlug(slug(request));
        branch.setCode(request.getCode());
        branch.setFullName(request.getFullName());
        branch.setActive(active(request));
        if (request.getUniversityId() != null) {
            branch.setUniversity(resolveUniversity(request.getUniversityId()));
        }
        return noteMapper.branch(branchRepository.save(branch));
    }

    @Transactional(readOnly = true)
    public List<CatalogOptionResponse> subjects(Long semesterId, Long branchId) {
        if (semesterId != null && branchId != null) {
            return subjectRepository.findBySemesterIdAndBranchIdAndActiveTrueOrderByNameAsc(semesterId, branchId)
                    .stream()
                    .map(noteMapper::subject)
                    .toList();
        }
        return subjectRepository.findAll().stream().map(noteMapper::subject).toList();
    }

    @Transactional
    public CatalogOptionResponse createSubject(CatalogUpsertRequest request) {
        Subject subject = Subject.builder()
                .name(request.getName().trim())
                .slug(slug(request))
                .code(request.getCode())
                .active(active(request))
                .semester(resolveSemester(request.getSemesterId()))
                .branch(resolveBranch(request.getBranchId()))
                .build();
        return noteMapper.subject(subjectRepository.save(subject));
    }

    @Transactional
    public CatalogOptionResponse updateSubject(Long id, CatalogUpsertRequest request) {
        Subject subject = subjectRepository.findById(id).orElseThrow(() -> new NotFoundException("Subject not found."));
        subject.setName(request.getName().trim());
        subject.setSlug(slug(request));
        subject.setCode(request.getCode());
        subject.setActive(active(request));
        if (request.getSemesterId() != null) {
            subject.setSemester(resolveSemester(request.getSemesterId()));
        }
        if (request.getBranchId() != null) {
            subject.setBranch(resolveBranch(request.getBranchId()));
        }
        return noteMapper.subject(subjectRepository.save(subject));
    }

    @Transactional(readOnly = true)
    public List<CatalogOptionResponse> programmingCategories() {
        return programmingCategoryRepository.findAll().stream()
                .sorted((left, right) -> left.getDisplayOrder().compareTo(right.getDisplayOrder()))
                .map(noteMapper::programmingCategory)
                .toList();
    }

    @Transactional
    public CatalogOptionResponse createProgrammingCategory(CatalogUpsertRequest request) {
        ProgrammingCategory category = ProgrammingCategory.builder()
                .name(request.getName().trim())
                .slug(slug(request))
                .description(request.getDescription())
                .displayOrder(request.getDisplayOrder() == null ? 100 : request.getDisplayOrder())
                .active(active(request))
                .build();
        return noteMapper.programmingCategory(programmingCategoryRepository.save(category));
    }

    @Transactional
    public CatalogOptionResponse updateProgrammingCategory(Long id, CatalogUpsertRequest request) {
        ProgrammingCategory category = programmingCategoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Programming category not found."));
        category.setName(request.getName().trim());
        category.setSlug(slug(request));
        category.setDescription(request.getDescription());
        category.setDisplayOrder(request.getDisplayOrder() == null ? category.getDisplayOrder() : request.getDisplayOrder());
        category.setActive(active(request));
        return noteMapper.programmingCategory(programmingCategoryRepository.save(category));
    }

    @Transactional
    public void deleteSemester(Long id) {
        semesterRepository.deleteById(id);
    }

    @Transactional
    public void deleteBranch(Long id) {
        branchRepository.deleteById(id);
    }

    @Transactional
    public void deleteSubject(Long id) {
        subjectRepository.deleteById(id);
    }

    @Transactional
    public void deleteProgrammingCategory(Long id) {
        programmingCategoryRepository.deleteById(id);
    }

    private University resolveUniversity(Long id) {
        if (id == null) {
            return universityRepository.findBySlug("rgpv")
                    .orElseThrow(() -> new NotFoundException("Default university not found."));
        }
        return universityRepository.findById(id).orElseThrow(() -> new NotFoundException("University not found."));
    }

    private Semester resolveSemester(Long id) {
        return semesterRepository.findById(id).orElseThrow(() -> new NotFoundException("Semester not found."));
    }

    private Branch resolveBranch(Long id) {
        return branchRepository.findById(id).orElseThrow(() -> new NotFoundException("Branch not found."));
    }

    private boolean active(CatalogUpsertRequest request) {
        return request.getActive() == null || request.getActive();
    }

    private String slug(CatalogUpsertRequest request) {
        return request.getSlug() == null || request.getSlug().isBlank()
                ? SlugUtil.toSlug(request.getName())
                : SlugUtil.toSlug(request.getSlug());
    }
}
