package com.campusone.service;

import com.campusone.dto.LoginRequest;
import com.campusone.dto.LoginResponse;
import com.campusone.model.User;
import com.campusone.model.UserStatus;
import com.campusone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public LoginResponse login(LoginRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        User user = findUserByEmail(normalizedEmail);

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new IllegalStateException("Your login is blocked by admin");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        return LoginResponse.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    public Map<String, Object> getSessionStatus(Long userId, String email) {
        String normalizedEmail = normalizeEmail(email);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Guard against stale/forged local session values.
        if (!normalizeEmail(user.getEmail()).equals(normalizedEmail)) {
            throw new RuntimeException("Session identity mismatch");
        }

        boolean active = user.getStatus() == UserStatus.ACTIVE;
        return Map.of(
                "active", active,
                "status", user.getStatus() == null ? "UNKNOWN" : user.getStatus().name(),
                "message", active ? "ACTIVE" : "Your account is inactive. Please contact admin."
        );
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private User findUserByEmail(String email) {
        List<User> matches = userRepository.findAllByEmailOrderByIdDesc(email);
        if (matches.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        if (matches.size() > 1) {
            log.warn("Duplicate email records found for {}. Matching user ids={}",
                    email, matches.stream().map(User::getId).toList());
        }

        return matches.stream()
                .sorted(Comparator
                        .comparing((User user) -> user.getStatus() == UserStatus.ACTIVE ? 0 : 1)
                        .thenComparing(user -> user.getRole().name().equals("ADMIN") ? 0 : 1)
                        .thenComparing(User::getId, Comparator.reverseOrder()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
