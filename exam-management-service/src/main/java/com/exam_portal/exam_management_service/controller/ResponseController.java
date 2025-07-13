 
package com.exam_portal.exam_management_service.controller;

import com.exam_portal.exam_management_service.model.Response;
import com.exam_portal.exam_management_service.service.ResponseService;
import com.examportal.common.dto.QuestionDTO;
import com.examportal.common.dto.ResultDTO;
import com.exam_portal.exam_management_service.model.Result;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.examportal.common.dto.ExamDTO;
import com.exam_portal.exam_management_service.client.ExamClient;
import com.examportal.common.security.JwtUtil;
import com.examportal.common.exception.ResourceNotFoundException;
import com.exam_portal.exam_management_service.client.QuestionClient;
import com.exam_portal.exam_management_service.repository.ResultRepository;
import com.exam_portal.exam_management_service.repository.ResponseRepository;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/responses")
@RequiredArgsConstructor
public class ResponseController {

    private final ResponseService responseService;
    private final ExamClient examClient;
    private final JwtUtil jwtUtil;
    private final QuestionClient questionClient;
    private final ResultRepository resultRepository;
    private final ResponseRepository responseRepository;

    
    @GetMapping("/exams")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'EXAMINER')")
    public ResponseEntity<List<ExamDTO>> getAllExams() {
        return ResponseEntity.ok(examClient.getAllExams());
    }

    @GetMapping("/exams/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'EXAMINER')")
    public ResponseEntity<ExamDTO> getExamById(@PathVariable("id") Long examId) {
        ExamDTO exam = examClient.getExamById(examId);
        return ResponseEntity.ok(exam);
    }

    @PostMapping("/save-response")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'EXAMINER')")
    public ResponseEntity<Response> saveResponse(
            @RequestBody Response response,
            @RequestHeader("Authorization") String tokenHeader
    ) {
        // Extract the token from the Authorization header
        String token = tokenHeader.startsWith("Bearer ") ? tokenHeader.substring(7) : tokenHeader;

        // Extract userId from the token
        Long userId = jwtUtil.extractUserId(token);

        if (userId == null) {
            throw new IllegalStateException("User ID could not be extracted from the token.");
        }

        // Validate examId
        ExamDTO exam = examClient.getExamById(response.getExamId());
        if (exam == null) {
            throw new ResourceNotFoundException("Exam with ID " + response.getExamId() + " not found.");
        }

        // Validate questionId
        QuestionDTO question = questionClient.getQuestionById(response.getQuestionId());
        if (question == null) {
            throw new ResourceNotFoundException("Question with ID " + response.getQuestionId() + " not found.");
        }

        // Set the userId in the response
        response.setUserId(userId);

        // Save the response
        Response savedResponse = responseService.saveResponse(response);

        return ResponseEntity.ok(savedResponse);
    }

    @PostMapping("/submit-exam/{examId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'EXAMINER')")
    public ResponseEntity<?> submitExam(
            @PathVariable Long examId,
            @RequestHeader("Authorization") String tokenHeader
    ) {
        // Extract the token from the Authorization header
        String token = tokenHeader.startsWith("Bearer ") ? tokenHeader.substring(7) : tokenHeader;

        // Extract userId from the token
        Long userId = jwtUtil.extractUserId(token);

        if (userId == null) {
            return ResponseEntity.status(400).body(java.util.Collections.singletonMap("message", "User ID could not be extracted from the token."));
        }

        // Check if the user has already submitted this exam
        Optional<Result> existingResult = resultRepository.findByExamIdAndUserId(examId, userId);
        if (existingResult.isPresent()) {
            return ResponseEntity.status(409).body(java.util.Collections.singletonMap("message", "Exam already submitted. You cannot submit again."));
        }

        // Fetch all responses for the user and exam
        List<Response> responses = responseRepository.findByExamIdAndUserId(examId, userId);

        if (responses.isEmpty()) {
            return ResponseEntity.status(400).body(java.util.Collections.singletonMap("message", "No responses found for this exam."));
        }

        // Fetch all questions for this exam
        ExamDTO exam = examClient.getExamById(examId);
        double totalMarks = exam.getTotalMarks();
        double totalMarksObtained = 0.0;
        if (exam.getQuestions() != null) {
            // Map questionId to QuestionDTO for fast lookup
            java.util.Map<Long, com.examportal.common.dto.QuestionDTO> questionMap = new java.util.HashMap<>();
            for (com.examportal.common.dto.QuestionDTO q : exam.getQuestions()) {
                questionMap.put(q.getQuestionId(), q);
            }
            // For each response, compare answer to correctAnswer and update marksObtained
            for (Response response : responses) {
                com.examportal.common.dto.QuestionDTO question = questionMap.get(response.getQuestionId());
                if (question != null) {
                    String correctAnswer = question.getCorrectAnswer();
                    if (response.getAnswer() != null && response.getAnswer().equals(correctAnswer)) {
                        response.setMarksObtained(question.getMarks() != null ? question.getMarks().doubleValue() : 0.0);
                    } else {
                        response.setMarksObtained(0.0);
                    }
                    totalMarksObtained += response.getMarksObtained();
                }
                response.setSubmitted(true);
            }
            responseRepository.saveAll(responses);
        }

        // Save the result
        Result result = new Result();
        result.setExamId(examId);
        result.setUserId(userId);
        result.setTotalMarks(totalMarks);
        result.setMarksObtained(totalMarksObtained);
        resultRepository.save(result);

        return ResponseEntity.ok(result);
    }

    @PutMapping("/save-response")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'EXAMINER')")
    public ResponseEntity<Response> updateResponse(
            @RequestBody Response response,
            @RequestHeader("Authorization") String tokenHeader
    ) {
        String token = tokenHeader.startsWith("Bearer ") ? tokenHeader.substring(7) : tokenHeader;
        Long userId = jwtUtil.extractUserId(token);
        if (userId == null) {
            throw new IllegalStateException("User ID could not be extracted from the token.");
        }
        ExamDTO exam = examClient.getExamById(response.getExamId());
        if (exam == null) {
            throw new ResourceNotFoundException("Exam with ID " + response.getExamId() + " not found.");
        }
        QuestionDTO question = questionClient.getQuestionById(response.getQuestionId());
        if (question == null) {
            throw new ResourceNotFoundException("Question with ID " + response.getQuestionId() + " not found.");
        }
        response.setUserId(userId);
        // Update the response (implement update logic in your service)
        Response updatedResponse = responseService.updateResponse(response);
        return ResponseEntity.ok(updatedResponse);
    }

    @PutMapping("/submit-exam/{examId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'EXAMINER')")
    public ResponseEntity<Result> updateSubmitExam(
            @PathVariable Long examId,
            @RequestHeader("Authorization") String tokenHeader
    ) {
        String token = tokenHeader.startsWith("Bearer ") ? tokenHeader.substring(7) : tokenHeader;
        Long userId = jwtUtil.extractUserId(token);
        if (userId == null) {
            throw new IllegalStateException("User ID could not be extracted from the token.");
        }
        Optional<Result> existingResult = resultRepository.findByExamIdAndUserId(examId, userId);
        if (existingResult.isEmpty()) {
            throw new IllegalStateException("No result found to update for this exam.");
        }
        List<Response> responses = responseRepository.findByExamIdAndUserId(examId, userId);
        if (responses.isEmpty()) {
            throw new IllegalStateException("No responses found for this exam.");
        }
        double totalMarksObtained = responses.stream()
                .mapToDouble(Response::getMarksObtained)
                .sum();
        ExamDTO exam = examClient.getExamById(examId);
        double totalMarks = exam.getTotalMarks();
        Result result = existingResult.get();
        result.setTotalMarks(totalMarks);
        result.setMarksObtained(totalMarksObtained);
        resultRepository.save(result);
        responses.forEach(response -> response.setSubmitted(true));
        responseRepository.saveAll(responses);
        return ResponseEntity.ok(result);
    }


       // Get all responses for a user and exam
    @GetMapping("/by-exam-user")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'EXAMINER')")
    public ResponseEntity<List<Response>> getResponsesByExamAndUser(
            @RequestParam Long examId,
            @RequestParam Long userId
    ) {
        List<Response> responses = responseService.getResponsesByExamAndUser(examId, userId);
        return ResponseEntity.ok(responses);
    }

    // Get result for a user and exam
    @GetMapping("/result/by-exam-user")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'EXAMINER')")
    public ResponseEntity<Result> getResultByExamAndUser(
            @RequestParam Long examId,
            @RequestParam Long userId
    ) {
        Optional<Result> result = resultRepository.findByExamIdAndUserId(examId, userId);
        return result.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Get all results for a user
    @GetMapping("/results/by-user")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'EXAMINER')")
    public ResponseEntity<List<Result>> getAllResultsByUserId(@RequestParam Long userId) {
        List<Result> results = resultRepository.findByUserId(userId);
        return ResponseEntity.ok(results);
    }
}
