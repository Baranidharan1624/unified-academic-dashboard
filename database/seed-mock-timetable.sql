-- Mock timetable seed (DB-first, no auto-generation)
-- Usage (from repo root):
-- mysql -h localhost -u root -p12345 campusone < database/seed-mock-timetable.sql

-- 1) Clear current active timetable entries
DELETE FROM timetable_entries;

-- 2) Build student combinations that drive visibility rules (department + semester + section)
DROP TEMPORARY TABLE IF EXISTS tmp_student_combos;
CREATE TEMPORARY TABLE tmp_student_combos AS
SELECT DISTINCT
    UPPER(a.department) AS dept,
    a.semester AS sem,
    UPPER(s.section) AS sec
FROM accounts a
JOIN students s ON s.account_id = a.id
WHERE a.role = 'STUDENT'
  AND a.department IS NOT NULL
  AND a.semester IS NOT NULL
  AND s.section IS NOT NULL;

-- 3) Pick one best active course offering per combo (closest semester match)
DROP TEMPORARY TABLE IF EXISTS tmp_best_offering;
CREATE TEMPORARY TABLE tmp_best_offering AS
SELECT dept, sem, sec, offering_id, faculty_id
FROM (
    SELECT
        sc.dept,
        sc.sem,
        sc.sec,
        co.id AS offering_id,
        co.faculty_id,
        ROW_NUMBER() OVER (
            PARTITION BY sc.dept, sc.sem, sc.sec
            ORDER BY (c.semester = sc.sem) DESC, ABS(c.semester - sc.sem), co.id
        ) AS rn
    FROM tmp_student_combos sc
    JOIN departments d
      ON UPPER(d.department_code) = sc.dept
      OR UPPER(d.department_name) = sc.dept
    JOIN courses c ON c.department_id = d.id
    JOIN course_offerings co
      ON co.course_id = c.id
     AND co.is_active = 1
) ranked
WHERE rn = 1;

-- 4) Pick one best available room per combo
DROP TEMPORARY TABLE IF EXISTS tmp_best_room;
CREATE TEMPORARY TABLE tmp_best_room AS
SELECT dept, sem, sec, room_id
FROM (
    SELECT
        sc.dept,
        sc.sem,
        sc.sec,
        r.id AS room_id,
        ROW_NUMBER() OVER (
            PARTITION BY sc.dept, sc.sem, sc.sec
            ORDER BY
                (r.assigned_semester = sc.sem) DESC,
                ABS(COALESCE(r.assigned_semester, sc.sem) - sc.sem),
                (UPPER(COALESCE(r.assigned_section, sc.sec)) = sc.sec) DESC,
                r.id
        ) AS rn
    FROM tmp_student_combos sc
    JOIN rooms r
      ON UPPER(r.assigned_department) = sc.dept
     AND r.is_available = 1
) ranked
WHERE rn = 1;

-- 5) Insert deterministic weekly schedule (15 periods per combo: Mon-Fri P1-P3)
INSERT INTO timetable_entries (
    created_at,
    day_of_week,
    department,
    end_time,
    is_active,
    period_number,
    section,
    semester,
    session_type,
    start_time,
    course_offering_id,
    faculty_id,
    room_id
)
SELECT
    NOW(),
    dp.day_of_week,
    bo.dept,
    dp.end_time,
    b'1',
    dp.period_number,
    bo.sec,
    CAST(bo.sem AS CHAR),
    'LECTURE',
    dp.start_time,
    bo.offering_id,
    bo.faculty_id,
    br.room_id
FROM tmp_best_offering bo
JOIN tmp_best_room br
  ON br.dept = bo.dept
 AND br.sem = bo.sem
 AND br.sec = bo.sec
JOIN (
    SELECT 'MONDAY' AS day_of_week, 1 AS period_number, '08:00:00' AS start_time, '08:50:00' AS end_time
    UNION ALL SELECT 'MONDAY', 2, '08:50:00', '09:40:00'
    UNION ALL SELECT 'MONDAY', 3, '10:10:00', '11:00:00'
    UNION ALL SELECT 'TUESDAY', 1, '08:00:00', '08:50:00'
    UNION ALL SELECT 'TUESDAY', 2, '08:50:00', '09:40:00'
    UNION ALL SELECT 'TUESDAY', 3, '10:10:00', '11:00:00'
    UNION ALL SELECT 'WEDNESDAY', 1, '08:00:00', '08:50:00'
    UNION ALL SELECT 'WEDNESDAY', 2, '08:50:00', '09:40:00'
    UNION ALL SELECT 'WEDNESDAY', 3, '10:10:00', '11:00:00'
    UNION ALL SELECT 'THURSDAY', 1, '08:00:00', '08:50:00'
    UNION ALL SELECT 'THURSDAY', 2, '08:50:00', '09:40:00'
    UNION ALL SELECT 'THURSDAY', 3, '10:10:00', '11:00:00'
    UNION ALL SELECT 'FRIDAY', 1, '08:00:00', '08:50:00'
    UNION ALL SELECT 'FRIDAY', 2, '08:50:00', '09:40:00'
    UNION ALL SELECT 'FRIDAY', 3, '10:10:00', '11:00:00'
) dp;

-- 6) Summary
SELECT COUNT(*) AS seeded_entries
FROM timetable_entries
WHERE is_active = b'1';

SELECT department, semester, section, COUNT(*) AS classes
FROM timetable_entries
WHERE is_active = b'1'
GROUP BY department, semester, section
ORDER BY department, CAST(semester AS UNSIGNED), section;
