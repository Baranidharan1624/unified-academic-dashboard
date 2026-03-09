package com.campusone.service;

import com.campusone.model.Semester;
import com.campusone.repository.SemesterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SemesterService {

    private final SemesterRepository semesterRepository;

    public List<Semester> getAllSemesters() {
        return semesterRepository.findAll();
    }

    public Optional<Semester> getSemesterById(Long id) {
        return semesterRepository.findById(id);
    }

    public Semester createSemester(Semester semester) {
        return semesterRepository.save(semester);
    }

    public Semester updateSemester(Long id, Semester semester) {
        if (semesterRepository.existsById(id)) {
            semester.setId(id);
            return semesterRepository.save(semester);
        }
        throw new RuntimeException("Semester not found with id: " + id);
    }

    public void deleteSemester(Long id) {
        semesterRepository.deleteById(id);
    }

    public Optional<Semester> getActiveSemester() {
        return semesterRepository.findByStatus("ACTIVE");
    }
}

