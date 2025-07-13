package com.exam_portal.exam_management_service.client;

import com.examportal.common.dto.QuestionDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(
    name = "question-service",
    configuration = com.exam_portal.exam_management_service.config.FeignConfig.class
)
public interface QuestionClient {

    @GetMapping("/api/questions")
    List<QuestionDTO> getAllQuestions();

    @GetMapping("/api/questions/{id}")
    QuestionDTO getQuestionById(@PathVariable("id") Long id);

}