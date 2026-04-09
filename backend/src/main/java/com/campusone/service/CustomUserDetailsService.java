package com.campusone.service;

import com.campusone.model.UserStatus;
import com.campusone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        String normalizedUsername = username == null ? "" : username.trim().toLowerCase();
        var users = userRepository.findAllByEmailOrderByIdDesc(normalizedUsername);
        if (users.isEmpty()) {
            throw new UsernameNotFoundException("User not found");
        }

        if (users.size() > 1) {
            log.warn("Duplicate email records found during authentication for {}. Matching user ids={}",
                    normalizedUsername, users.stream().map(com.campusone.model.User::getId).toList());
        }

        var appUser = users.stream()
                .sorted(java.util.Comparator
                        .comparing((com.campusone.model.User user) -> user.getStatus() == UserStatus.ACTIVE ? 0 : 1)
                        .thenComparing(user -> user.getRole().name().equals("ADMIN") ? 0 : 1)
                        .thenComparing(com.campusone.model.User::getId, java.util.Comparator.reverseOrder()))
                .findFirst()
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return User.builder()
                .username(appUser.getEmail())
                .password(appUser.getPassword())
                .roles(appUser.getRole().name())
                .build();
    }
}
