package com.exam_portal.question_service.service;

import com.examportal.common.dto.QuestionDTO;

import java.util.List;

public interface QuestionService {
    QuestionDTO createQuestion(QuestionDTO questionDTO);
    QuestionDTO updateQuestion(Long id, QuestionDTO questionDTO);
    void deleteQuestion(Long id);
    QuestionDTO getQuestionById(Long id);
    List<QuestionDTO> getAllQuestions();
    void importQuestions(List<QuestionDTO> questions);
    List<QuestionDTO> exportQuestions();
    List<QuestionDTO> getQuestionsByIds(List<Long> ids);
}