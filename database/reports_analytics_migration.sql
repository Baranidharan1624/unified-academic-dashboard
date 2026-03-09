-- ============================================
-- ACTIVITY LOGS & REPORTS MIGRATION
-- ============================================

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id BIGINT,
    description VARCHAR(500),
    ip_address VARCHAR(50),
    user_agent VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Report Exports Table
CREATE TABLE IF NOT EXISTS report_exports (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    report_name VARCHAR(150) NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    parameters JSON,
    generated_by BIGINT NOT NULL,
    file_id BIGINT,
    status VARCHAR(20) DEFAULT 'COMPLETED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE SET NULL
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at);

CREATE INDEX idx_report_exports_generated_by ON report_exports(generated_by);
CREATE INDEX idx_report_exports_type ON report_exports(report_type);
CREATE INDEX idx_report_exports_created ON report_exports(created_at);
