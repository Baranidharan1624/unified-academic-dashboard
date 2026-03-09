package com.campusone.service;

import com.campusone.exception.ResourceNotFoundException;
import com.campusone.model.Department;
import com.campusone.model.Program;
import com.campusone.repository.ProgramRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProgramService {

    private final ProgramRepository programRepository;
    private final DepartmentService departmentService;

    public List<Program> getAllPrograms() {
        return programRepository.findAll();
    }

    public Program getProgramById(Long id) {
        return programRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Program not found with id: " + id));
    }

    public Program getProgramByCode(String code) {
        return programRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Program not found with code: " + code));
    }

    public List<Program> getProgramsByDepartment(Long departmentId) {
        return programRepository.findByDepartmentId(departmentId);
    }

    @Transactional
    public Program createProgram(Program program, Long departmentId) {
        if (programRepository.existsByCode(program.getCode())) {
            throw new IllegalArgumentException("Program code already exists: " + program.getCode());
        }
        
        Department department = departmentService.getDepartmentById(departmentId);
        program.setDepartment(department);
        
        return programRepository.save(program);
    }

    @Transactional
    public Program updateProgram(Long id, Program programDetails) {
        Program program = getProgramById(id);
        
        program.setName(programDetails.getName());
        program.setDescription(programDetails.getDescription());
        program.setDurationYears(programDetails.getDurationYears());
        
        return programRepository.save(program);
    }

    @Transactional
    public void deleteProgram(Long id) {
        Program program = getProgramById(id);
        programRepository.delete(program);
    }

    public List<Program> searchPrograms(String query) {
        return programRepository.findByNameContainingIgnoreCase(query);
    }
}
