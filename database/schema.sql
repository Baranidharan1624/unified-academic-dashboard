-- ============================================
-- CampusOne Academic Management System
-- Production Database Schema
-- ============================================

-- Set InnoDB as default engine
SET default_storage_engine=INNODB;

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- TABLE 1: USERS
-- ============================================
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'FACULTY', 'STUDENT') NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',
    department_id BIGINT,
    phone VARCHAR(20),
    address VARCHAR(255),
    profile_image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_status (status),
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================
-- TABLE 2: DEPARTMENTS
-- ============================================
DROP TABLE IF EXISTS departments;
CREATE TABLE departments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_departments_code (code)
) ENGINE=InnoDB;

-- ============================================
-- TABLE 3: PROGRAMS
-- ============================================
DROP TABLE IF EXISTS programs;
CREATE TABLE programs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    department_id BIGINT NOT NULL,
    duration_years INT NOT NULL DEFAULT 4,
    degree_type ENUM('CERTIFICATE', 'DIPLOMA', 'BACHELOR', 'MASTER', 'PHD') DEFAULT 'BACHELOR',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_programs_code (code),
    INDEX idx_programs_department (department_id),
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================
-- TABLE 4: ACADEMIC YEARS
-- ============================================
DROP TABLE IF EXISTS academic_years;
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
-- TABLE 5: SEMESTERS
-- ============================================
DROP TABLE IF EXISTS semesters;
CREATE TABLE semesters (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
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
-- TABLE 6: COURSES
-- ============================================
DROP TABLE IF EXISTS courses;
CREATE TABLE courses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    course_code VARCHAR(40) NOT NULL UNIQUE,
    course_name VARCHAR(200) NOT NULL,
    description TEXT,
    credits INT NOT NULL DEFAULT 3,
    department_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_courses_code (course_code),
    INDEX idx_courses_department (department_id),
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================
-- TABLE 7: COURSE OFFERINGS
-- ============================================
DROP TABLE IF EXISTS course_offerings;
CREATE TABLE course_offerings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    course_id BIGINT NOT NULL,
    faculty_id BIGINT,
    semester_id BIGINT NOT NULL,
    program_id BIGINT NOT NULL,
    capacity INT NOT NULL DEFAULT 60,
    enrolled_count INT DEFAULT 0,
    status ENUM('DRAFT', 'OPEN', 'CLOSED', 'CANCELLED') DEFAULT 'OPEN',
    room VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_course_offerings_course (course_id),
    INDEX idx_course_offerings_semester (semester_id),
    INDEX idx_course_offerings_program (program_id),
    INDEX idx_course_offerings_faculty (faculty_id),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TABLE 8: COURSE ENROLLMENTS
-- ============================================
DROP TABLE IF EXISTS course_enrollments;
CREATE TABLE course_enrollments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    course_offering_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('ENROLLED', 'DROPPED', 'COMPLETED', 'FAILED') DEFAULT 'ENROLLED',
    INDEX idx_enrollments_course (course_offering_id),
    INDEX idx_enrollments_student (student_id),
    UNIQUE KEY unique_student_course (student_id, course_offering_id),
    FOREIGN KEY (course_offering_id) REFERENCES course_offerings(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TABLE 9: ROOMS
-- ============================================
DROP TABLE IF EXISTS rooms;
CREATE TABLE rooms (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    room_name VARCHAR(50) NOT NULL,
    building VARCHAR(100) NOT NULL,
    capacity INT NOT NULL DEFAULT 30,
    room_type ENUM('LECTURE', 'LAB', 'SEMINAR', 'AUDITORIUM') DEFAULT 'LECTURE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_rooms_name (room_name),
    INDEX idx_rooms_building (building)
) ENGINE=InnoDB;

-- ============================================
-- TABLE 10: TIMETABLE ENTRIES
-- ============================================
DROP TABLE IF EXISTS timetable_entries;
CREATE TABLE timetable_entries (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    course_offering_id BIGINT NOT NULL,
    faculty_id BIGINT NOT NULL,
    room_id BIGINT,
    day_of_week VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_timetable_course (course_offering_id),
    INDEX idx_timetable_faculty (faculty_id),
    INDEX idx_timetable_room (room_id),
    INDEX idx_timetable_day (day_of_week),
    FOREIGN KEY (course_offering_id) REFERENCES course_offerings(id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================
-- TABLE 11: CLASS SESSIONS
-- ============================================
DROP TABLE IF EXISTS class_sessions;
CREATE TABLE class_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    course_offering_id BIGINT NOT NULL,
    faculty_id BIGINT NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    topic VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sessions_course (course_offering_id),
    INDEX idx_sessions_date (session_date),
    INDEX idx_sessions_faculty (faculty_id),
    FOREIGN KEY (course_offering_id) REFERENCES course_offerings(id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TABLE 12: ATTENDANCE RECORDS
-- ============================================
DROP TABLE IF EXISTS attendance_records;
CREATE TABLE attendance_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    session_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    status ENUM('PRESENT', 'ABSENT', 'LATE', 'EXCUSED') NOT NULL DEFAULT 'ABSENT',
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_attendance_session (session_id),
    INDEX idx_attendance_student (student_id),
    UNIQUE KEY unique_student_session (student_id, session_id),
    FOREIGN KEY (session_id) REFERENCES class_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TABLE 13: ATTENDANCE SUMMARY
-- ============================================
DROP TABLE IF EXISTS attendance_summary;
CREATE TABLE attendance_summary (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    course_offering_id BIGINT NOT NULL,
    total_classes INT NOT NULL DEFAULT 0,
    attended_classes INT NOT NULL DEFAULT 0,
    attendance_percentage DECIMAL(5,2) DEFAULT 0.00,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_summary_student (student_id),
    INDEX idx_summary_course (course_offering_id),
    UNIQUE KEY unique_student_course_summary (student_id, course_offering_id),
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_offering_id) REFERENCES course_offerings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TABLE 14: FILES
-- ============================================
DROP TABLE IF EXISTS files;
CREATE TABLE files (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    file_name VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    uploaded_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_files_uploaded_by (uploaded_by),
    INDEX idx_files_type (file_type),
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TABLE 15: ASSIGNMENTS
-- ============================================
DROP TABLE IF EXISTS assignments;
CREATE TABLE assignments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    course_offering_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    due_date DATETIME NOT NULL,
    max_marks INT NOT NULL DEFAULT 100,
    allow_resubmission BOOLEAN DEFAULT FALSE,
    created_by BIGINT NOT NULL,
    status ENUM('DRAFT', 'PUBLISHED', 'CLOSED') DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_assignments_course (course_offering_id),
    INDEX idx_assignments_due_date (due_date),
    INDEX idx_assignments_created_by (created_by),
    FOREIGN KEY (course_offering_id) REFERENCES course_offerings(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TABLE 16: ASSIGNMENT SUBMISSIONS
-- ============================================
DROP TABLE IF EXISTS assignment_submissions;
CREATE TABLE assignment_submissions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    assignment_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    file_id BIGINT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    grade INT,
    feedback TEXT,
    status ENUM('SUBMITTED', 'LATE', 'GRADED') NOT NULL DEFAULT 'SUBMITTED',
    graded_at TIMESTAMP,
    graded_by BIGINT,
    INDEX idx_submissions_assignment (assignment_id),
    INDEX idx_submissions_student (student_id),
    UNIQUE KEY unique_assignment_student (assignment_id, student_id),
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE SET NULL,
    FOREIGN KEY (graded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================
-- TABLE 17: NOTIFICATIONS
-- ============================================
DROP TABLE IF EXISTS notifications;
CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('ANNOUNCEMENT', 'ASSIGNMENT', 'ATTENDANCE', 'GRADE', 'SYSTEM') NOT NULL DEFAULT 'ANNOUNCEMENT',
    target_role ENUM('ADMIN', 'FACULTY', 'STUDENT', 'ALL') NOT NULL,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notifications_type (type),
    INDEX idx_notifications_target_role (target_role),
    INDEX idx_notifications_created_at (created_at),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TABLE 18: USER NOTIFICATIONS
-- ============================================
DROP TABLE IF EXISTS user_notifications;
CREATE TABLE user_notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    notification_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_notifications_user (user_id),
    INDEX idx_user_notifications_read (user_id, is_read),
    UNIQUE KEY unique_user_notification (notification_id, user_id),
    FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TABLE 19: ACTIVITY LOGS
-- ============================================
DROP TABLE IF EXISTS activity_logs;
CREATE TABLE activity_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id BIGINT,
    description VARCHAR(500),
    ip_address VARCHAR(50),
    user_agent VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_activity_logs_user (user_id),
    INDEX idx_activity_logs_action (action),
    INDEX idx_activity_logs_entity (entity_type, entity_id),
    INDEX idx_activity_logs_created (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TABLE 20: REPORT EXPORTS
-- ============================================
DROP TABLE IF EXISTS report_exports;
CREATE TABLE report_exports (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    report_name VARCHAR(150) NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    parameters JSON,
    generated_by BIGINT NOT NULL,
    file_id BIGINT,
    status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_report_exports_generated_by (generated_by),
    INDEX idx_report_exports_type (report_type),
    INDEX idx_report_exports_created (created_at),
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RELATIONSHIPS SUMMARY
-- ============================================
-- Users → Departments (department_id)
-- Programs → Departments (department_id)
-- Courses → Departments (department_id)
-- Academic Years - standalone
-- Semesters → Academic Years (academic_year_id)
-- Course Offerings → Courses (course_id)
-- Course Offerings → Faculty/Users (faculty_id)
-- Course Offerings → Semesters (semester_id)
-- Course Offerings → Programs (program_id)
-- Course Enrollments → Course Offerings (course_offering_id)
-- Course Enrollments → Students/Users (student_id)
-- Timetable Entries → Course Offerings (course_offering_id)
-- Timetable Entries → Faculty/Users (faculty_id)
-- Timetable Entries → Rooms (room_id)
-- Class Sessions → Course Offerings (course_offering_id)
-- Class Sessions → Faculty/Users (faculty_id)
-- Attendance Records → Class Sessions (session_id)
-- Attendance Records → Students/Users (student_id)
-- Attendance Summary → Students/Users (student_id)
-- Attendance Summary → Course Offerings (course_offering_id)
-- Files → Users (uploaded_by)
-- Assignments → Course Offerings (course_offering_id)
-- Assignments → Faculty/Users (created_by)
-- Assignment Submissions → Assignments (assignment_id)
-- Assignment Submissions → Students/Users (student_id)
-- Assignment Submissions → Files (file_id)
-- Assignment Submissions → Faculty/Users (graded_by)
-- Notifications → Users (created_by)
-- User Notifications → Notifications (notification_id)
-- User Notifications → Users (user_id)
-- Activity Logs → Users (user_id)
-- Report Exports → Users (generated_by)
-- Report Exports → Files (file_id)

-- ============================================
-- COMPLETE!
-- ============================================
