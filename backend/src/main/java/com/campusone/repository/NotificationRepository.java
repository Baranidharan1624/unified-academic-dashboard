package com.campusone.repository;

import com.campusone.model.Notification;
import com.campusone.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByTargetRoleOrderByCreatedAtDesc(Role role);
    List<Notification> findByCreatedBy_Id(Long userId);

    default List<Notification> findByCreatedById(Long userId) {
        return findByCreatedBy_Id(userId);
    }
}
