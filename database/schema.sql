CREATE DATABASE IF NOT EXISTS campushub;
USE campushub;

-- =========================================
-- 1. USERS
-- =========================================

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'faculty', 'company', 'admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================
-- 2. DEPARTMENTS
-- =========================================

CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================
-- 3. STUDENTS
-- =========================================

CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    enrollment_no VARCHAR(50) NOT NULL UNIQUE,
    department_id INT,
    semester INT,
    cgpa DECIMAL(3,2),
    phone VARCHAR(15),
    resume VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (department_id)
        REFERENCES departments(id)
        ON DELETE SET NULL,

    CHECK (cgpa >= 0 AND cgpa <= 10)
);


-- =========================================
-- 4. FACULTY
-- =========================================

CREATE TABLE faculty (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    department_id INT,
    employee_id VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (department_id)
        REFERENCES departments(id)
        ON DELETE SET NULL
);


-- =========================================
-- 5. COMPANIES
-- =========================================

CREATE TABLE companies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    company_name VARCHAR(150) NOT NULL,
    industry VARCHAR(100),
    website VARCHAR(255),
    description TEXT,
    approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- =========================================
-- 6. SUBJECTS
-- =========================================

CREATE TABLE subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(30) NOT NULL UNIQUE,
    department_id INT,
    semester INT,
    faculty_id INT,

    FOREIGN KEY (department_id)
        REFERENCES departments(id)
        ON DELETE SET NULL,

    FOREIGN KEY (faculty_id)
        REFERENCES faculty(id)
        ON DELETE SET NULL
);


-- =========================================
-- 7. ENROLLMENTS
-- Many-to-Many: Students <-> Subjects
-- =========================================

CREATE TABLE enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (student_id)
        REFERENCES students(id)
        ON DELETE CASCADE,

    FOREIGN KEY (subject_id)
        REFERENCES subjects(id)
        ON DELETE CASCADE,

    UNIQUE(student_id, subject_id)
);


-- =========================================
-- 8. ATTENDANCE
-- =========================================

CREATE TABLE attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    status ENUM('present', 'absent') NOT NULL,

    FOREIGN KEY (student_id)
        REFERENCES students(id)
        ON DELETE CASCADE,

    FOREIGN KEY (subject_id)
        REFERENCES subjects(id)
        ON DELETE CASCADE,

    UNIQUE(student_id, subject_id, attendance_date)
);


-- =========================================
-- 9. MARKS
-- =========================================

CREATE TABLE marks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    exam_type ENUM('midterm', 'internal', 'final') NOT NULL,
    marks DECIMAL(5,2) NOT NULL,

    FOREIGN KEY (student_id)
        REFERENCES students(id)
        ON DELETE CASCADE,

    FOREIGN KEY (subject_id)
        REFERENCES subjects(id)
        ON DELETE CASCADE,

    CHECK (marks >= 0)
);


-- =========================================
-- 10. SKILLS
-- =========================================

CREATE TABLE skills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE
);


-- =========================================
-- 11. STUDENT SKILLS
-- Many-to-Many: Students <-> Skills
-- =========================================

CREATE TABLE student_skills (
    student_id INT NOT NULL,
    skill_id INT NOT NULL,

    PRIMARY KEY(student_id, skill_id),

    FOREIGN KEY (student_id)
        REFERENCES students(id)
        ON DELETE CASCADE,

    FOREIGN KEY (skill_id)
        REFERENCES skills(id)
        ON DELETE CASCADE
);


-- =========================================
-- 12. JOBS
-- =========================================

CREATE TABLE jobs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(100),
    job_type ENUM('internship', 'full_time') NOT NULL,
    min_cgpa DECIMAL(3,2),
    salary DECIMAL(10,2),
    deadline DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (company_id)
        REFERENCES companies(id)
        ON DELETE CASCADE,

    CHECK (min_cgpa >= 0 AND min_cgpa <= 10)
);


-- =========================================
-- 13. APPLICATIONS
-- =========================================

CREATE TABLE applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    job_id INT NOT NULL,

    status ENUM(
        'applied',
        'shortlisted',
        'rejected',
        'selected'
    ) DEFAULT 'applied',

    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (student_id)
        REFERENCES students(id)
        ON DELETE CASCADE,

    FOREIGN KEY (job_id)
        REFERENCES jobs(id)
        ON DELETE CASCADE,

    UNIQUE(student_id, job_id)
);


-- =========================================
-- 14. NOTIFICATIONS
-- =========================================

CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    message VARCHAR(500) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (student_id)
        REFERENCES students(id)
        ON DELETE CASCADE
);


-- =========================================
-- 15. AUDIT LOGS
-- =========================================

CREATE TABLE audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);


-- =========================================
-- INDEXES
-- =========================================

CREATE INDEX idx_users_email
ON users(email);

CREATE INDEX idx_students_department
ON students(department_id);

CREATE INDEX idx_jobs_company
ON jobs(company_id);

CREATE INDEX idx_jobs_deadline
ON jobs(deadline);

CREATE INDEX idx_applications_student
ON applications(student_id);

CREATE INDEX idx_applications_job
ON applications(job_id);

CREATE INDEX idx_applications_status
ON applications(status);

CREATE INDEX idx_attendance_student
ON attendance(student_id);

CREATE INDEX idx_marks_student
ON marks(student_id);