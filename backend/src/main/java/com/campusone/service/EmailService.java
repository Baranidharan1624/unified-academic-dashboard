package com.campusone.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.login.url:http://10.65.11.65:5173/login}")
    private String loginUrl;

    @Async
    public void sendAccountCreatedEmail(String name, String email, String userId, String password) {
        try {
                        MimeMessage message = mailSender.createMimeMessage();
                        MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
                        helper.setTo(email);
                        helper.setSubject("CampusOne Account Created");
                        helper.setFrom("noreply@campusone.com");
                        helper.setText(buildHtmlEmailBody(name, userId, email, password), true);

                        mailSender.send(message);
            log.info("Account creation email sent to: {}", email);
                } catch (MessagingException e) {
                        log.error("Failed to build account creation email for {}: {}", email, e.getMessage());
                } catch (Exception e) {
            log.error("Failed to send email to {}: {}", email, e.getMessage());
        }
    }

        private String buildHtmlEmailBody(String name, String userId, String email, String password) {
        return String.format(
                        """
                        <div style="margin:0;padding:0;background:#0f172a;">
                            <table width="100%%" cellpadding="0" cellspacing="0" style="background:#ffffff;">
                                <tr>
                                    <td align="center">

                                        <table width="100%%" cellpadding="0" cellspacing="0"
                                            style="max-width:600px;background:#1e293b;border-radius:14px;
                                            color:#e2e8f0;font-family:Arial, sans-serif;overflow:hidden;">

                                            <tr>
                                                <td style="padding:30px 20px;text-align:center;background:linear-gradient(90deg,#1e293b,#0f172a);">
                                                    <h2 style="margin:0;color:#38bdf8;font-size:22px;letter-spacing:0.5px;">CampusOne</h2>
                                                    <p style="margin:8px 0 0;font-size:14px;color:#cbd5f5;">Your account is ready</p>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style="padding:25px 22px 10px;">
                                                    <p style="margin:0 0 10px;font-size:15px;">Hello <strong>%s</strong>,</p>
                                                    <p style="margin:0;font-size:14px;color:#cbd5f5;">Your CampusOne account has been successfully created.</p>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style="padding:15px 22px 10px;">
                                                    <table width="100%%" cellpadding="12" cellspacing="0"
                                                        style="background:#334155;border-radius:10px;border:1px solid #475569;">
                                                        <tr>
                                                            <td width="10%%" style="color:#94a3b8;font-size:13px;">User ID</td>
                                                            <td style="font-weight:bold;font-size:14px;">%s</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="color:#94a3b8;font-size:13px;">Email</td>
                                                            <td style="word-break:break-all;font-size:14px;">%s</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="color:#94a3b8;font-size:13px;">Password</td>
                                                            <td style="font-size:14px;">%s</td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td align="center" style="padding:25px;">
                                                    <a href="%s"
                                                        style="background:#38bdf8;color:#0f172a;padding:14px 26px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:14px;display:inline-block;box-shadow:0 4px 10px rgba(56,189,248,0.3);">
                                                        Login to Account
                                                    </a>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style="text-align:center;font-size:12px;color:#64748b;padding:0 20px 25px;line-height:1.5;">
                                                    Please change your password after your first login.<br>
                                                </td>
                                            </tr>

                                        </table>

                                    </td>
                                </tr>
                            </table>
                        </div>
                        """,
                        escapeHtml(name),
                        escapeHtml(userId),
                        escapeHtml(email),
                        escapeHtml(password),
                        escapeHtml(loginUrl)
        );
    }

        private String escapeHtml(String value) {
                if (value == null) {
                        return "";
                }
                return value
                        .replace("&", "&amp;")
                        .replace("<", "&lt;")
                        .replace(">", "&gt;")
                        .replace("\"", "&quot;")
                        .replace("'", "&#39;");
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

