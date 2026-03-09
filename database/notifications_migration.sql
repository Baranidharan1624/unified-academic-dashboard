-- ============================================
-- NOTIFICATIONS MIGRATION
-- ============================================

-- User Notifications Table (Links notifications to users)
CREATE TABLE IF NOT EXISTS user_notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    notification_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_notification (notification_id, user_id)
);

-- Add type column to notifications table if not exists
-- ALTER TABLE notifications ADD COLUMN type ENUM('ANNOUNCEMENT', 'ASSIGNMENT', 'ATTENDANCE', 'GRADE', 'SYSTEM') NOT NULL DEFAULT 'ANNOUNCEMENT';

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_user_notifications_user ON user_notifications(user_id);
CREATE INDEX idx_user_notifications_read ON user_notifications(user_id, is_read);
CREATE INDEX idx_notifications_target_role ON notifications(target_role);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
