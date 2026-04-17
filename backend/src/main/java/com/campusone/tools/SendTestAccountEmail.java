package com.campusone.tools;

import com.campusone.service.EmailService;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.ConfigurableApplicationContext;

public class SendTestAccountEmail {

    public static void main(String[] args) {
        String recipientEmail = args.length > 0 ? args[0] : "ritcv12345678@gmail.com";
        String recipientName = args.length > 1 ? args[1] : "Test User";
        String userId = args.length > 2 ? args[2] : "TEST-USER-001";
        String password = args.length > 3 ? args[3] : "Campus@123";

        ConfigurableApplicationContext context = new SpringApplicationBuilder(com.campusone.CampusOneApplication.class)
            .web(WebApplicationType.SERVLET)
            .properties("server.port=0")
            .run(args);

        try {
            EmailService emailService = context.getBean(EmailService.class);
            emailService.sendAccountCreatedEmail(recipientName, recipientEmail, userId, password);
            System.out.println("Triggered account-created email for: " + recipientEmail);
        } finally {
            context.close();
        }
    }
}