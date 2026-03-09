package com.campusone.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;

@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class DatabaseConnectivityProbe implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;

    @Override
    public void run(String... args) {
        Integer ping = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
        String url = safeUrl();
        log.info("DB connectivity check passed. url='{}', ping={}", url, ping);
    }

    private String safeUrl() {
        try {
            return dataSource.getConnection().getMetaData().getURL();
        } catch (Exception ex) {
            return "unknown";
        }
    }
}

