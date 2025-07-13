package com.exam_portal.exam_management_service.client;

import com.examportal.common.dto.ExamDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(
    name = "admin-service",
    configuration = com.exam_portal.exam_management_service.config.FeignConfig.class
)
public interface ExamClient {

    @GetMapping("/api/admin/exams/{id}")
    ExamDTO getExamById(@PathVariable("id") Long id);

    @GetMapping("/api/admin/exams")
    List<ExamDTO> getAllExams();
}