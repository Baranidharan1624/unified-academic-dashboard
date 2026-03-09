package com.campusone.repository;

import com.campusone.model.TimetableEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface TimetableEntryRepository extends JpaRepository<TimetableEntry, Long> {
    List<TimetableEntry> findByFaculty_Id(Long facultyId);
    List<TimetableEntry> findByCourseOffering_Id(Long courseOfferingId);
    List<TimetableEntry> findByRoom_Id(Long roomId);
    List<TimetableEntry> findByDayOfWeek(String dayOfWeek);

    default List<TimetableEntry> findByFacultyId(Long facultyId) {
        return findByFaculty_Id(facultyId);
    }

    default List<TimetableEntry> findByCourseOfferingId(Long courseOfferingId) {
        return findByCourseOffering_Id(courseOfferingId);
    }

    default List<TimetableEntry> findByRoomId(Long roomId) {
        return findByRoom_Id(roomId);
    }

    default List<TimetableEntry> findByIsActiveTrue() {
        return findAll().stream().filter(e -> Boolean.TRUE.equals(e.getIsActive())).toList();
    }

    default List<TimetableEntry> findByFacultyIdAndIsActiveTrue(Long facultyId) {
        return findAll().stream()
                .filter(e -> e.getFaculty() != null && facultyId.equals(e.getFaculty().getId()))
                .filter(e -> Boolean.TRUE.equals(e.getIsActive()))
                .toList();
    }

    default List<TimetableEntry> findByCourseOfferingIds(List<Long> ids) {
        return findAll().stream()
                .filter(e -> e.getCourseOffering() != null && ids.contains(e.getCourseOffering().getId()))
                .filter(e -> Boolean.TRUE.equals(e.getIsActive()))
                .toList();
    }

    default List<TimetableEntry> findRoomConflicts(Long roomId, DayOfWeek dayOfWeek, LocalTime startTime, LocalTime endTime) {
        String day = dayOfWeek.name();
        return findAll().stream()
                .filter(e -> e.getRoom() != null && roomId.equals(e.getRoom().getId()))
                .filter(e -> day.equalsIgnoreCase(e.getDayOfWeek()))
                .filter(e -> Boolean.TRUE.equals(e.getIsActive()))
                .filter(e -> e.getStartTime().isBefore(endTime) && e.getEndTime().isAfter(startTime))
                .toList();
    }

    default List<TimetableEntry> findFacultyConflicts(Long facultyId, DayOfWeek dayOfWeek, LocalTime startTime, LocalTime endTime) {
        String day = dayOfWeek.name();
        return findAll().stream()
                .filter(e -> e.getFaculty() != null && facultyId.equals(e.getFaculty().getId()))
                .filter(e -> day.equalsIgnoreCase(e.getDayOfWeek()))
                .filter(e -> Boolean.TRUE.equals(e.getIsActive()))
                .filter(e -> e.getStartTime().isBefore(endTime) && e.getEndTime().isAfter(startTime))
                .toList();
    }
}
