package com.campusone.util;

import com.campusone.model.Role;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class RoleUtil {

    public static final String ROLE_ADMIN = "ROLE_ADMIN";
    public static final String ROLE_FACULTY = "ROLE_FACULTY";
    public static final String ROLE_STUDENT = "ROLE_STUDENT";

    public static final Set<String> ADMIN_ROLES = Set.of(ROLE_ADMIN);
    public static final Set<String> FACULTY_ROLES = Set.of(ROLE_FACULTY, ROLE_ADMIN);
    public static final Set<String> STUDENT_ROLES = Set.of(ROLE_STUDENT, ROLE_ADMIN);

    /**
     * Get the current authenticated user role
     */
    public Role getCurrentUserRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        
        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse(null);
        
        if (role == null) {
            return null;
        }
        
        return Role.valueOf(role.replace("ROLE_", ""));
    }

    /**
     * Check if current user is admin
     */
    public boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals(ROLE_ADMIN));
    }

    /**
     * Check if current user is faculty
     */
    public boolean isFaculty() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals(ROLE_FACULTY));
    }

    /**
     * Check if current user is student
     */
    public boolean isStudent() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals(ROLE_STUDENT));
    }

    /**
     * Check if current user has any of the given roles
     */
    public boolean hasAnyRole(String... roles) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }
        
        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        for (String role : roles) {
            String normalizedRole = role.startsWith("ROLE_") ? role : "ROLE_" + role;
            if (authorities.stream().anyMatch(auth -> auth.getAuthority().equals(normalizedRole))) {
                return true;
            }
        }
        return false;
    }

    /**
     * Convert role enum to Spring Security role string
     */
    public static String toSpringRole(Role role) {
        return "ROLE_" + role.name();
    }

    /**
     * Convert role string to role enum
     */
    public static Role fromSpringRole(String role) {
        if (role.startsWith("ROLE_")) {
            role = role.substring(5);
        }
        return Role.valueOf(role);
    }

    /**
     * Get all valid roles
     */
    public static Set<Role> getAllRoles() {
        return Set.of(Role.ADMIN, Role.FACULTY, Role.STUDENT);
    }

    /**
     * Get role display name
     */
    public static String getRoleDisplayName(Role role) {
        return switch (role) {
            case ADMIN -> "Administrator";
            case FACULTY -> "Faculty Member";
            case STUDENT -> "Student";
        };
    }
}

