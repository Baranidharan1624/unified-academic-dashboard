package com.campusone.service;

import com.campusone.dto.RoomDTO;
import com.campusone.dto.TimetableEntryDTO;
import com.campusone.dto.TimetableRequest;
import com.campusone.exception.ResourceNotFoundException;
import com.campusone.model.*;
import com.campusone.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class TimetableService {

    private final RoomRepository roomRepository;
    private final TimetableEntryRepository timetableEntryRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final SemesterRepository semesterRepository;
    private final JdbcTemplate jdbcTemplate;
    private static final List<String> WORK_DAYS = List.of("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY");

    // ==================== ROOM METHODS ====================

    public List<RoomDTO> getAllRooms() {
        return roomRepository.findByIsActiveTrue().stream()
                .map(this::mapRoomToDTO)
                .collect(Collectors.toList());
    }

    public RoomDTO getRoomById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));
        return mapRoomToDTO(room);
    }

    @Transactional
    public RoomDTO createRoom(RoomDTO roomDTO) {
        if (roomRepository.existsByRoomNameAndBuilding(roomDTO.getRoomName(), roomDTO.getBuilding())) {
            throw new IllegalArgumentException("Room already exists with this name in the building");
        }

        Room room = Room.builder()
                .roomNumber(roomDTO.getRoomName())
                .building(roomDTO.getBuilding())
                .capacity(roomDTO.getCapacity())
            .roomType(resolveRoomType(roomDTO.getRoomType()))
            .assignedDepartment(roomDTO.getAssignedDepartment())
            .assignedSemester(roomDTO.getAssignedSemester())
            .assignedSection(roomDTO.getAssignedSection())
            .assignedCourseCode(normalizeCourseCode(roomDTO.getAssignedCourseCode()))
                .isAvailable(true)
                .build();

        Room saved = roomRepository.save(room);
        return mapRoomToDTO(saved);
    }

    @Transactional
    public RoomImportResult importRooms(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Excel file is required");
        }

        int total = 0;
        int success = 0;
        List<RoomImportResult.ImportError> errors = new ArrayList<>();

        try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            if (sheet == null || sheet.getPhysicalNumberOfRows() <= 1) {
                return new RoomImportResult(0, 0, List.of());
            }

            DataFormatter formatter = new DataFormatter();
            Map<String, Integer> header = new HashMap<>();
            Row headerRow = sheet.getRow(0);
            for (int i = 0; i < headerRow.getLastCellNum(); i++) {
                String key = formatter.formatCellValue(headerRow.getCell(i));
                if (key != null && !key.isBlank()) {
                    header.put(normalizeHeader(key), i);
                }
            }

            for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
                Row row = sheet.getRow(rowIndex);
                if (row == null) {
                    continue;
                }
                total++;
                try {
                    String roomNumber = readCell(row, header, formatter, "room_number", "room number", "room", "room_no");
                    String roomType = readCell(row, header, formatter, "type", "room_type", "room type");
                    String assignedDepartment = readCell(row, header, formatter, "assigned_department", "department", "dept");
                    String assignedSemesterRaw = readCell(row, header, formatter, "assigned_semester", "semester");
                    String assignedSection = readCell(row, header, formatter, "assigned_section", "section");
                    String assignedCourseCode = readCell(row, header, formatter, "course_code", "coursecode", "course code");
                    String building = readCell(row, header, formatter, "building", "block");
                    String capacityRaw = readCell(row, header, formatter, "capacity");

                    if (roomNumber == null || roomNumber.isBlank()) {
                        throw new IllegalArgumentException("room_number is required");
                    }

                    RoomType type = roomType == null || roomType.isBlank()
                            ? RoomType.CLASS
                            : RoomType.valueOf(roomType.trim().toUpperCase());

                    Integer assignedSemester = null;
                    if (assignedSemesterRaw != null && !assignedSemesterRaw.isBlank()) {
                        assignedSemester = Integer.parseInt(assignedSemesterRaw.trim());
                    }

                    Integer capacity = null;
                    if (capacityRaw != null && !capacityRaw.isBlank()) {
                        capacity = Integer.parseInt(capacityRaw.trim());
                    }

                    String normalizedRoom = roomNumber.trim();
                    Room room = roomRepository.findByRoomNumber(normalizedRoom)
                            .orElse(Room.builder().roomNumber(normalizedRoom).build());

                    room.setRoomType(type);
                    room.setAssignedDepartment(assignedDepartment == null ? null : assignedDepartment.trim());
                    room.setAssignedSemester(assignedSemester);
                    room.setAssignedSection(assignedSection == null ? null : assignedSection.trim().toUpperCase());
                    room.setAssignedCourseCode(normalizeCourseCode(assignedCourseCode));
                    room.setBuilding(building == null || building.isBlank() ? "Main" : building.trim());
                    room.setCapacity(capacity);
                    room.setIsAvailable(true);

                    roomRepository.save(room);
                    success++;
                } catch (Exception ex) {
                    errors.add(new RoomImportResult.ImportError(rowIndex + 1, ex.getMessage()));
                }
            }
        } catch (IOException ex) {
            throw new IllegalArgumentException("Failed to read rooms excel: " + ex.getMessage(), ex);
        }

        return new RoomImportResult(total, success, errors);
    }

    @Transactional
    public void deleteRoom(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));
        
        // Deactivate instead of delete to preserve timetable data
        room.setIsActive(false);
        roomRepository.save(room);
    }

    // ==================== TIMETABLE ENTRY METHODS ====================

    public List<TimetableEntryDTO> getAllTimetableEntries() {
        return timetableEntryRepository.findByIsActiveTrue().stream()
                .map(this::mapTimetableEntryToDTO)
                .collect(Collectors.toList());
    }

    public TimetableEntryDTO getTimetableEntryById(Long id) {
        TimetableEntry entry = timetableEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Timetable entry not found with id: " + id));
        return mapTimetableEntryToDTO(entry);
    }

    @Transactional
    public TimetableEntryDTO createTimetableEntry(TimetableEntryDTO dto) {
        // Validate and fetch related entities
        CourseOffering courseOffering = courseOfferingRepository.findById(dto.getCourseOfferingId())
                .orElseThrow(() -> new ResourceNotFoundException("Course offering not found"));

        User faculty = userRepository.findById(dto.getFacultyId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found"));

        Room room = roomRepository.findById(dto.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));

        // Parse time and day
        DayOfWeek dayOfWeek = DayOfWeek.valueOf(dto.getDayOfWeek().toUpperCase());
        LocalTime startTime = dto.getStartTime();
        LocalTime endTime = dto.getEndTime();

        // Validate time
        if (!endTime.isAfter(startTime)) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        // Check for conflicts
        List<String> conflicts = checkConflicts(room.getId(), faculty.getId(), dayOfWeek, startTime, endTime, null);
        if (!conflicts.isEmpty()) {
            throw new IllegalArgumentException("Schedule conflict: " + String.join(", ", conflicts));
        }

        // Create entry
        TimetableEntry entry = TimetableEntry.builder()
                .courseOffering(courseOffering)
                .faculty(faculty)
                .room(room)
                .dayOfWeek(dayOfWeek.name())
                .startTime(startTime)
                .endTime(endTime)
                .isActive(true)
                .build();

        TimetableEntry saved = timetableEntryRepository.save(entry);
        return mapTimetableEntryToDTO(saved);
    }

    @Transactional
    public TimetableEntryDTO updateTimetableEntry(Long id, TimetableEntryDTO dto) {
        TimetableEntry entry = timetableEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Timetable entry not found with id: " + id));

        // Fetch updated entities
        CourseOffering courseOffering = courseOfferingRepository.findById(dto.getCourseOfferingId())
                .orElseThrow(() -> new ResourceNotFoundException("Course offering not found"));

        User faculty = userRepository.findById(dto.getFacultyId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found"));

        Room room = roomRepository.findById(dto.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));

        // Parse time and day
        DayOfWeek dayOfWeek = DayOfWeek.valueOf(dto.getDayOfWeek().toUpperCase());
        LocalTime startTime = dto.getStartTime();
        LocalTime endTime = dto.getEndTime();

        // Validate time
        if (!endTime.isAfter(startTime)) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        // Check for conflicts (excluding current entry)
        List<String> conflicts = checkConflicts(room.getId(), faculty.getId(), dayOfWeek, startTime, endTime, id);
        if (!conflicts.isEmpty()) {
            throw new IllegalArgumentException("Schedule conflict: " + String.join(", ", conflicts));
        }

        // Update entry
        entry.setCourseOffering(courseOffering);
        entry.setFaculty(faculty);
        entry.setRoom(room);
        entry.setDayOfWeek(dayOfWeek.name());
        entry.setStartTime(startTime);
        entry.setEndTime(endTime);

        TimetableEntry saved = timetableEntryRepository.save(entry);
        return mapTimetableEntryToDTO(saved);
    }

    @Transactional
    public void deleteTimetableEntry(Long id) {
        TimetableEntry entry = timetableEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Timetable entry not found with id: " + id));
        
        entry.setIsActive(false);
        timetableEntryRepository.save(entry);
    }

    // ==================== FACULTY TIMETABLE ====================

    public List<TimetableEntryDTO> getFacultyTimetable(Long facultyId) {
        return timetableEntryRepository.findByFacultyIdAndIsActiveTrue(facultyId).stream()
                .map(this::mapTimetableEntryToDTO)
                .collect(Collectors.toList());
    }

    // ==================== STUDENT TIMETABLE ====================

    public List<TimetableEntryDTO> getStudentTimetable(Long studentId) {
        User student = userRepository.findById(studentId)
            .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        if (student.getDepartment() != null && student.getSemester() != null && student.getSection() != null) {
            String normalizedDepartment = student.getDepartment().trim().toUpperCase();
            String normalizedSection = student.getSection().trim().toUpperCase();
            return timetableEntryRepository.findByIsActiveTrue().stream()
                .filter(entry -> Objects.equals(entry.getDepartment(), normalizedDepartment))
                .filter(entry -> Objects.equals(entry.getSemester(), String.valueOf(student.getSemester())))
                .filter(entry -> Objects.equals(entry.getSection(), normalizedSection))
                .map(this::mapTimetableEntryToDTO)
                .toList();
        }

        // Fallback to enrollment-based lookup for legacy records.
        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(studentId);
        List<Long> courseOfferingIds = enrollments.stream().map(e -> e.getCourseOffering().getId()).toList();
        return timetableEntryRepository.findByCourseOfferingIds(courseOfferingIds).stream().map(this::mapTimetableEntryToDTO).toList();
    }

    // ==================== CONFLICT DETECTION ====================

    /**
     * Check for scheduling conflicts
     * @param roomId Room ID
     * @param facultyId Faculty ID
     * @param dayOfWeek Day of week
     * @param startTime Start time
     * @param endTime End time
     * @param excludeId Exclude entry ID (for updates)
     * @return List of conflict messages
     */
    private List<String> checkConflicts(Long roomId, Long facultyId, 
            DayOfWeek dayOfWeek, LocalTime startTime, LocalTime endTime, Long excludeId) {
        
        List<String> conflicts = new java.util.ArrayList<>();

        // Check room conflicts
        List<TimetableEntry> roomConflicts = timetableEntryRepository.findRoomConflicts(
                roomId, dayOfWeek, startTime, endTime);
        
        if (excludeId != null) {
            roomConflicts = roomConflicts.stream()
                    .filter(e -> !e.getId().equals(excludeId))
                    .collect(Collectors.toList());
        }
        
        if (!roomConflicts.isEmpty()) {
            conflicts.add("Room is already booked for this time slot");
        }

        // Check faculty conflicts
        List<TimetableEntry> facultyConflicts = timetableEntryRepository.findFacultyConflicts(
                facultyId, dayOfWeek, startTime, endTime);
        
        if (excludeId != null) {
            facultyConflicts = facultyConflicts.stream()
                    .filter(e -> !e.getId().equals(excludeId))
                    .collect(Collectors.toList());
        }
        
        if (!facultyConflicts.isEmpty()) {
            conflicts.add("Faculty is already assigned to another class at this time");
        }

        return conflicts;
    }

    // ==================== MAPPING HELPERS ====================

    private RoomDTO mapRoomToDTO(Room room) {
        return RoomDTO.builder()
                .id(room.getId())
                .roomNumber(room.getRoomName())
                .building(room.getBuilding())
                .capacity(room.getCapacity())
                .roomType(room.getRoomType() != null ? room.getRoomType().name() : null)
                .assignedDepartment(room.getAssignedDepartment())
                .assignedSemester(room.getAssignedSemester())
                .assignedSection(room.getAssignedSection())
                .assignedCourseCode(room.getAssignedCourseCode())
                .isAvailable(room.getIsActive())
                .createdAt(room.getCreatedAt() != null ? room.getCreatedAt().toString() : null)
                .build();
    }

private TimetableEntryDTO mapTimetableEntryToDTO(TimetableEntry entry) {
        return TimetableEntryDTO.builder()
                .id(entry.getId())
                .courseOfferingId(entry.getCourseOffering().getId())
                .courseName(entry.getCourseOffering().getCourse().getCourseName())
                .courseCode(entry.getCourseOffering().getCourse().getCourseCode())
                .facultyId(entry.getFaculty().getId())
                .facultyName(entry.getFaculty().getName())
                .roomId(entry.getRoom().getId())
                .roomNumber(entry.getRoom().getRoomName())
                .building(entry.getRoom().getBuilding())
                .dayOfWeek(entry.getDayOfWeek())
                .startTime(entry.getStartTime())
                .endTime(entry.getEndTime())
                .periodNumber(entry.getPeriodNumber())
                .department(entry.getDepartment())
                .semester(entry.getSemester())
                .section(entry.getSection())
                .sessionType(entry.getSessionType())
                .isActive(entry.getIsActive())
                .createdAt(entry.getCreatedAt() != null ? entry.getCreatedAt().toString() : null)
                .build();
    }

    @Transactional
    public List<TimetableEntryDTO> generateAutomaticTimetable() {
        // Replace current active generated plan with a fresh conflict-free set.
        timetableEntryRepository.findByIsActiveTrue().forEach(entry -> {
            entry.setIsActive(false);
            timetableEntryRepository.save(entry);
        });

        List<Room> classRooms = roomRepository.findByIsAvailableTrue().stream()
            .filter(room -> room.getRoomType() == null || room.getRoomType() == RoomType.CLASS)
                .filter(room -> room.getAssignedDepartment() != null)
                .filter(room -> room.getAssignedSemester() != null)
                .filter(room -> room.getAssignedSection() != null && !room.getAssignedSection().isBlank())
                .sorted(Comparator.comparing(Room::getAssignedDepartment, String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(Room::getAssignedSemester)
                        .thenComparing(Room::getAssignedSection, String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(Room::getId))
                .toList();

        if (classRooms.isEmpty()) {
            return List.of();
        }

        List<TimetableEntry> generated = new ArrayList<>();
        List<String> days = WORK_DAYS;
        Map<Integer, LocalTime[]> slots = periodSlots();
        int[][] labPairs = new int[][]{{1, 2}, {2, 3}, {3, 4}, {4, 5}, {6, 7}};

        Map<Long, Map<String, Set<Integer>>> facultyBusy = new HashMap<>();
        Map<Long, Map<String, Set<Integer>>> roomBusy = new HashMap<>();

        for (Room classRoom : classRooms) {
            String department = classRoom.getAssignedDepartment().trim().toUpperCase();
            Integer semester = classRoom.getAssignedSemester();
            String section = classRoom.getAssignedSection().trim().toUpperCase();
            String academicYear = resolveAcademicYearForClass(department, semester, section);
            List<Course> courses = findCoursesByDepartmentAndSemester(department, semester);
            if (courses.isEmpty()) {
                log.warn("Skipping class room {} because no courses found for department {} semester {}", classRoom.getRoomNumber(), department, semester);
                continue;
            }

            Map<Long, User> assignedFaculty = new HashMap<>();
            List<Course> labs = courses.stream()
                    .filter(c -> c.getType() == CourseType.LAB)
                    .filter(c -> resolveFacultyForCourse(c, department, assignedFaculty) != null)
                    .toList();
            List<Course> theories = courses.stream()
                    .filter(c -> c.getType() != CourseType.LAB)
                    .filter(c -> resolveFacultyForCourse(c, department, assignedFaculty) != null)
                    .toList();

            Map<String, Set<Integer>> classBusy = new HashMap<>();
            for (String day : days) {
                classBusy.put(day, new HashSet<>());
            }

            for (Course lab : labs) {
                User faculty = assignedFaculty.get(lab.getId());
                if (faculty == null) {
                    continue;
                }

                Room chosenLabRoom = resolveLabRoom(department, semester, lab.getCourseCode());
                if (chosenLabRoom == null) {
                    log.warn("Skipping lab {} for {} semester {} section {} because no lab room is mapped",
                            lab.getCourseCode(), department, semester, section);
                    continue;
                }

                boolean placed = false;
                for (String day : days) {
                    if (placed) break;
                    for (int[] pair : labPairs) {
                        int p1 = pair[0];
                        int p2 = pair[1];

                        if (classBusy.get(day).contains(p1) || classBusy.get(day).contains(p2)) {
                            continue;
                        }
                        if (!isFacultyAvailable(facultyBusy, faculty.getId(), day, p1, p2)) {
                            continue;
                        }
                        if (!isRoomAvailable(roomBusy, chosenLabRoom.getId(), day, p1, p2)) {
                            continue;
                        }

                        CourseOffering offering = resolveOrCreateOffering(lab, faculty, semester, academicYear);
                        generated.add(buildEntry(offering, faculty, chosenLabRoom, day, p1, department, semester, section, "LAB", slots));
                        generated.add(buildEntry(offering, faculty, chosenLabRoom, day, p2, department, semester, section, "LAB", slots));
                        markBusy(classBusy, facultyBusy, roomBusy, day, p1, p2, faculty.getId(), chosenLabRoom.getId());
                        placed = true;
                        break;
                    }
                }

                if (!placed) {
                    log.warn("Skipping unplaced lab course {} for {} semester {}", lab.getCourseCode(), department, semester);
                }
            }

            if (!theories.isEmpty()) {
                List<int[]> freeSlots = new ArrayList<>();
                for (String day : days) {
                    for (int period = 1; period <= 7; period++) {
                        if (!classBusy.get(day).contains(period)) {
                            freeSlots.add(new int[]{days.indexOf(day), period});
                        }
                    }
                }

                Map<Long, Integer> theoryLoad = theories.stream().collect(Collectors.toMap(Course::getId, c -> 0));
                String[] dayNames = days.toArray(new String[0]);

                for (int[] slot : freeSlots) {
                    String day = dayNames[slot[0]];
                    int period = slot[1];

                    Course selected = theories.stream()
                            .filter(c -> assignedFaculty.get(c.getId()) != null)
                            .filter(c -> isFacultyAvailable(facultyBusy, assignedFaculty.get(c.getId()).getId(), day, period))
                            .sorted(Comparator.comparingInt(c -> theoryLoad.get(c.getId())))
                            .findFirst()
                            .orElse(null);

                    if (selected == null) {
                        continue;
                    }

                    User faculty = assignedFaculty.get(selected.getId());
                    CourseOffering offering = resolveOrCreateOffering(selected, faculty, semester, academicYear);
                    generated.add(buildEntry(offering, faculty, classRoom, day, period, department, semester, section, "THEORY", slots));
                    classBusy.get(day).add(period);
                    facultyBusy.computeIfAbsent(faculty.getId(), k -> initDayMap(days)).get(day).add(period);
                    roomBusy.computeIfAbsent(classRoom.getId(), k -> initDayMap(days)).get(day).add(period);
                    theoryLoad.put(selected.getId(), theoryLoad.get(selected.getId()) + 1);
                }
            }
        }

        return generated.stream().map(timetableEntryRepository::save).map(this::mapTimetableEntryToDTO).toList();
    }

    private List<Course> findCoursesByDepartmentAndSemester(String department, Integer semester) {
        List<Course> byName = courseRepository.findByDepartment_DepartmentNameIgnoreCaseAndSemester(department, semester);
        if (!byName.isEmpty()) {
            return byName;
        }

        List<Course> byCode = courseRepository.findByDepartment_DepartmentCodeIgnoreCaseAndSemester(department, semester);
        if (!byCode.isEmpty()) {
            return byCode;
        }

        return List.of();
    }

    private RoomType resolveRoomType(String roomType) {
        if (roomType == null || roomType.isBlank()) {
            return RoomType.CLASS;
        }
        return RoomType.valueOf(roomType.trim().toUpperCase());
    }

    private String normalizeHeader(String value) {
        return value.toLowerCase().trim().replace(" ", "_").replace("-", "_");
    }

    private String readCell(Row row, Map<String, Integer> header, DataFormatter formatter, String... keys) {
        for (String key : keys) {
            Integer idx = header.get(normalizeHeader(key));
            if (idx == null) {
                continue;
            }
            String value = formatter.formatCellValue(row.getCell(idx));
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return null;
    }

    private Map<String, Set<Integer>> initDayMap(List<String> days) {
        Map<String, Set<Integer>> map = new HashMap<>();
        for (String day : days) {
            map.put(day, new HashSet<>());
        }
        return map;
    }

    private Map<Integer, LocalTime[]> periodSlots() {
        Map<Integer, LocalTime[]> slots = new HashMap<>();
        slots.put(1, new LocalTime[]{LocalTime.of(8, 0), LocalTime.of(8, 50)});
        slots.put(2, new LocalTime[]{LocalTime.of(8, 50), LocalTime.of(9, 40)});
        slots.put(3, new LocalTime[]{LocalTime.of(10, 10), LocalTime.of(11, 0)});
        slots.put(4, new LocalTime[]{LocalTime.of(11, 0), LocalTime.of(11, 50)});
        slots.put(5, new LocalTime[]{LocalTime.of(11, 50), LocalTime.of(12, 40)});
        slots.put(6, new LocalTime[]{LocalTime.of(13, 30), LocalTime.of(14, 15)});
        slots.put(7, new LocalTime[]{LocalTime.of(14, 15), LocalTime.of(15, 0)});
        return slots;
    }

    private boolean isFacultyAvailable(Map<Long, Map<String, Set<Integer>>> busy, Long facultyId, String day, int... periods) {
        Map<String, Set<Integer>> facultyMap = busy.computeIfAbsent(facultyId, k -> initDayMap(WORK_DAYS));
        return Arrays.stream(periods).noneMatch(period -> facultyMap.get(day).contains(period));
    }

    private boolean isRoomAvailable(Map<Long, Map<String, Set<Integer>>> busy, Long roomId, String day, int... periods) {
        Map<String, Set<Integer>> roomMap = busy.computeIfAbsent(roomId, k -> initDayMap(WORK_DAYS));
        return Arrays.stream(periods).noneMatch(period -> roomMap.get(day).contains(period));
    }

    private void markBusy(Map<String, Set<Integer>> classBusy,
                          Map<Long, Map<String, Set<Integer>>> facultyBusy,
                          Map<Long, Map<String, Set<Integer>>> roomBusy,
                          String day,
                          int p1,
                          int p2,
                          Long facultyId,
                          Long roomId) {
        classBusy.get(day).add(p1);
        classBusy.get(day).add(p2);
        facultyBusy.computeIfAbsent(facultyId, k -> initDayMap(WORK_DAYS)).get(day).add(p1);
        facultyBusy.get(facultyId).get(day).add(p2);
        roomBusy.computeIfAbsent(roomId, k -> initDayMap(WORK_DAYS)).get(day).add(p1);
        roomBusy.get(roomId).get(day).add(p2);
    }

    private CourseOffering resolveOrCreateOffering(Course course, User faculty, Integer semester, String academicYear) {
        Semester semesterEntity = resolveOrCreateSemester(semester, academicYear);

        return courseOfferingRepository.findByCourseId(course.getId()).stream()
                .filter(o -> o.getSemester() != null && o.getSemester().getId().equals(semesterEntity.getId()))
                .filter(o -> o.getFaculty() != null && faculty != null && o.getFaculty().getId().equals(faculty.getId()))
                .findFirst()
                .orElseGet(() -> courseOfferingRepository.save(CourseOffering.builder()
                        .course(course)
                        .faculty(faculty)
                        .semester(semesterEntity)
                        .isActive(true)
                        .build()));
    }

    private TimetableEntry buildEntry(CourseOffering offering,
                                      User faculty,
                                      Room room,
                                      String day,
                                      int period,
                                      String department,
                                      Integer semester,
                                      String section,
                                      String sessionType,
                                      Map<Integer, LocalTime[]> slots) {
        LocalTime[] range = slots.get(period);
        return TimetableEntry.builder()
                .courseOffering(offering)
                .faculty(faculty)
                .room(room)
                .dayOfWeek(day)
                .startTime(range[0])
                .endTime(range[1])
                .periodNumber(period)
                .department(department)
                .semester(String.valueOf(semester))
                .section(section)
                .sessionType(sessionType)
                .isActive(true)
                .build();
    }

    private Room resolveAssignedRoom(String department, Integer semester, String section, RoomType roomType) {
        List<Room> matches = roomRepository
                .findAllByAssignedDepartmentIgnoreCaseAndAssignedSemesterAndAssignedSectionIgnoreCaseAndRoomTypeAndIsAvailableTrue(
                        department, semester, section, roomType);

        if (matches.isEmpty()) {
            throw new IllegalArgumentException("No fixed " + roomType + " room configured for " + department + " semester " + semester + " section " + section);
        }

        if (matches.size() > 1) {
            matches = matches.stream()
                    .sorted(Comparator.comparing(Room::getId, Comparator.reverseOrder()))
                    .toList();
        }

        return matches.get(0);
    }

    private Room resolveLabRoom(String department, Integer semester, String courseCode) {
        List<Room> matches = roomRepository
                .findAllByAssignedDepartmentIgnoreCaseAndAssignedSemesterAndAssignedCourseCodeIgnoreCaseAndRoomTypeAndIsAvailableTrue(
                        department, semester, normalizeCourseCode(courseCode), RoomType.LAB);
        if (matches.isEmpty()) {
            return null;
        }
        return matches.stream()
                .sorted(Comparator.comparing(Room::getId, Comparator.reverseOrder()))
                .findFirst()
                .orElse(null);
    }

    private String resolveAcademicYearForClass(String department, Integer semester, String section) {
        return userRepository.findByRoleAndDepartmentAndSemester(Role.STUDENT, department, semester).stream()
                .filter(student -> student.getSection() != null && section.equalsIgnoreCase(student.getSection()))
                .map(User::getAcademicYear)
                .filter(Objects::nonNull)
                .findFirst()
                .orElse("2026-2030");
    }

    private User resolveFacultyForCourse(Course course, String department, Map<Long, User> assignedFaculty) {
        if (assignedFaculty.containsKey(course.getId())) {
            return assignedFaculty.get(course.getId());
        }

        User faculty = course.getFaculty();
        if (faculty == null) {
            List<Long> facultyIds = jdbcTemplate.query(
                    """
                    SELECT a.id
                    FROM faculty_courses fc
                    JOIN faculty f ON f.faculty_id = fc.faculty_id
                    JOIN accounts a ON a.id = f.account_id
                    WHERE UPPER(fc.course_code) = ?
                      AND a.role = 'FACULTY'
                      AND (a.department IS NULL OR UPPER(a.department) = ?)
                    ORDER BY a.id DESC
                    """,
                    (rs, rowNum) -> rs.getLong(1),
                    normalizeCourseCode(course.getCourseCode()),
                    department.toUpperCase()
            );

            if (!facultyIds.isEmpty()) {
                faculty = userRepository.findById(facultyIds.get(0)).orElse(null);
            }
        }

        if (faculty == null) {
            log.warn("No faculty mapping found for course {}", course.getCourseCode());
        }

        assignedFaculty.put(course.getId(), faculty);
        return faculty;
    }

    private String normalizeCourseCode(String courseCode) {
        return courseCode == null ? null : courseCode.trim().toUpperCase();
    }

    private Semester resolveOrCreateSemester(Integer semester, String academicYear) {
        String safeAcademicYear = academicYear == null ? "2026-2030" : academicYear;
        List<Semester> matches = semesterRepository.findAllBySemesterNumberAndAcademicYearOrderByIdDesc(semester, safeAcademicYear);

        if (!matches.isEmpty()) {
            return matches.get(0);
        }

        return semesterRepository.save(Semester.builder()
                .semesterNumber(semester)
                .semesterName("Semester " + semester)
                .academicYear(safeAcademicYear)
                .isActive(true)
                .build());
    }

    public static class RoomImportResult {
        private final int totalRows;
        private final int successfulImports;
        private final List<ImportError> errors;

        public RoomImportResult(int totalRows, int successfulImports, List<ImportError> errors) {
            this.totalRows = totalRows;
            this.successfulImports = successfulImports;
            this.errors = errors;
        }

        public int getTotalRows() {
            return totalRows;
        }

        public int getSuccessfulImports() {
            return successfulImports;
        }

        public int getFailedRows() {
            return errors.size();
        }

        public List<ImportError> getErrors() {
            return errors;
        }

        public static class ImportError {
            private final int row;
            private final String error;

            public ImportError(int row, String error) {
                this.row = row;
                this.error = error;
            }

            public int getRow() {
                return row;
            }

            public String getError() {
                return error;
            }
        }
    }

    // Legacy wrapper methods for old controller compatibility
    public TimetableEntryDTO createTimetable(TimetableRequest request) {
        Room room = roomRepository.findByRoomNumber(request.getRoomNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + request.getRoomNumber()));
        TimetableEntryDTO dto = new TimetableEntryDTO();
        dto.setCourseOfferingId(request.getCourseId());
        dto.setFacultyId(request.getFacultyId());
        dto.setRoomId(room.getId());
        dto.setDayOfWeek(request.getDayOfWeek());
        dto.setStartTime(request.getStartTime());
        dto.setEndTime(request.getEndTime());
        dto.setIsActive(true);
        return createTimetableEntry(dto);
    }

    public TimetableEntryDTO updateTimetable(Long id, TimetableRequest request) {
        Room room = roomRepository.findByRoomNumber(request.getRoomNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + request.getRoomNumber()));
        TimetableEntryDTO dto = new TimetableEntryDTO();
        dto.setCourseOfferingId(request.getCourseId());
        dto.setFacultyId(request.getFacultyId());
        dto.setRoomId(room.getId());
        dto.setDayOfWeek(request.getDayOfWeek());
        dto.setStartTime(request.getStartTime());
        dto.setEndTime(request.getEndTime());
        return updateTimetableEntry(id, dto);
    }
}
