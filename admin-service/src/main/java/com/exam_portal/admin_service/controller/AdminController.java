package com.exam_portal.admin_service.controller;

import com.exam_portal.admin_service.client.AdminClient;
import com.exam_portal.admin_service.client.QuestionClient;
import com.exam_portal.admin_service.service.ExamService;
import com.examportal.common.dto.ExamDTO;
import com.examportal.common.dto.QuestionDTO;
import com.examportal.common.dto.UserDTO;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminClient adminClient;
    private final QuestionClient questionClient;
    private final ExamService examService;

    // --- User Management ---

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllUsers(HttpServletRequest request) {
        return ResponseEntity.ok(adminClient.getAllUsers());
    }

    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> assignRole(@PathVariable Long id, @RequestParam String role) {
        return ResponseEntity.ok(adminClient.assignRole(id, role));
    }

    @GetMapping("/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> getUserProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(adminClient.getUserProfile(userId));
    }

    // --- Exam Management (using ExamDTO) ---

    @PostMapping("/exams")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExamDTO> createExam(@RequestBody ExamDTO examDTO) {
        return ResponseEntity.ok(examService.createExam(examDTO));
    }

    @GetMapping("/exams")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'EXAMINER')")
    public ResponseEntity<List<ExamDTO>> getAllExams() {
        return ResponseEntity.ok(examService.getAllExams());
    }

    @GetMapping("/exams/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'EXAMINER')")
    public ResponseEntity<ExamDTO> getExamById(@PathVariable Long id) {
        Optional<ExamDTO> exam = examService.getExamById(id);
        return exam.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/exams/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExamDTO> updateExam(@PathVariable Long id, @RequestBody ExamDTO examDTO) {
        Optional<ExamDTO> updated = examService.updateExam(id, examDTO);
        return updated.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/exams/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteExam(@PathVariable Long id) {
        if (examService.deleteExam(id)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/exams/{id}/questions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExamDTO> updateExamQuestions(
            @PathVariable Long id,
            @RequestBody List<Long> questionIds
    ) {
        Optional<ExamDTO> updated = examService.updateExamQuestions(id, questionIds);
        return updated.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    // --- Question Management (via QuestionClient) ---

    @PostMapping("/questions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QuestionDTO> createQuestion(@RequestBody QuestionDTO questionDTO) {
        return ResponseEntity.ok(questionClient.createQuestion(questionDTO));
    }

    @GetMapping("/questions")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'EXAMINER')")
    public ResponseEntity<List<QuestionDTO>> getAllQuestions() {
        return ResponseEntity.ok(questionClient.getAllQuestions());
    }

    @GetMapping("/questions/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'EXAMINER')")
    public ResponseEntity<QuestionDTO> getQuestionById(@PathVariable Long id) {
        return ResponseEntity.ok(questionClient.getQuestionById(id));
    }

    @PutMapping("/questions/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QuestionDTO> updateQuestion(@PathVariable Long id, @RequestBody QuestionDTO questionDTO) {
        return ResponseEntity.ok(questionClient.updateQuestion(id, questionDTO));
    }

    @DeleteMapping("/questions/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        questionClient.deleteQuestion(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/questions/import")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> importQuestions(@RequestBody List<QuestionDTO> questions) {
        questionClient.importQuestions(questions);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/questions/export")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'EXAMINER')")
    public ResponseEntity<List<QuestionDTO>> exportQuestions() {
        return ResponseEntity.ok(questionClient.exportQuestions());
    }
}
