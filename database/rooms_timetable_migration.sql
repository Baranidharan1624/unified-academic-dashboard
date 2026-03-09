-- Migration: Add Rooms and Timetable Entries Tables
-- Run this script to add new tables for the Timetable & Scheduling System

-- ============================================
-- ROOMS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS rooms (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    room_name VARCHAR(50) NOT NULL,
    building VARCHAR(100) NOT NULL,
    capacity INT NOT NULL DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_room_building (room_name, building)
);

-- ============================================
-- TIMETABLE ENTRIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS timetable_entries (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    course_offering_id BIGINT NOT NULL,
    faculty_id BIGINT NOT NULL,
    room_id BIGINT,
    day_of_week VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_offering_id) REFERENCES course_offerings(id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_rooms_building ON rooms(building);
CREATE INDEX idx_timetable_entries_course ON timetable_entries(course_offering_id);
CREATE INDEX idx_timetable_entries_faculty ON timetable_entries(faculty_id);
CREATE INDEX idx_timetable_entries_room ON timetable_entries(room_id);
CREATE INDEX idx_timetable_entries_day ON timetable_entries(day_of_week);

-- ============================================
-- SAMPLE DATA (Optional)
-- ============================================

INSERT INTO rooms (room_name, building, capacity) VALUES
('Room 101', 'Main Building', 60),
('Room 102', 'Main Building', 40),
('Room 103', 'Main Building', 30),
('Lab 201', 'Science Block', 30),
('Lab 202', 'Science Block', 25),
('Auditorium', 'Main Building', 200),
('Seminar Hall', 'Main Building', 50)
ON DUPLICATE KEY UPDATE room_name = room_name;
