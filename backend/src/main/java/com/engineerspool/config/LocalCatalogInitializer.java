package com.engineerspool.config;

import com.engineerspool.entity.AppSetting;
import com.engineerspool.entity.Branch;
import com.engineerspool.entity.ProgrammingCategory;
import com.engineerspool.entity.Semester;
import com.engineerspool.entity.Subject;
import com.engineerspool.entity.University;
import com.engineerspool.repository.AppSettingRepository;
import com.engineerspool.repository.BranchRepository;
import com.engineerspool.repository.ProgrammingCategoryRepository;
import com.engineerspool.repository.SemesterRepository;
import com.engineerspool.repository.SubjectRepository;
import com.engineerspool.repository.UniversityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@Profile("local")
@RequiredArgsConstructor
public class LocalCatalogInitializer implements CommandLineRunner {

    private static final List<BranchSeed> BRANCHES = List.of(
            new BranchSeed("ALL Branch 1st Year", "all-branch-1st-year", "ALL", "All Branches First Year"),
            new BranchSeed("CSE", "cse", "CSE", "Computer Science and Engineering"),
            new BranchSeed("AIDS / AD", "aids-ad", "AD", "Artificial Intelligence and Data Science"),
            new BranchSeed("AIML / AL", "aiml-al", "AL", "Artificial Intelligence and Machine Learning"),
            new BranchSeed("AI", "ai", "AI", "Artificial Intelligence"),
            new BranchSeed("AUTO", "auto", "AUTO", "Automobile Engineering"),
            new BranchSeed("Auto & Robo", "auto-and-robo", "AR", "Automobile and Robotics Engineering"),
            new BranchSeed("CHEMICAL", "chemical", "CH", "Chemical Engineering"),
            new BranchSeed("CIVIL", "civil", "CE", "Civil Engineering"),
            new BranchSeed("CSBS / CB", "csbs-cb", "CB", "Computer Science and Business Systems"),
            new BranchSeed("CSE-DS / CD", "cse-ds-cd", "CD", "Computer Science and Engineering - Data Science"),
            new BranchSeed("CSE-IOT", "cse-iot", "CI", "Computer Science and Engineering - Internet of Things"),
            new BranchSeed("CSIT", "csit", "CSIT", "Computer Science and Information Technology"),
            new BranchSeed("3DAG", "3dag", "3DAG", "Three Dimensional Animation and Graphics"),
            new BranchSeed("IOT", "iot", "IOT", "Internet of Things"),
            new BranchSeed("IS / IOT-CS", "is-iot-cs", "IS", "Information Science / IoT Cyber Security"),
            new BranchSeed("CY", "cy", "CY", "Cyber Security"),
            new BranchSeed("EC", "ec", "EC", "Electronics and Communication Engineering"),
            new BranchSeed("EE", "ee", "EE", "Electrical Engineering"),
            new BranchSeed("EEE", "eee", "EEE", "Electrical and Electronics Engineering"),
            new BranchSeed("EI", "ei", "EI", "Electronics and Instrumentation Engineering"),
            new BranchSeed("EX", "ex", "EX", "Electrical and Electronics"),
            new BranchSeed("FT", "ft", "FT", "Fire Technology and Safety Engineering"),
            new BranchSeed("IT", "it", "IT", "Information Technology"),
            new BranchSeed("ME", "me", "ME", "Mechanical Engineering"),
            new BranchSeed("MINING / MI", "mining-mi", "MI", "Mining Engineering"),
            new BranchSeed("MM", "mm", "MM", "Mining Machinery Engineering"),
            new BranchSeed("RA", "ra", "RA", "Robotics and Automation"),
            new BranchSeed("Robo And Mech", "robo-and-mech", "RM", "Robotics and Mechanical Engineering"),
            new BranchSeed("SD / CSD", "sd-csd", "CSD", "Computer Science and Design"),
            new BranchSeed("OTHERS", "others", "OTH", "Other Branches"),
            new BranchSeed("TX", "tx", "TX", "Textile Technology")
    );

    private static final List<CategorySeed> CATEGORIES = List.of(
            new CategorySeed("Python", "python", "Python language notes and practice material.", 10),
            new CategorySeed("Java", "java", "Java language notes and object-oriented programming resources.", 20),
            new CategorySeed("C", "c", "C language fundamentals and lab material.", 30),
            new CategorySeed("C++", "cpp", "C++ and object-oriented programming material.", 40),
            new CategorySeed("DSA", "dsa", "Data structures and algorithms notes.", 50),
            new CategorySeed("Web Development", "web-development", "Frontend and full-stack web development notes.", 60),
            new CategorySeed("App Development", "app-development", "Mobile app development resources.", 70),
            new CategorySeed("Backend Development", "backend-development", "Server-side engineering and APIs.", 80),
            new CategorySeed("Database", "database", "SQL, DBMS and database design notes.", 90),
            new CategorySeed("Git & GitHub", "git-and-github", "Version control and collaboration resources.", 100),
            new CategorySeed("AI/ML", "ai-ml", "Artificial intelligence and machine learning notes.", 110),
            new CategorySeed("Data Science", "data-science", "Data science, analytics and statistics resources.", 120),
            new CategorySeed("Projects", "projects", "Project reports, ideas and implementation resources.", 130),
            new CategorySeed("Interview Preparation", "interview-preparation", "Placement and interview preparation notes.", 140)
    );

    private static final List<SubjectSeed> SUBJECTS = List.of(
            new SubjectSeed("Engineering Mathematics I", "engineering-mathematics-i", "BT101", "semester-1", "all-branch-1st-year"),
            new SubjectSeed("Engineering Physics", "engineering-physics", "BT102", "semester-1", "all-branch-1st-year"),
            new SubjectSeed("Basic Electrical Engineering", "basic-electrical-engineering", "BT103", "semester-1", "all-branch-1st-year"),
            new SubjectSeed("Engineering Mathematics II", "engineering-mathematics-ii", "BT201", "semester-2", "all-branch-1st-year"),
            new SubjectSeed("Basic Mechanical Engineering", "basic-mechanical-engineering", "BT203", "semester-2", "all-branch-1st-year"),
            new SubjectSeed("Data Structures", "data-structures", "CS301", "semester-3", "cse"),
            new SubjectSeed("Object Oriented Programming", "object-oriented-programming", "CS302", "semester-3", "cse"),
            new SubjectSeed("Database Management Systems", "database-management-systems", "CS401", "semester-4", "cse"),
            new SubjectSeed("Operating Systems", "operating-systems", "CS402", "semester-4", "cse"),
            new SubjectSeed("Software Engineering", "software-engineering", "CS501", "semester-5", "cse"),
            new SubjectSeed("Computer Networks", "computer-networks", "CS502", "semester-5", "cse"),
            new SubjectSeed("Machine Learning", "machine-learning", "CS601", "semester-6", "cse"),
            new SubjectSeed("Compiler Design", "compiler-design", "CS602", "semester-6", "cse"),
            new SubjectSeed("Cloud Computing", "cloud-computing", "CS701", "semester-7", "cse"),
            new SubjectSeed("Major Project", "major-project", "CS801", "semester-8", "cse")
    );

    private final UniversityRepository universityRepository;
    private final SemesterRepository semesterRepository;
    private final BranchRepository branchRepository;
    private final SubjectRepository subjectRepository;
    private final ProgrammingCategoryRepository programmingCategoryRepository;
    private final AppSettingRepository appSettingRepository;

    @Override
    @Transactional
    public void run(String... args) {
        University university = universityRepository.findBySlug("rgpv")
                .orElseGet(() -> universityRepository.save(University.builder()
                        .name("Rajiv Gandhi Proudyogiki Vishwavidyalaya")
                        .slug("rgpv")
                        .description("RGPV engineering study material catalog.")
                        .active(true)
                        .build()));

        for (int number = 1; number <= 8; number++) {
            String slug = "semester-" + number;
            if (semesterRepository.findBySlug(slug).isEmpty()) {
                semesterRepository.save(Semester.builder()
                        .number(number)
                        .name("Semester " + number)
                        .slug(slug)
                        .active(true)
                        .university(university)
                        .build());
            }
        }

        for (BranchSeed seed : BRANCHES) {
            if (branchRepository.findBySlug(seed.slug()).isEmpty()) {
                branchRepository.save(Branch.builder()
                        .name(seed.name())
                        .slug(seed.slug())
                        .code(seed.code())
                        .fullName(seed.fullName())
                        .active(true)
                        .university(university)
                        .build());
            }
        }

        for (CategorySeed seed : CATEGORIES) {
            if (programmingCategoryRepository.findBySlug(seed.slug()).isEmpty()) {
                programmingCategoryRepository.save(ProgrammingCategory.builder()
                        .name(seed.name())
                        .slug(seed.slug())
                        .description(seed.description())
                        .displayOrder(seed.displayOrder())
                        .active(true)
                        .build());
            }
        }

        for (SubjectSeed seed : SUBJECTS) {
            Semester semester = semesterRepository.findBySlug(seed.semesterSlug()).orElseThrow();
            Branch branch = branchRepository.findBySlug(seed.branchSlug()).orElseThrow();
            if (subjectRepository.findBySlugAndSemesterIdAndBranchId(seed.slug(), semester.getId(), branch.getId()).isEmpty()) {
                subjectRepository.save(Subject.builder()
                        .name(seed.name())
                        .slug(seed.slug())
                        .code(seed.code())
                        .active(true)
                        .semester(semester)
                        .branch(branch)
                        .build());
            }
        }

        if (!appSettingRepository.existsById("whatsapp_number")) {
            appSettingRepository.save(AppSetting.builder()
                    .key("whatsapp_number")
                    .value("8839173936")
                    .build());
        }
    }

    private record BranchSeed(String name, String slug, String code, String fullName) {
    }

    private record CategorySeed(String name, String slug, String description, int displayOrder) {
    }

    private record SubjectSeed(String name, String slug, String code, String semesterSlug, String branchSlug) {
    }
}
