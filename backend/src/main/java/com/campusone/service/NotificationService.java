package com.campusone.service;

import com.campusone.model.Notification;
import com.campusone.model.Role;
import com.campusone.model.User;
import com.campusone.model.UserNotification;
import com.campusone.dto.NotificationRequest;
import com.campusone.dto.UserNotificationResponse;
import com.campusone.repository.NotificationRepository;
import com.campusone.repository.UserNotificationRepository;
import com.campusone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Locale;
import java.util.Comparator;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserNotificationRepository userNotificationRepository;
    private final UserRepository userRepository;

    /**
     * Create a notification and optionally send to users
     */
    @Transactional
    public Notification createNotification(String title, String message, Role targetRole, 
            Notification.NotificationType type, Long createdById) {
        
        Optional<User> creator = userRepository.findById(createdById);
        if (creator.isEmpty()) {
            throw new RuntimeException("User not found with id: " + createdById);
        }
        
        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .targetRole(targetRole)
                .targetType(Notification.TargetType.ROLE)
                .priority(Notification.NotificationPriority.MEDIUM)
                .type(type)
                .createdBy(creator.get())
                .build();
        
        notification = notificationRepository.save(notification);
        
        // Send to users based on target role
        sendToUsers(notification, resolveRecipients(NotificationRequest.builder()
            .targetType(NotificationRequest.TargetType.ROLE)
            .targetRole(targetRole)
            .build()), title, message, type);
        
        return notification;
    }

    /**
     * Send notification to all users of a specific role
     */
    @Transactional
    public void sendNotificationToRole(String title, String message, Role targetRole, 
            Notification.NotificationType type, Long createdById) {
        
        Optional<User> creator = userRepository.findById(createdById);
        if (creator.isEmpty()) {
            return;
        }
        
        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .targetRole(targetRole)
                .targetType(Notification.TargetType.ROLE)
                .priority(Notification.NotificationPriority.MEDIUM)
                .type(type)
                .createdBy(creator.get())
                .build();
        
        notification = notificationRepository.save(notification);
        sendToUsers(notification, resolveRecipients(NotificationRequest.builder()
            .targetType(NotificationRequest.TargetType.ROLE)
            .targetRole(targetRole)
            .build()), title, message, type);
    }

    /**
     * Send notification to a specific user
     */
    @Transactional
    public void sendNotificationToUser(String title, String message, Long userId, 
            Notification.NotificationType type, Long createdById) {
        
        Optional<User> recipient = userRepository.findById(userId);
        if (recipient.isEmpty()) {
            return;
        }
        
        UserNotification userNotification = UserNotification.builder()
                .user(recipient.get())
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .build();
        userNotificationRepository.save(userNotification);
    }

    /**
     * Send notification to all users
     */
    @Transactional
    public void sendToAll(String title, String message, Notification.NotificationType type, Long createdById) {
        List<User> allUsers = userRepository.findAll();
        for (User user : allUsers) {
            UserNotification userNotification = UserNotification.builder()
                    .user(user)
                    .title(title)
                    .message(message)
                    .type(type)
                    .isRead(false)
                    .build();
            userNotificationRepository.save(userNotification);
        }
    }

    /**
     * Get notifications for a user
     */
    public List<UserNotification> getUserNotifications(Long userId) {
        return userNotificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<UserNotificationResponse> getUserNotificationResponses(Long userId) {
        return userNotificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(un -> {
                    Notification n = un.getNotification();
                    return UserNotificationResponse.builder()
                            .id(un.getId())
                            .notificationId(n != null ? n.getId() : null)
                            .title(un.getTitle())
                            .message(un.getMessage())
                            .type(un.getType() != null ? un.getType().name() : Notification.NotificationType.ANNOUNCEMENT.name())
                            .priority(n != null && n.getPriority() != null ? n.getPriority().name() : Notification.NotificationPriority.MEDIUM.name())
                            .targetType(n != null && n.getTargetType() != null ? n.getTargetType().name() : Notification.TargetType.ROLE.name())
                            .targetRole(n != null && n.getTargetRole() != null ? n.getTargetRole().name() : null)
                            .targetDepartment(n != null ? n.getTargetDepartment() : null)
                            .targetAcademicYear(n != null ? n.getTargetAcademicYear() : null)
                            .targetSection(n != null ? n.getTargetSection() : null)
                            .isRead(un.isRead())
                            .createdAt(un.getCreatedAt())
                            .build();
                })
                .toList();
    }

    /**
     * Get unread notification count for a user
     */
    public Long getUnreadCount(Long userId) {
        return userNotificationRepository.countUnreadByUserId(userId);
    }

    /**
     * Mark notification as read
     */
    @Transactional
    public void markAsRead(Long userNotificationId) {
        Optional<UserNotification> userNotification = 
                userNotificationRepository.findById(userNotificationId);
        
        userNotification.ifPresent(un -> {
            un.setIsRead(true);
            un.setReadAt(java.time.LocalDateTime.now());
            userNotificationRepository.save(un);
        });
    }

    /**
     * Mark all notifications as read for a user
     */
    @Transactional
    public void markAllAsRead(Long userId) {
        List<UserNotification> unreadNotifications = 
                userNotificationRepository.findUnreadByUserId(userId);
        
        for (UserNotification un : unreadNotifications) {
            un.setIsRead(true);
            un.setReadAt(java.time.LocalDateTime.now());
        }
        
        userNotificationRepository.saveAll(unreadNotifications);
    }

    /**
     * Get all notifications (admin only)
     */
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll().stream()
                .sorted(Comparator.comparing(Notification::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    /**
     * Get notifications by role
     */
    public List<Notification> getByRole(Role role) {
        return notificationRepository.findAll().stream()
                .filter(notification -> matchesRole(notification, role))
                .sorted(Comparator.comparing(Notification::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    /**
     * Create notification from request (controller support)
     */
    @Transactional
    public Notification createNotification(NotificationRequest request) {
        Optional<User> creator = userRepository.findById(request.getCreatedBy());
        if (creator.isEmpty()) {
            throw new RuntimeException("User not found with id: " + request.getCreatedBy());
        }

        if (request.getTargetType() == null) {
            request.setTargetType(NotificationRequest.TargetType.ROLE);
        }
        if (request.getTargetType() == NotificationRequest.TargetType.ROLE && request.getTargetRole() == null) {
            throw new RuntimeException("Target role is required when target type is ROLE");
        }
        
        Notification notification = Notification.builder()
                .title(request.getTitle())
                .message(request.getMessage())
                .targetRole(request.getTargetRole())
                .targetType(mapTargetType(request.getTargetType()))
                .targetDepartment(normalize(request.getTargetDepartment()))
                .targetAcademicYear(normalize(request.getTargetAcademicYear()))
                .targetSection(normalize(request.getTargetSection()))
                .priority(mapPriority(request.getPriority()))
                .type(Notification.NotificationType.ANNOUNCEMENT)
                .createdBy(creator.get())
                .build();
        
        notification = notificationRepository.save(notification);
        
        // Send to users based on role/all + optional filters
        sendToUsers(notification, resolveRecipients(request), request.getTitle(), 
                request.getMessage(), Notification.NotificationType.ANNOUNCEMENT);
        
        return notification;
    }

    /**
     * Delete a notification
     */
    @Transactional
    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    private void sendToUsers(Notification notification, List<User> users, String title, 
            String message, Notification.NotificationType type) {
        for (User user : users) {
            UserNotification userNotification = UserNotification.builder()
                    .user(user)
                    .notification(notification)
                    .title(title)
                    .message(message)
                    .type(type)
                    .isRead(false)
                    .build();
            userNotificationRepository.save(userNotification);
        }
    }

    private List<User> resolveRecipients(NotificationRequest request) {
        return userRepository.findAll().stream()
                .filter(user -> request.getTargetType() == NotificationRequest.TargetType.ALL
                        || (request.getTargetRole() != null && user.getRole() == request.getTargetRole()))
                .filter(user -> isBlank(request.getTargetDepartment())
                        || equalsIgnoreCase(user.getDepartment(), request.getTargetDepartment()))
                .filter(user -> isBlank(request.getTargetAcademicYear())
                        || equalsIgnoreCase(user.getAcademicYear(), request.getTargetAcademicYear()))
                .filter(user -> isBlank(request.getTargetSection())
                        || equalsIgnoreCase(user.getSection(), request.getTargetSection()))
                .toList();
    }

    private boolean matchesRole(Notification notification, Role role) {
        if (notification == null) return false;
        Notification.TargetType targetType = notification.getTargetType() != null
                ? notification.getTargetType()
                : Notification.TargetType.ROLE;
        if (targetType == Notification.TargetType.ALL) {
            return true;
        }
        return notification.getTargetRole() == role;
    }

    private Notification.TargetType mapTargetType(NotificationRequest.TargetType targetType) {
        if (targetType == null) return Notification.TargetType.ROLE;
        return targetType == NotificationRequest.TargetType.ALL
                ? Notification.TargetType.ALL
                : Notification.TargetType.ROLE;
    }

    private Notification.NotificationPriority mapPriority(NotificationRequest.Priority priority) {
        if (priority == null) return Notification.NotificationPriority.MEDIUM;
        return switch (priority) {
            case LOW -> Notification.NotificationPriority.LOW;
            case HIGH -> Notification.NotificationPriority.HIGH;
            default -> Notification.NotificationPriority.MEDIUM;
        };
    }

    private String normalize(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private boolean equalsIgnoreCase(String left, String right) {
        if (left == null || right == null) return false;
        return left.trim().toLowerCase(Locale.ROOT).equals(right.trim().toLowerCase(Locale.ROOT));
    }

    // Helper method to send assignment notifications
    public void notifyAssignmentCreated(Long courseId, String courseName, String assignmentTitle, 
            Long createdBy) {
        String title = "New Assignment Posted";
        String message = String.format("New assignment '%s' has been posted for %s", 
                assignmentTitle, courseName);
        sendNotificationToRole(title, message, Role.STUDENT, 
                Notification.NotificationType.ASSIGNMENT, createdBy);
    }

    // Helper method to send attendance alerts
    public void notifyAttendanceAlert(Long studentId, String studentName, String courseName, 
            double attendancePercentage, Long createdBy) {
        String title = "Attendance Alert";
        String message = String.format("Your attendance in %s is %.1f%%. Please attend more classes.", 
                courseName, attendancePercentage);
        sendNotificationToUser(title, message, studentId, 
                Notification.NotificationType.ATTENDANCE, createdBy);
    }

    // Helper method to send grade notifications
    public void notifyGradePosted(Long studentId, String courseName, String assignmentTitle, 
            int marks, Long createdBy) {
        String title = "Grade Posted";
        String message = String.format("Your grade for '%s' in %s has been posted. Marks: %d", 
                assignmentTitle, courseName, marks);
        sendNotificationToUser(title, message, studentId, 
                Notification.NotificationType.GRADE, createdBy);
    }
}
