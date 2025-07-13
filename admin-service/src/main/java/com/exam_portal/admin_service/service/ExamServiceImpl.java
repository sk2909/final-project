package com.exam_portal.admin_service.service;

import com.exam_portal.admin_service.model.Exam;
import com.exam_portal.admin_service.repository.ExamRepository;
import com.exam_portal.admin_service.client.AdminClient;
import com.exam_portal.admin_service.client.QuestionClient;
import com.examportal.common.dto.ExamDTO;
import com.examportal.common.dto.QuestionDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.examportal.common.exception.ResourceNotFoundException;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ExamServiceImpl implements ExamService {

    private final ExamRepository examRepository;
    private final AdminClient adminClient; // AdminClient for validating admin users
    private final QuestionClient questionClient;

    @Override
    public ExamDTO createExam(ExamDTO examDTO) {
        // Defensive: treat null as empty list
        List<Long> questionIds = examDTO.getQuestionIds();
        if (questionIds == null) {
            questionIds = List.of();
            examDTO.setQuestionIds(questionIds);
        }
        questionIds.forEach(questionId -> {
            if (!isValidQuestionId(questionId)) {
                throw new ResourceNotFoundException("Invalid question ID: " + questionId);
            }
        });

        // REMOVE createdBy validation
        // if (adminClient.getUserByEmail(examDTO.getCreatedBy()) == null) {
        //     throw new ResourceNotFoundException("Invalid admin email: " + examDTO.getCreatedBy());
        // }

        // Save exam
        Exam exam = new Exam();
        exam.setTitle(examDTO.getTitle());
        exam.setDescription(examDTO.getDescription());
        exam.setDuration(examDTO.getDuration());
        exam.setTotalMarks(examDTO.getTotalMarks());
        exam.setQuestionIds(examDTO.getQuestionIds());
        exam = examRepository.save(exam);

        return mapToDTO(exam);
    }

    private boolean isValidQuestionId(Long questionId) {
        // Mock validation logic
        return questionId != null && questionId > 0;
    }

    @Override
    public List<ExamDTO> getAllExams() {
        return examRepository.findAll().stream().map(this::mapToDTO).toList();
    }

    @Override
    public Optional<ExamDTO> getExamById(Long id) {
        return examRepository.findById(id).map(this::mapToDTO);
    }

    @Override
    public Optional<ExamDTO> updateExam(Long id, ExamDTO examDTO) {
        return examRepository.findById(id).map(exam -> {
            exam.setTitle(examDTO.getTitle());
            exam.setDescription(examDTO.getDescription());
            exam.setDuration(examDTO.getDuration());
            exam.setTotalMarks(examDTO.getTotalMarks());
            exam.setQuestionIds(examDTO.getQuestionIds());
            return mapToDTO(examRepository.save(exam));
        });
    }

    @Override
    public boolean deleteExam(Long id) {
        return examRepository.findById(id).map(exam -> {
            examRepository.delete(exam);
            return true;
        }).orElse(false);
    }

    @Override
    public Optional<ExamDTO> updateExamQuestions(Long examId, List<Long> questionIds) {
        return examRepository.findById(examId).map(exam -> {
            exam.setQuestionIds(questionIds);
            return mapToDTO(examRepository.save(exam));
        });
    }

    private ExamDTO mapToDTO(Exam exam) {
        List<QuestionDTO> questions = null;
        if (exam.getQuestionIds() != null && !exam.getQuestionIds().isEmpty()) {
            questions = questionClient.getQuestionsByIds(exam.getQuestionIds());
        }
        return new ExamDTO(
                exam.getExamId(),
                exam.getTitle(),
                exam.getDescription(),
                exam.getDuration(),
                exam.getTotalMarks(),
                exam.getQuestionIds(),
                questions
        );
    }
}
