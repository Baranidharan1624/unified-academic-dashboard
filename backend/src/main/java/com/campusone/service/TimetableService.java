package com.campusone.service;

import com.campusone.dto.RoomDTO;
import com.campusone.dto.TimetableEntryDTO;
import com.campusone.dto.TimetableRequest;
import com.campusone.exception.ResourceNotFoundException;
import com.campusone.model.*;
import com.campusone.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TimetableService {

    private final RoomRepository roomRepository;
    private final TimetableEntryRepository timetableEntryRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

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
                .isAvailable(true)
                .build();

        Room saved = roomRepository.save(room);
        return mapRoomToDTO(saved);
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
        // Get student's enrolled courses
        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(studentId);
        List<Long> courseOfferingIds = enrollments.stream()
                .map(e -> e.getCourseOffering().getId())
                .collect(Collectors.toList());

        if (courseOfferingIds.isEmpty()) {
            return List.of();
        }

        return timetableEntryRepository.findByCourseOfferingIds(courseOfferingIds).stream()
                .map(this::mapTimetableEntryToDTO)
                .collect(Collectors.toList());
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
                .isActive(entry.getIsActive())
                .createdAt(entry.getCreatedAt() != null ? entry.getCreatedAt().toString() : null)
                .build();
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
