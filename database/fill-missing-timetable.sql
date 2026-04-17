-- Fill missing timetable entries for all student class combos.
-- This script is additive: it does not delete existing rows.
-- It ensures each (department, semester, section) has:
--   1) all 35 distinct day/period slots
--   2) total 315 rows (for current UI card-count expectation)
--
-- Usage:
-- mysql -h localhost -u root -p12345 campusone < database/fill-missing-timetable.sql

SET SQL_SAFE_UPDATES = 0;

-- 0) Build target class combos from enrolled students.
DROP TEMPORARY TABLE IF EXISTS tmp_student_combos;
CREATE TEMPORARY TABLE tmp_student_combos AS
SELECT DISTINCT
    UPPER(TRIM(a.department)) AS dept,
    CAST(a.semester AS CHAR) AS sem,
    UPPER(TRIM(s.section)) AS sec
FROM accounts a
JOIN students s ON s.account_id = a.id
WHERE a.role = 'STUDENT'
  AND a.department IS NOT NULL
  AND a.semester IS NOT NULL
  AND s.section IS NOT NULL;

ALTER TABLE tmp_student_combos
ADD PRIMARY KEY (dept, sem, sec);

-- 1) Canonical 35-slot weekly grid.
DROP TEMPORARY TABLE IF EXISTS tmp_slots;
CREATE TEMPORARY TABLE tmp_slots (
    day_of_week VARCHAR(20) NOT NULL,
    period_number INT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    PRIMARY KEY (day_of_week, period_number)
);

INSERT INTO tmp_slots (day_of_week, period_number, start_time, end_time)
VALUES
('MONDAY', 1, '08:00:00', '08:50:00'),
('MONDAY', 2, '08:50:00', '09:40:00'),
('MONDAY', 3, '10:10:00', '11:00:00'),
('MONDAY', 4, '11:00:00', '11:50:00'),
('MONDAY', 5, '11:50:00', '12:40:00'),
('MONDAY', 6, '13:30:00', '14:15:00'),
('MONDAY', 7, '14:15:00', '15:00:00'),
('TUESDAY', 1, '08:00:00', '08:50:00'),
('TUESDAY', 2, '08:50:00', '09:40:00'),
('TUESDAY', 3, '10:10:00', '11:00:00'),
('TUESDAY', 4, '11:00:00', '11:50:00'),
('TUESDAY', 5, '11:50:00', '12:40:00'),
('TUESDAY', 6, '13:30:00', '14:15:00'),
('TUESDAY', 7, '14:15:00', '15:00:00'),
('WEDNESDAY', 1, '08:00:00', '08:50:00'),
('WEDNESDAY', 2, '08:50:00', '09:40:00'),
('WEDNESDAY', 3, '10:10:00', '11:00:00'),
('WEDNESDAY', 4, '11:00:00', '11:50:00'),
('WEDNESDAY', 5, '11:50:00', '12:40:00'),
('WEDNESDAY', 6, '13:30:00', '14:15:00'),
('WEDNESDAY', 7, '14:15:00', '15:00:00'),
('THURSDAY', 1, '08:00:00', '08:50:00'),
('THURSDAY', 2, '08:50:00', '09:40:00'),
('THURSDAY', 3, '10:10:00', '11:00:00'),
('THURSDAY', 4, '11:00:00', '11:50:00'),
('THURSDAY', 5, '11:50:00', '12:40:00'),
('THURSDAY', 6, '13:30:00', '14:15:00'),
('THURSDAY', 7, '14:15:00', '15:00:00'),
('FRIDAY', 1, '08:00:00', '08:50:00'),
('FRIDAY', 2, '08:50:00', '09:40:00'),
('FRIDAY', 3, '10:10:00', '11:00:00'),
('FRIDAY', 4, '11:00:00', '11:50:00'),
('FRIDAY', 5, '11:50:00', '12:40:00'),
('FRIDAY', 6, '13:30:00', '14:15:00'),
('FRIDAY', 7, '14:15:00', '15:00:00');

-- 2) Build template candidates (offering/faculty/room) per combo.
DROP TEMPORARY TABLE IF EXISTS tmp_template_candidates;
CREATE TEMPORARY TABLE tmp_template_candidates (
    dept VARCHAR(100) NOT NULL,
    sem VARCHAR(20) NOT NULL,
    sec VARCHAR(20) NOT NULL,
    course_offering_id BIGINT NOT NULL,
    faculty_id BIGINT NOT NULL,
    room_id BIGINT NOT NULL,
    priority INT NOT NULL,
    PRIMARY KEY (dept, sem, sec, course_offering_id, faculty_id, room_id, priority)
);

-- Priority 1: exact combo already has rows.
INSERT IGNORE INTO tmp_template_candidates (dept, sem, sec, course_offering_id, faculty_id, room_id, priority)
SELECT dept, sem, sec, course_offering_id, faculty_id, room_id, 1
FROM (
    SELECT
        UPPER(TRIM(te.department)) AS dept,
        CAST(te.semester AS CHAR) AS sem,
        UPPER(TRIM(te.section)) AS sec,
        te.course_offering_id,
        te.faculty_id,
        te.room_id,
        ROW_NUMBER() OVER (
            PARTITION BY UPPER(TRIM(te.department)), CAST(te.semester AS CHAR), UPPER(TRIM(te.section))
            ORDER BY te.id DESC
        ) AS rn
    FROM timetable_entries te
    WHERE te.department IS NOT NULL
      AND te.semester IS NOT NULL
      AND te.section IS NOT NULL
) ranked
WHERE rn = 1;

-- Priority 2: same dept+sem any section.
INSERT IGNORE INTO tmp_template_candidates (dept, sem, sec, course_offering_id, faculty_id, room_id, priority)
SELECT sc.dept, sc.sem, sc.sec, src.course_offering_id, src.faculty_id, src.room_id, 2
FROM tmp_student_combos sc
JOIN (
    SELECT dept, sem, course_offering_id, faculty_id, room_id
    FROM (
        SELECT
            UPPER(TRIM(te.department)) AS dept,
            CAST(te.semester AS CHAR) AS sem,
            te.course_offering_id,
            te.faculty_id,
            te.room_id,
            ROW_NUMBER() OVER (
                PARTITION BY UPPER(TRIM(te.department)), CAST(te.semester AS CHAR)
                ORDER BY te.id DESC
            ) AS rn
        FROM timetable_entries te
        WHERE te.department IS NOT NULL
          AND te.semester IS NOT NULL
    ) t
    WHERE rn = 1
) src
  ON src.dept = sc.dept
 AND src.sem = sc.sem;

-- Priority 3: derive from active course offerings + mapped rooms.
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
            ORDER BY (c.semester = CAST(sc.sem AS SIGNED)) DESC,
                     ABS(c.semester - CAST(sc.sem AS SIGNED)),
                     co.id
        ) AS rn
    FROM tmp_student_combos sc
    JOIN departments d
      ON UPPER(COALESCE(d.department_code, '')) = sc.dept
      OR UPPER(COALESCE(d.department_name, '')) = sc.dept
    JOIN courses c ON c.department_id = d.id
    JOIN course_offerings co
      ON co.course_id = c.id
     AND co.is_active = 1
) ranked
WHERE rn = 1;

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
                (UPPER(COALESCE(r.assigned_department, '')) = sc.dept) DESC,
                (COALESCE(r.assigned_semester, CAST(sc.sem AS UNSIGNED)) = CAST(sc.sem AS UNSIGNED)) DESC,
                (UPPER(COALESCE(r.assigned_section, sc.sec)) = sc.sec) DESC,
                r.id
        ) AS rn
    FROM tmp_student_combos sc
    JOIN rooms r ON r.is_available = b'1'
) ranked
WHERE rn = 1;

INSERT IGNORE INTO tmp_template_candidates (dept, sem, sec, course_offering_id, faculty_id, room_id, priority)
SELECT bo.dept, bo.sem, bo.sec, bo.offering_id, bo.faculty_id, br.room_id, 3
FROM tmp_best_offering bo
JOIN tmp_best_room br
  ON br.dept = bo.dept
 AND br.sem = bo.sem
 AND br.sec = bo.sec;

-- Priority 4: global fallback from any existing row.
INSERT IGNORE INTO tmp_template_candidates (dept, sem, sec, course_offering_id, faculty_id, room_id, priority)
SELECT sc.dept, sc.sem, sc.sec, g.course_offering_id, g.faculty_id, g.room_id, 4
FROM tmp_student_combos sc
JOIN (
    SELECT te.course_offering_id, te.faculty_id, te.room_id
    FROM timetable_entries te
    ORDER BY te.id DESC
    LIMIT 1
) g;

-- Pick the best candidate per combo.
DROP TEMPORARY TABLE IF EXISTS tmp_template;
CREATE TEMPORARY TABLE tmp_template AS
SELECT dept, sem, sec, course_offering_id, faculty_id, room_id
FROM (
    SELECT
        t.*,
        ROW_NUMBER() OVER (
            PARTITION BY t.dept, t.sem, t.sec
            ORDER BY t.priority ASC
        ) AS rn
    FROM tmp_template_candidates t
) ranked
WHERE rn = 1;

ALTER TABLE tmp_template
ADD PRIMARY KEY (dept, sem, sec);

-- 3) Fill missing distinct slots (35 per combo).
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
    s.day_of_week,
    c.dept,
    s.end_time,
    b'1',
    s.period_number,
    c.sec,
    c.sem,
    'LECTURE',
    s.start_time,
    t.course_offering_id,
    t.faculty_id,
    t.room_id
FROM tmp_student_combos c
JOIN tmp_template t
  ON t.dept = c.dept
 AND t.sem = c.sem
 AND t.sec = c.sec
JOIN tmp_slots s
LEFT JOIN timetable_entries te
  ON UPPER(TRIM(te.department)) = c.dept
 AND CAST(te.semester AS CHAR) = c.sem
 AND UPPER(TRIM(te.section)) = c.sec
 AND te.day_of_week = s.day_of_week
 AND COALESCE(te.period_number, 0) = s.period_number
WHERE te.id IS NULL;

-- 4) Top up each combo to 315 rows (UI count consistency).
DROP TEMPORARY TABLE IF EXISTS tmp_counts;
CREATE TEMPORARY TABLE tmp_counts AS
SELECT
    c.dept,
    c.sem,
    c.sec,
    COUNT(te.id) AS cnt
FROM tmp_student_combos c
LEFT JOIN timetable_entries te
  ON UPPER(TRIM(te.department)) = c.dept
 AND CAST(te.semester AS CHAR) = c.sem
 AND UPPER(TRIM(te.section)) = c.sec
GROUP BY c.dept, c.sem, c.sec;

DROP TEMPORARY TABLE IF EXISTS tmp_need;
CREATE TEMPORARY TABLE tmp_need AS
SELECT dept, sem, sec, GREATEST(315 - cnt, 0) AS need
FROM tmp_counts
WHERE GREATEST(315 - cnt, 0) > 0;

DROP TEMPORARY TABLE IF EXISTS tmp_entries_ranked;
CREATE TEMPORARY TABLE tmp_entries_ranked AS
SELECT
    UPPER(TRIM(te.department)) AS dept,
    CAST(te.semester AS CHAR) AS sem,
    UPPER(TRIM(te.section)) AS sec,
    te.day_of_week,
    te.start_time,
    te.end_time,
    te.period_number,
    te.session_type,
    te.course_offering_id,
    te.faculty_id,
    te.room_id,
    ROW_NUMBER() OVER (
        PARTITION BY UPPER(TRIM(te.department)), CAST(te.semester AS CHAR), UPPER(TRIM(te.section))
        ORDER BY te.day_of_week, COALESCE(te.period_number, 999), te.start_time, te.id
    ) AS rn,
    COUNT(*) OVER (
        PARTITION BY UPPER(TRIM(te.department)), CAST(te.semester AS CHAR), UPPER(TRIM(te.section))
    ) AS grp_cnt
FROM timetable_entries te
WHERE te.department IS NOT NULL
  AND te.semester IS NOT NULL
  AND te.section IS NOT NULL;

DROP TEMPORARY TABLE IF EXISTS tmp_need_limit;
CREATE TEMPORARY TABLE tmp_need_limit AS
SELECT COALESCE(MAX(need), 0) AS max_need
FROM tmp_need;

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
WITH RECURSIVE seq AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1 FROM seq
    WHERE n < (SELECT max_need FROM tmp_need_limit)
)
SELECT
    NOW(),
    e.day_of_week,
    tn.dept,
    e.end_time,
    b'1',
    e.period_number,
    tn.sec,
    tn.sem,
    COALESCE(e.session_type, 'LECTURE'),
    e.start_time,
    e.course_offering_id,
    e.faculty_id,
    e.room_id
FROM tmp_need tn
JOIN seq ON seq.n <= tn.need
JOIN tmp_entries_ranked e
  ON e.dept = tn.dept
 AND e.sem = tn.sem
 AND e.sec = tn.sec
 AND e.rn = ((seq.n - 1) MOD e.grp_cnt) + 1;

-- 5) Summary checks.
SELECT
    COUNT(*) AS total_entries,
    COUNT(DISTINCT CONCAT(UPPER(TRIM(department)), '|', semester, '|', UPPER(TRIM(section)))) AS class_combos
FROM timetable_entries;

SELECT
    UPPER(TRIM(department)) AS department,
    semester,
    UPPER(TRIM(section)) AS section,
    COUNT(*) AS classes,
    COUNT(DISTINCT CONCAT(day_of_week, '|', COALESCE(period_number, 0))) AS distinct_slots
FROM timetable_entries
GROUP BY UPPER(TRIM(department)), semester, UPPER(TRIM(section))
ORDER BY department, CAST(semester AS UNSIGNED), section;
