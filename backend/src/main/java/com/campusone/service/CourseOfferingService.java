package com.campusone.service;

import com.campusone.exception.ResourceNotFoundException;
import com.campusone.model.*;
import com.campusone.repository.CourseOfferingRepository;
import com.campusone.repository.CourseRepository;
import com.campusone.repository.SemesterRepository;
import com.campusone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseOfferingService {

    private final CourseOfferingRepository courseOfferingRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final SemesterRepository semesterRepository;
    private final ProgramService programService;

    public List<CourseOffering> getAllCourseOfferings() {
        return courseOfferingRepository.findAll();
    }

    public CourseOffering getCourseOfferingById(Long id) {
        return courseOfferingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course offering not found with id: " + id));
    }

    public List<CourseOffering> getCourseOfferingsBySemester(Long semesterId) {
        return courseOfferingRepository.findBySemesterId(semesterId);
    }

    public List<CourseOffering> getCourseOfferingsByProgram(Long programId) {
        return courseOfferingRepository.findByProgramId(programId);
    }

    public List<CourseOffering> getCourseOfferingsByFaculty(Long facultyId) {
        return courseOfferingRepository.findByFacultyId(facultyId);
    }

    public List<CourseOffering> getCourseOfferingsBySemesterAndProgram(Long semesterId, Long programId) {
        return courseOfferingRepository.findBySemesterAndProgram(semesterId, programId);
    }

    @Transactional
    public CourseOffering createCourseOffering(
            Long courseId, 
            Long facultyId, 
            Long semesterId, 
            Long programId, 
            Integer capacity) {
        
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));
        User faculty = userRepository.findById(facultyId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + facultyId));
        Semester semester = semesterRepository.findById(semesterId)
                .orElseThrow(() -> new ResourceNotFoundException("Semester not found with id: " + semesterId));
        Program program = programService.getProgramById(programId);

        // Check if this course is already offered in this semester/program
        List<CourseOffering> existing = courseOfferingRepository.findByCourseAndSemester(courseId, semesterId);
        if (!existing.isEmpty()) {
            throw new IllegalArgumentException("This course is already offered in the selected semester");
        }

        CourseOffering offering = CourseOffering.builder()
                .course(course)
                .faculty(faculty)
                .semester(semester)
                .program(program)
                .capacity(capacity)
                .enrolledCount(0)
                .build();

        return courseOfferingRepository.save(offering);
    }

    @Transactional
    public CourseOffering updateCourseOffering(Long id, Integer capacity) {
        CourseOffering offering = getCourseOfferingById(id);
        offering.setCapacity(capacity);
        return courseOfferingRepository.save(offering);
    }

    @Transactional
    public void deleteCourseOffering(Long id) {
        CourseOffering offering = getCourseOfferingById(id);
        
        if (offering.getEnrolledCount() > 0) {
            throw new IllegalArgumentException("Cannot delete course offering with enrolled students");
        }
        
        courseOfferingRepository.delete(offering);
    }

    @Transactional
    public CourseOffering assignFaculty(Long offeringId, Long facultyId) {
        CourseOffering offering = getCourseOfferingById(offeringId);
        User faculty = userRepository.findById(facultyId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + facultyId));
        
        if (faculty.getRole() != Role.FACULTY) {
            throw new IllegalArgumentException("User is not a faculty member");
        }
        
        offering.setFaculty(faculty);
        return courseOfferingRepository.save(offering);
    }
}
