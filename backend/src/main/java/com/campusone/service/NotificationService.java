package com.campusone.service;

import com.campusone.model.Notification;
import com.campusone.model.Role;
import com.campusone.model.User;
import com.campusone.model.UserNotification;
import com.campusone.repository.NotificationRepository;
import com.campusone.repository.UserNotificationRepository;
import com.campusone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

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
                .type(type)
                .createdBy(creator.get())
                .build();
        
        notification = notificationRepository.save(notification);
        
        // Send to users based on target role
        sendToUsers(notification, targetRole, title, message, type);
        
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
                .type(type)
                .createdBy(creator.get())
                .build();
        
        notification = notificationRepository.save(notification);
        sendToUsers(notification, targetRole, title, message, type);
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
        return notificationRepository.findAll();
    }

    /**
     * Get notifications by role
     */
    public List<Notification> getByRole(Role role) {
        return notificationRepository.findByTargetRoleOrderByCreatedAtDesc(role);
    }

    /**
     * Create notification from request (controller support)
     */
    @Transactional
    public Notification createNotification(com.campusone.dto.NotificationRequest request) {
        Optional<User> creator = userRepository.findById(request.getCreatedBy());
        if (creator.isEmpty()) {
            throw new RuntimeException("User not found with id: " + request.getCreatedBy());
        }
        
        Notification notification = Notification.builder()
                .title(request.getTitle())
                .message(request.getMessage())
                .targetRole(request.getTargetRole())
                .type(Notification.NotificationType.ANNOUNCEMENT)
                .createdBy(creator.get())
                .build();
        
        notification = notificationRepository.save(notification);
        
        // Send to users based on target role
        sendToUsers(notification, request.getTargetRole(), request.getTitle(), 
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

    private void sendToUsers(Notification notification, Role targetRole, String title, 
            String message, Notification.NotificationType type) {
        List<User> users = userRepository.findByRole(targetRole);
        for (User user : users) {
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
