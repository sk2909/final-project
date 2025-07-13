package com.exam_portal.exam_management_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication(scanBasePackages = {
    "com.exam_portal.exam_management_service",
    "com.examportal.common"
})
@EnableFeignClients
public class ExamManagementServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ExamManagementServiceApplication.class, args);
		System.out.println("Exam Management Service is running");
	}

}
