package com.campusone.repository;

import com.campusone.model.UserNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserNotificationRepository extends JpaRepository<UserNotification, Long> {
    
    List<UserNotification> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    List<UserNotification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);
    
    Long countByUserIdAndIsReadFalse(Long userId);

    @Query("SELECT COUNT(un) FROM UserNotification un WHERE un.user.id = :userId AND un.isRead = false")
    Long countUnreadByUserId(Long userId);

    @Query("SELECT un FROM UserNotification un WHERE un.user.id = :userId AND un.isRead = false")
    List<UserNotification> findUnreadByUserId(Long userId);
}
