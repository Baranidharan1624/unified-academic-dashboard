package com.campusone.service;

import com.campusone.dto.CourseDTO;
import com.campusone.exception.ResourceNotFoundException;
import com.campusone.model.Course;
import com.campusone.model.Department;
import com.campusone.repository.CourseRepository;
import com.campusone.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final DepartmentRepository departmentRepository;

    public List<CourseDTO> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public CourseDTO getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
        return mapToDTO(course);
    }

public List<CourseDTO> getCoursesByDepartment(Long departmentId) {
        return courseRepository.findAll().stream()
                .filter(c -> c.getDepartment() != null && c.getDepartment().getId().equals(departmentId))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<CourseDTO> getFacultyCourses(Long facultyId) {
        // Get courses offered by faculty through course offerings
        return courseRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CourseDTO createCourse(CourseDTO courseDTO) {
        Department department = departmentRepository.findById(courseDTO.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + courseDTO.getDepartmentId()));

        if (courseRepository.findAll().stream()
                .anyMatch(c -> c.getCourseCode().equalsIgnoreCase(courseDTO.getCourseCode()))) {
            throw new IllegalArgumentException("Course code already exists: " + courseDTO.getCourseCode());
        }

        Course course = Course.builder()
                .courseCode(courseDTO.getCourseCode())
                .courseName(courseDTO.getCourseName())
                .description(courseDTO.getDescription())
                .credits(courseDTO.getCredits())
                .department(department)
                .build();

        Course saved = courseRepository.save(course);
        return mapToDTO(saved);
    }

    @Transactional
    public CourseDTO updateCourse(Long id, CourseDTO courseDTO) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));

        course.setCourseName(courseDTO.getCourseName());
        course.setDescription(courseDTO.getDescription());
        course.setCredits(courseDTO.getCredits());

        if (courseDTO.getDepartmentId() != null && !courseDTO.getDepartmentId().equals(
                course.getDepartment() != null ? course.getDepartment().getId() : null)) {
            Department department = departmentRepository.findById(courseDTO.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + courseDTO.getDepartmentId()));
            course.setDepartment(department);
        }

        Course updated = courseRepository.save(course);
        return mapToDTO(updated);
    }

    @Transactional
    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
        courseRepository.delete(course);
    }

    private CourseDTO mapToDTO(Course course) {
        return CourseDTO.builder()
                .id(course.getId())
                .courseCode(course.getCourseCode())
                .courseName(course.getCourseName())
                .description(course.getDescription())
                .credits(course.getCredits())
                .departmentId(course.getDepartment() != null ? course.getDepartment().getId() : null)
                .departmentName(course.getDepartment() != null ? course.getDepartment().getName() : null)
                .createdAt(course.getCreatedAt() != null ? course.getCreatedAt().toString() : null)
                .build();
    }
}
