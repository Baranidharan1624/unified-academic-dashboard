package com.campusone.config;

import com.campusone.model.Department;
import com.campusone.model.Role;
import com.campusone.model.User;
import com.campusone.model.UserStatus;
import com.campusone.repository.DepartmentRepository;
import com.campusone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final String DEFAULT_ADMIN_EMAIL = "admin.ops@campusone.edu";

    private static final List<DepartmentSeed> DEFAULT_DEPARTMENTS = List.of(
        new DepartmentSeed("CSE", "CSE", List.of("B.E. Computer Science and Engineering"), List.of()),
        new DepartmentSeed("ECE", "ECE", List.of("B.E. Electronics and Communication Engineering"), List.of()),
        new DepartmentSeed("MECH", "MECH", List.of("B.E. Mechanical Engineering"), List.of()),
        new DepartmentSeed("CCE", "CCE", List.of("B.E. Computer and Communication Engineering"), List.of()),
        new DepartmentSeed("AIDS", "AIDS", List.of("B.Tech. Artificial Intelligence and Data Science"), List.of()),
        new DepartmentSeed("CSBS", "CSBS", List.of("B.Tech. Computer Science and Business Systems"), List.of()),
        new DepartmentSeed("AIML", "AIML", List.of("B.E. Computer Science and Engineering (AI&ML)"), List.of("CSE-AIML", "CSE AIML")),
        new DepartmentSeed("VLSI", "VLSI", List.of("B.E. Electronics Engineering (VLSI)"), List.of()),
        new DepartmentSeed("BIO", "BIO", List.of("B.Tech. Biotechnology"), List.of("BT"))
    );

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedDepartments();

        if (!userRepository.existsByEmail(DEFAULT_ADMIN_EMAIL)) {
            User admin = User.builder()
                    .fullName("Admin Ops")
                    .email(DEFAULT_ADMIN_EMAIL)
                    .password(passwordEncoder.encode("123"))
                    .role(Role.ADMIN)
                    .status(UserStatus.ACTIVE)
                    .department("Administration")
                    .academicYear("2025-26")
                    .build();

            userRepository.save(admin);
        }
    }

    private void seedDepartments() {
        for (DepartmentSeed seed : DEFAULT_DEPARTMENTS) {
            Department existing = findExistingDepartment(seed);
            if (existing != null) {
                boolean changed = false;

                if (!seed.name().equals(existing.getDepartmentName())) {
                    existing.setDepartmentName(seed.name());
                    changed = true;
                }
                if (!seed.code().equals(existing.getDepartmentCode())) {
                    existing.setDepartmentCode(seed.code());
                    changed = true;
                }
                if (existing.getDescription() == null || existing.getDescription().isBlank() || !seed.name().equals(existing.getDescription())) {
                    existing.setDescription(seed.name());
                    changed = true;
                }

                if (changed) {
                    departmentRepository.save(existing);
                }
                continue;
            }

            departmentRepository.save(Department.builder()
                    .departmentName(seed.name())
                    .departmentCode(seed.code())
                    .description(seed.name())
                    .build());
        }
    }

    private Department findExistingDepartment(DepartmentSeed seed) {
        var byCode = departmentRepository.findByDepartmentCode(seed.code());
        if (byCode.isPresent()) {
            return byCode.get();
        }

        for (String legacyCode : seed.legacyCodes()) {
            var byLegacyCode = departmentRepository.findByDepartmentCode(legacyCode);
            if (byLegacyCode.isPresent()) {
                return byLegacyCode.get();
            }
        }

        var byName = departmentRepository.findByDepartmentName(seed.name());
        if (byName.isPresent()) {
            return byName.get();
        }

        for (String legacyName : seed.legacyNames()) {
            var byLegacyName = departmentRepository.findByDepartmentName(legacyName);
            if (byLegacyName.isPresent()) {
                return byLegacyName.get();
            }
        }

        return null;
    }

    private record DepartmentSeed(String name, String code, List<String> legacyNames, List<String> legacyCodes) {
    }
}
