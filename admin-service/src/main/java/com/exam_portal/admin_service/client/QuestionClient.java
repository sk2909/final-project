package com.exam_portal.admin_service.client;

import com.examportal.common.dto.QuestionDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(
    name = "question-service",
    configuration = com.exam_portal.admin_service.config.FeignConfig.class
)
public interface QuestionClient {
    @PostMapping("/api/questions")
    QuestionDTO createQuestion(@RequestBody QuestionDTO questionDTO);

    @GetMapping("/api/questions")
    List<QuestionDTO> getAllQuestions();

    @GetMapping("/api/questions/{id}")
    QuestionDTO getQuestionById(@PathVariable("id") Long id);

    @PutMapping("/api/questions/{id}")
    QuestionDTO updateQuestion(@PathVariable("id") Long id, @RequestBody QuestionDTO questionDTO);

    @DeleteMapping("/api/questions/{id}")
    void deleteQuestion(@PathVariable("id") Long id);

    @PostMapping("/api/questions/import")
    void importQuestions(@RequestBody List<QuestionDTO> questions);

    @GetMapping("/api/questions/export")
    List<QuestionDTO> exportQuestions();

    @PostMapping("/api/questions/batch")
    List<QuestionDTO> getQuestionsByIds(@RequestBody List<Long> ids);
}