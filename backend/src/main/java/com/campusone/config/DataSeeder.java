package com.campusone.config;

import com.campusone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final String DEFAULT_ADMIN_EMAIL = "admin.ops@campusone.edu";
    private final UserRepository userRepository;
    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.findByEmail(DEFAULT_ADMIN_EMAIL).isPresent()) {
            return;
        }

        String encodedPassword = passwordEncoder.encode("123");
        jdbcTemplate.update(
                "INSERT INTO users (name, full_name, email, password, role, status, department, academic_year) " +
                        "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                "Admin Ops",
                "Admin Ops",
                DEFAULT_ADMIN_EMAIL,
                encodedPassword,
                "ADMIN",
                "ACTIVE",
                "Administration",
                "2025-26"
        );
    }
}
