package com.exam_portal.user_service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.exam_portal.user_service.repository.UserRepository;

import jakarta.annotation.PostConstruct;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.exam_portal.user_service.model.User;
import com.exam_portal.user_service.repository.UserRepository;

@SpringBootApplication(scanBasePackages = {
    "com.exam_portal.user_service",
    "com.examportal.common"
})
public class UserServiceApplication {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder   passwordEncoder;
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
        System.out.println("User service is running");
    }

    @PostConstruct
    public void initAdminUser() {
        String adminEmail = "admin@gmail.com";
        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            User admin = new User();
            admin.setUsername("Admin");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole("ADMIN");
            userRepository.save(admin);
            System.out.println("Default admin user created: " + adminEmail);
        }
    }
}
