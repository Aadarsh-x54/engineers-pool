INSERT INTO roles (name)
VALUES ('ROLE_ADMIN')
ON CONFLICT (name) DO NOTHING;

INSERT INTO universities (name, slug, description, active)
VALUES ('Rajiv Gandhi Proudyogiki Vishwavidyalaya', 'rgpv', 'RGPV engineering study material catalog.', TRUE)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO semesters (number, name, slug, university_id, active)
SELECT s.number, s.name, s.slug, u.id, TRUE
FROM universities u
CROSS JOIN (
    VALUES
        (1, 'Semester 1', 'semester-1'),
        (2, 'Semester 2', 'semester-2'),
        (3, 'Semester 3', 'semester-3'),
        (4, 'Semester 4', 'semester-4'),
        (5, 'Semester 5', 'semester-5'),
        (6, 'Semester 6', 'semester-6'),
        (7, 'Semester 7', 'semester-7'),
        (8, 'Semester 8', 'semester-8')
) AS s(number, name, slug)
WHERE u.slug = 'rgpv'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO branches (name, slug, code, full_name, university_id, active)
SELECT b.name, b.slug, b.code, b.full_name, u.id, TRUE
FROM universities u
CROSS JOIN (
    VALUES
        ('ALL Branch 1st Year', 'all-branch-1st-year', 'ALL', 'All Branches First Year'),
        ('CSE', 'cse', 'CSE', 'Computer Science and Engineering'),
        ('AIDS / AD', 'aids-ad', 'AD', 'Artificial Intelligence and Data Science'),
        ('AIML / AL', 'aiml-al', 'AL', 'Artificial Intelligence and Machine Learning'),
        ('AI', 'ai', 'AI', 'Artificial Intelligence'),
        ('AUTO', 'auto', 'AUTO', 'Automobile Engineering'),
        ('Auto & Robo', 'auto-and-robo', 'AR', 'Automobile and Robotics Engineering'),
        ('CHEMICAL', 'chemical', 'CH', 'Chemical Engineering'),
        ('CIVIL', 'civil', 'CE', 'Civil Engineering'),
        ('CSBS / CB', 'csbs-cb', 'CB', 'Computer Science and Business Systems'),
        ('CSE-DS / CD', 'cse-ds-cd', 'CD', 'Computer Science and Engineering - Data Science'),
        ('CSE-IOT', 'cse-iot', 'CI', 'Computer Science and Engineering - Internet of Things'),
        ('CSIT', 'csit', 'CSIT', 'Computer Science and Information Technology'),
        ('3DAG', '3dag', '3DAG', 'Three Dimensional Animation and Graphics'),
        ('IOT', 'iot', 'IOT', 'Internet of Things'),
        ('IS / IOT-CS', 'is-iot-cs', 'IS', 'Information Science / IoT Cyber Security'),
        ('CY', 'cy', 'CY', 'Cyber Security'),
        ('EC', 'ec', 'EC', 'Electronics and Communication Engineering'),
        ('EE', 'ee', 'EE', 'Electrical Engineering'),
        ('EEE', 'eee', 'EEE', 'Electrical and Electronics Engineering'),
        ('EI', 'ei', 'EI', 'Electronics and Instrumentation Engineering'),
        ('EX', 'ex', 'EX', 'Electrical and Electronics'),
        ('FT', 'ft', 'FT', 'Fire Technology and Safety Engineering'),
        ('IT', 'it', 'IT', 'Information Technology'),
        ('ME', 'me', 'ME', 'Mechanical Engineering'),
        ('MINING / MI', 'mining-mi', 'MI', 'Mining Engineering'),
        ('MM', 'mm', 'MM', 'Mining Machinery Engineering'),
        ('RA', 'ra', 'RA', 'Robotics and Automation'),
        ('Robo And Mech', 'robo-and-mech', 'RM', 'Robotics and Mechanical Engineering'),
        ('SD / CSD', 'sd-csd', 'CSD', 'Computer Science and Design'),
        ('OTHERS', 'others', 'OTH', 'Other Branches'),
        ('TX', 'tx', 'TX', 'Textile Technology')
) AS b(name, slug, code, full_name)
WHERE u.slug = 'rgpv'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO programming_categories (name, slug, description, display_order, active)
VALUES
    ('Python', 'python', 'Python language notes and practice material.', 10, TRUE),
    ('Java', 'java', 'Java language notes and object-oriented programming resources.', 20, TRUE),
    ('C', 'c', 'C language fundamentals and lab material.', 30, TRUE),
    ('C++', 'cpp', 'C++ and object-oriented programming material.', 40, TRUE),
    ('DSA', 'dsa', 'Data structures and algorithms notes.', 50, TRUE),
    ('Web Development', 'web-development', 'Frontend and full-stack web development notes.', 60, TRUE),
    ('App Development', 'app-development', 'Mobile app development resources.', 70, TRUE),
    ('Backend Development', 'backend-development', 'Server-side engineering and APIs.', 80, TRUE),
    ('Database', 'database', 'SQL, DBMS and database design notes.', 90, TRUE),
    ('Git & GitHub', 'git-and-github', 'Version control and collaboration resources.', 100, TRUE),
    ('AI/ML', 'ai-ml', 'Artificial intelligence and machine learning notes.', 110, TRUE),
    ('Data Science', 'data-science', 'Data science, analytics and statistics resources.', 120, TRUE),
    ('Projects', 'projects', 'Project reports, ideas and implementation resources.', 130, TRUE),
    ('Interview Preparation', 'interview-preparation', 'Placement and interview preparation notes.', 140, TRUE)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subjects (name, slug, code, semester_id, branch_id, active)
SELECT item.name, item.slug, item.code, sem.id, br.id, TRUE
FROM (
    VALUES
        ('Engineering Mathematics I', 'engineering-mathematics-i', 'BT101', 'semester-1', 'all-branch-1st-year'),
        ('Engineering Physics', 'engineering-physics', 'BT102', 'semester-1', 'all-branch-1st-year'),
        ('Basic Electrical Engineering', 'basic-electrical-engineering', 'BT103', 'semester-1', 'all-branch-1st-year'),
        ('Engineering Mathematics II', 'engineering-mathematics-ii', 'BT201', 'semester-2', 'all-branch-1st-year'),
        ('Basic Mechanical Engineering', 'basic-mechanical-engineering', 'BT203', 'semester-2', 'all-branch-1st-year'),
        ('Data Structures', 'data-structures', 'CS301', 'semester-3', 'cse'),
        ('Object Oriented Programming', 'object-oriented-programming', 'CS302', 'semester-3', 'cse'),
        ('Database Management Systems', 'database-management-systems', 'CS401', 'semester-4', 'cse'),
        ('Operating Systems', 'operating-systems', 'CS402', 'semester-4', 'cse'),
        ('Software Engineering', 'software-engineering', 'CS501', 'semester-5', 'cse'),
        ('Computer Networks', 'computer-networks', 'CS502', 'semester-5', 'cse'),
        ('Machine Learning', 'machine-learning', 'CS601', 'semester-6', 'cse'),
        ('Compiler Design', 'compiler-design', 'CS602', 'semester-6', 'cse'),
        ('Cloud Computing', 'cloud-computing', 'CS701', 'semester-7', 'cse'),
        ('Major Project', 'major-project', 'CS801', 'semester-8', 'cse')
) AS item(name, slug, code, semester_slug, branch_slug)
JOIN semesters sem ON sem.slug = item.semester_slug
JOIN branches br ON br.slug = item.branch_slug
ON CONFLICT (slug, semester_id, branch_id) DO NOTHING;

INSERT INTO app_settings (setting_key, setting_value)
VALUES ('whatsapp_number', '8839173936')
ON CONFLICT (setting_key) DO NOTHING;
