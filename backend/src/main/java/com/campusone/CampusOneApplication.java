package com.campusone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class CampusOneApplication {

    public static void main(String[] args) {
        SpringApplication.run(CampusOneApplication.class, args);
    }
}
