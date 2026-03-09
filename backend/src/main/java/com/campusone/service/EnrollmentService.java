package com.campusone.service;

import com.campusone.dto.EnrollmentDTO;
import com.campusone.exception.ResourceNotFoundException;
import com.campusone.model.CourseOffering;
import com.campusone.model.Enrollment;
import com.campusone.model.Role;
import com.campusone.model.User;
import com.campusone.repository.CourseOfferingRepository;
import com.campusone.repository.EnrollmentRepository;
import com.campusone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final UserRepository userRepository;

    public List<EnrollmentDTO> getAllEnrollments() {
        return enrollmentRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<EnrollmentDTO> getEnrollmentsByCourseOffering(Long courseOfferingId) {
        return enrollmentRepository.findAll().stream()
                .filter(e -> e.getCourseOffering().getId().equals(courseOfferingId))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<EnrollmentDTO> getEnrollmentsByStudent(Long studentId) {
        return enrollmentRepository.findByStudentId(studentId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public EnrollmentDTO getEnrollmentById(Long id) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found with id: " + id));
        return mapToDTO(enrollment);
    }

    @Transactional
    public EnrollmentDTO enrollStudent(Long studentId, Long courseOfferingId) {
        // Check if student exists and is a STUDENT
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        if (student.getRole() != Role.STUDENT) {
            throw new IllegalArgumentException("User is not a student");
        }

        // Check if course offering exists
        CourseOffering courseOffering = courseOfferingRepository.findById(courseOfferingId)
                .orElseThrow(() -> new ResourceNotFoundException("Course offering not found with id: " + courseOfferingId));

        // Check if course offering is active
        if (!"ACTIVE".equals(courseOffering.getStatus())) {
            throw new IllegalArgumentException("Course offering is not active");
        }

        // Check if already enrolled
        if (enrollmentRepository.existsByStudentIdAndCourseOfferingId(studentId, courseOfferingId)) {
            throw new IllegalArgumentException("Student is already enrolled in this course");
        }

        // Check capacity
        if (!courseOffering.hasCapacity()) {
            throw new IllegalArgumentException("Course offering has reached maximum capacity");
        }

        // Create enrollment
        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .courseOffering(courseOffering)
                .status(Enrollment.EnrollmentStatus.ENROLLED)
                .build();

        // Increment enrollment count
        courseOffering.incrementEnrollment();
        courseOfferingRepository.save(courseOffering);

        Enrollment saved = enrollmentRepository.save(enrollment);
        return mapToDTO(saved);
    }

    @Transactional
    public void dropEnrollment(Long enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found with id: " + enrollmentId));

        // Decrement enrollment count
        CourseOffering courseOffering = enrollment.getCourseOffering();
        courseOffering.decrementEnrollment();
        courseOfferingRepository.save(courseOffering);

        enrollmentRepository.delete(enrollment);
    }

    private EnrollmentDTO mapToDTO(Enrollment enrollment) {
        CourseOffering offering = enrollment.getCourseOffering();
        
        return EnrollmentDTO.builder()
                .id(enrollment.getId())
                .studentId(enrollment.getStudent().getId())
.studentName(enrollment.getStudent().getName())
                .studentEmail(enrollment.getStudent().getEmail())
                .courseOfferingId(offering.getId())
                .courseName(offering.getCourse().getCourseName())
                .courseCode(offering.getCourse().getCourseCode())
                .credits(offering.getCourse().getCredits())
                .semesterName(offering.getSemester() != null ? offering.getSemester().getName() : null)
                .programName(offering.getProgram() != null ? offering.getProgram().getName() : null)
                .enrolledAt(enrollment.getEnrolledAt())
                .status(enrollment.getStatus() != null ? enrollment.getStatus().name() : null)
                .build();
    }
}
