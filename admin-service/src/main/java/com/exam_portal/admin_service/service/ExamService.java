package com.exam_portal.admin_service.service;

import com.examportal.common.dto.ExamDTO;

import java.util.List;
import java.util.Optional;

public interface ExamService {
    ExamDTO createExam(ExamDTO examDTO);
    List<ExamDTO> getAllExams();
    Optional<ExamDTO> getExamById(Long id);
    Optional<ExamDTO> updateExam(Long id, ExamDTO examDTO);
    boolean deleteExam(Long id);
    Optional<ExamDTO> updateExamQuestions(Long examId, List<Long> questionIds);
}
