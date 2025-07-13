package com.exam_portal.admin_service.client;

import com.examportal.common.dto.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(
    name = "user-service",
    configuration = com.exam_portal.admin_service.config.FeignConfig.class
)
public interface AdminClient {
    @GetMapping("/api/users/all")
    List<UserDTO> getAllUsers();

    @PutMapping("/api/users/{id}/role")
    UserDTO assignRole(@PathVariable("id") Long id, @RequestParam("role") String role);

    @GetMapping("/api/users/{userId}")
    UserDTO getUserProfile(@PathVariable("userId") Long userId);

    // Question-service endpoints (example, update URLs as needed)
    @GetMapping("${question.service.url:/api/questions}")
    Object getAllQuestions();

    @PostMapping("${question.service.url:/api/questions}")
    Object createQuestion(@RequestBody Object question);

    @GetMapping("${question.service.url:/api/questions}/{id}")
    Object getQuestionById(@PathVariable("id") Long id);

    @GetMapping("/api/users/email/{email}")
    UserDTO getUserByEmail(@PathVariable("email") String email);

    // Add more question-service endpoints as needed
}