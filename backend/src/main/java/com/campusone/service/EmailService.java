package com.campusone.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.login.url:http://localhost:5173/login}")
    private String loginUrl;

    @Async
    public void sendAccountCreatedEmail(String name, String email, String userId, String password) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("CampusOne Account Created");
            message.setText(buildEmailBody(name, userId, email, password));
            message.setFrom("noreply@campusone.com");
            
            mailSender.send(message);
            log.info("Account creation email sent to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", email, e.getMessage());
        }
    }

    private String buildEmailBody(String name, String userId, String email, String password) {
        return String.format(
            "Hello %s,\n\n" +
            "Your CampusOne account has been created.\n\n" +
            "Login Details:\n" +
            "User ID: %s\n" +
            "Email: %s\n" +
            "Temporary Password: %s\n\n" +
            "Login URL:\n" +
            "%s\n\n" +
            "Please change your password after first login.\n\n" +
            "Regards,\n" +
            "CampusOne Administration",
            name, userId, email, password, loginUrl
        );
    }

    public void sendBulkImportSummary(String adminEmail, int total, int success, int failed) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(adminEmail);
            message.setSubject("Bulk User Import Completed");
            message.setText(String.format(
                "Bulk Import Summary:\n\n" +
                "Total Records: %d\n" +
                "Successful: %d\n" +
                "Failed: %d\n\n" +
                "Regards,\n" +
                "CampusOne System",
                total, success, failed
            ));
            message.setFrom("noreply@campusone.com");
            
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send summary email: {}", e.getMessage());
        }
    }
}

