-- ============================================
-- CampusOne Academic Management System
-- Normalized Database Schema
-- Separate tables for admin, faculty, and student
-- ============================================

SET default_storage_engine=INNODB;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- DROP TABLES IN REVERSE DEPENDENCY ORDER
-- ============================================
DROP TABLE IF EXISTS user_notifications;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS task_submissions;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS timetable_entries;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS course_offerings;
DROP TABLE IF EXISTS faculty_courses;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS files;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS faculty;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS semesters;
DROP TABLE IF EXISTS academic_years;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS accounts;

-- ============================================
-- TABLE 1: ACCOUNTS (AUTH ONLY)
-- ============================================
CREATE TABLE accounts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'FACULTY', 'STUDENT') NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    department VARCHAR(100),
    semester INT,
    academic_year VARCHAR(20),
    designation VARCHAR(255),
    age INT,
    mobile_number VARCHAR(20),
    address VARCHAR(255),
    blood_group VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_accounts_email (email),
    INDEX idx_accounts_role (role),
    INDEX idx_accounts_status (status)
) ENGINE=InnoDB;

-- ============================================
-- TABLE 2: ADMINS
-- ============================================
CREATE TABLE admins (
    account_id BIGINT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TABLE 3: DEPARTMENTS
-- ============================================
CREATE TABLE departments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    department_name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    head_of_department VARCHAR(120),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- TABLE 5: ACADEMIC YEARS
-- ============================================
CREATE TABLE academic_years (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    year_label VARCHAR(20) NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('UPCOMING', 'ACTIVE', 'COMPLETED') DEFAULT 'UPCOMING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_academic_years_year (year_label),
    INDEX idx_academic_years_status (status)
) ENGINE=InnoDB;

-- ============================================
-- TABLE 6: SEMESTERS
-- ============================================
CREATE TABLE semesters (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    semester_name VARCHAR(40) NOT NULL,
    semester_number INT NOT NULL,
    academic_year_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('UPCOMING', 'ACTIVE', 'COMPLETED') DEFAULT 'UPCOMING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_semesters_academic_year (academic_year_id),
    INDEX idx_semesters_status (status),
    UNIQUE KEY unique_academic_semester (academic_year_id, semester_number),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TABLE 7: FACULTY
-- ============================================
CREATE TABLE faculty (
    account_id BIGINT PRIMARY KEY,
    faculty_id VARCHAR(40) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TABLE 8: FACULTY COURSES
-- ============================================
CREATE TABLE faculty_courses (
    faculty_id VARCHAR(40) NOT NULL,
    course_code VARCHAR(40) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (faculty_id, course_code),
    INDEX idx_faculty_courses_course (course_code),
    FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TABLE 9: STUDENTS
-- ============================================
CREATE TABLE students (
    account_id BIGINT PRIMARY KEY,
    registration_number VARCHAR(40) NOT NULL UNIQUE,
    section VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TABLE 9: COURSES
-- ============================================
CREATE TABLE courses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    course_code VARCHAR(40) NOT NULL,
    course_name VARCHAR(200) NOT NULL,
    description TEXT,
    credits INT NOT NULL DEFAULT 3,
    department_id BIGINT NOT NULL,
    faculty_id BIGINT,
    type ENUM('THEORY', 'LAB') DEFAULT 'THEORY',
    semester INT NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_course_per_dept_sem (course_code, semester, department_id),
    INDEX idx_courses_code (course_code),
    INDEX idx_courses_department (department_id),
    INDEX idx_courses_faculty (faculty_id),
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    FOREIGN KEY (faculty_id) REFERENCES accounts(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================
-- TABLE 10: COURSE OFFERINGS
-- ============================================
CREATE TABLE course_offerings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    course_id BIGINT NOT NULL,
    faculty_id BIGINT NOT NULL,
    semester_id BIGINT NOT NULL,
    capacity INT DEFAULT 60,
    enrolled_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    room VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_course_offerings_course (course_id),
    INDEX idx_course_offerings_semester (semester_id),
    INDEX idx_course_offerings_faculty (faculty_id),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES accounts(id) ON DELETE RESTRICT,
    FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TABLE 11: ENROLLMENTS
-- ============================================
CREATE TABLE enrollments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    course_offering_id BIGINT NOT NULL,
    status ENUM('ENROLLED', 'DROPPED', 'COMPLETED') DEFAULT 'ENROLLED',
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dropped_at TIMESTAMP NULL,
    INDEX idx_enrollments_student (student_id),
    INDEX idx_enrollments_course (course_offering_id),
    UNIQUE KEY unique_student_course (student_id, course_offering_id),
    FOREIGN KEY (student_id) REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (course_offering_id) REFERENCES course_offerings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TABLE 12: ROOMS
-- ============================================
CREATE TABLE rooms (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    room_number VARCHAR(50) NOT NULL UNIQUE,
    building VARCHAR(100) NOT NULL,
    capacity INT NOT NULL DEFAULT 30,
    room_type ENUM('CLASS', 'LAB') DEFAULT 'CLASS',
    assigned_department VARCHAR(20),
    assigned_semester INT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_rooms_number (room_number),
    INDEX idx_rooms_building (building)
) ENGINE=InnoDB;

-- ============================================
-- TABLE 13: TIMETABLE ENTRIES
-- ============================================
CREATE TABLE timetable_entries (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    course_offering_id BIGINT NOT NULL,
    faculty_id BIGINT NOT NULL,
    room_id BIGINT NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    semester VARCHAR(20),
    department VARCHAR(20),
    period_number INT,
    session_type VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_timetable_course (course_offering_id),
    INDEX idx_timetable_faculty (faculty_id),
    INDEX idx_timetable_room (room_id),
    INDEX idx_timetable_day (day_of_week),
    FOREIGN KEY (course_offering_id) REFERENCES course_offerings(id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES accounts(id) ON DELETE RESTRICT,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================
-- TABLE 14: ATTENDANCE
-- ============================================
CREATE TABLE attendance (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    total_classes INT NOT NULL DEFAULT 0,
    attended_classes INT NOT NULL DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_attendance_student (student_id),
    INDEX idx_attendance_course (course_id),
    UNIQUE KEY unique_student_course (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TABLE 15: FILES
-- ============================================
CREATE TABLE files (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    file_name VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    category ENUM('ASSIGNMENT', 'MATERIAL', 'REPORT', 'PROFILE', 'OTHER') DEFAULT 'OTHER',
    uploaded_by BIGINT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_files_uploaded_by (uploaded_by),
    INDEX idx_files_category (category),
    FOREIGN KEY (uploaded_by) REFERENCES accounts(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================
-- TABLE 16: TASKS
-- ============================================
CREATE TABLE tasks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    course_id BIGINT NOT NULL,
    deadline DATETIME NOT NULL,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tasks_course (course_id),
    INDEX idx_tasks_deadline (deadline),
    INDEX idx_tasks_created_by (created_by),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES accounts(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================
-- TABLE 17: TASK SUBMISSIONS
-- ============================================
CREATE TABLE task_submissions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    task_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    status ENUM('PENDING', 'SUBMITTED', 'LATE') NOT NULL DEFAULT 'PENDING',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_task_submissions_task (task_id),
    INDEX idx_task_submissions_student (student_id),
    UNIQUE KEY unique_task_student (task_id, student_id),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES accounts(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TABLE 18: NOTIFICATIONS
-- ============================================
CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    target_role ENUM('ADMIN', 'FACULTY', 'STUDENT') NOT NULL,
    type ENUM('ANNOUNCEMENT', 'ASSIGNMENT', 'ATTENDANCE', 'GRADE', 'GENERAL') DEFAULT 'GENERAL',
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notifications_target_role (target_role),
    INDEX idx_notifications_created_by (created_by),
    FOREIGN KEY (created_by) REFERENCES accounts(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================
-- TABLE 19: USER NOTIFICATIONS
-- ============================================
CREATE TABLE user_notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    notification_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('ANNOUNCEMENT', 'ASSIGNMENT', 'ATTENDANCE', 'GRADE', 'GENERAL') NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    INDEX idx_user_notifications_account (user_id),
    INDEX idx_user_notifications_notification (notification_id),
    UNIQUE KEY unique_account_notification (user_id, notification_id),
    FOREIGN KEY (user_id) REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
