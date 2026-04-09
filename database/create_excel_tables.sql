-- Excel import support schema (idempotent)
-- Safe to run multiple times.

USE campusone;

-- Ensure students table has section column for students.xlsx
SET @section_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'campusone'
    AND TABLE_NAME = 'students'
    AND COLUMN_NAME = 'section'
);
SET @section_sql := IF(@section_exists = 0,
  'ALTER TABLE students ADD COLUMN section VARCHAR(255) NULL',
  'SELECT 1'
);
PREPARE section_stmt FROM @section_sql;
EXECUTE section_stmt;
DEALLOCATE PREPARE section_stmt;

-- Faculty to Course mapping table for Faculty_Courses.xlsx
CREATE TABLE IF NOT EXISTS faculty_courses (
  faculty_id VARCHAR(255) NOT NULL,
  course_code VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (faculty_id, course_code),
  INDEX idx_faculty_courses_course (course_code),
  CONSTRAINT fk_faculty_courses_faculty
    FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- Room to Course allocation table for Rooms.xlsx
CREATE TABLE IF NOT EXISTS room_course_allocations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  room_id BIGINT NOT NULL,
  course_code VARCHAR(255) NOT NULL,
  department VARCHAR(255),
  semester INT,
  section VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_room_course_allocation (room_id, course_code, department, semester, section),
  CONSTRAINT fk_room_course_alloc_room
    FOREIGN KEY (room_id) REFERENCES rooms(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;
