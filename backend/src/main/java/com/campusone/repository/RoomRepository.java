package com.campusone.repository;

import com.campusone.model.Room;
import com.campusone.model.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    Optional<Room> findByRoomNumber(String roomNumber);
    List<Room> findByBuilding(String building);
    List<Room> findByIsAvailableTrue();
    List<Room> findByCapacityGreaterThanEqual(Integer capacity);
    List<Room> findByRoomTypeAndIsAvailableTrue(RoomType roomType);
    List<Room> findAllByAssignedDepartmentIgnoreCaseAndAssignedSemesterAndAssignedSectionIgnoreCaseAndRoomTypeAndIsAvailableTrue(
        String assignedDepartment,
        Integer assignedSemester,
        String assignedSection,
        RoomType roomType);
    List<Room> findAllByAssignedDepartmentIgnoreCaseAndAssignedSemesterAndAssignedCourseCodeIgnoreCaseAndRoomTypeAndIsAvailableTrue(
        String assignedDepartment,
        Integer assignedSemester,
        String assignedCourseCode,
        RoomType roomType);

    default List<Room> findByIsActiveTrue() {
        return findByIsAvailableTrue();
    }

    default boolean existsByRoomNameAndBuilding(String roomName, String building) {
        return findAll().stream().anyMatch(r ->
                roomName.equalsIgnoreCase(r.getRoomNumber()) && building.equalsIgnoreCase(r.getBuilding()));
    }
}
