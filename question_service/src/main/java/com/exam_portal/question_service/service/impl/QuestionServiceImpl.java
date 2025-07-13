package com.exam_portal.question_service.service.impl;

import com.exam_portal.question_service.model.Question;
import com.exam_portal.question_service.repository.QuestionRepository;
import com.exam_portal.question_service.service.QuestionService;
import com.examportal.common.dto.QuestionDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuestionServiceImpl implements QuestionService {
    @Autowired
    private QuestionRepository questionRepository;

    private QuestionDTO mapToDTO(Question question) {
        return new QuestionDTO(
            question.getQuestionId(),
            question.getText(),
            question.getCategory(),
            question.getDifficulty(),
            question.getCorrectAnswer(),
            question.getMarks(),
            question.getOptions() // <-- Add this
        );
    }

    private Question mapToEntity(QuestionDTO dto) {
        return new Question(
            dto.getQuestionId(),
            dto.getText(),
            dto.getCategory(),
            dto.getDifficulty(),
            dto.getCorrectAnswer(),
            dto.getMarks(),
            dto.getOptions() // <-- Add this
        );
    }

    @Override
    public QuestionDTO createQuestion(QuestionDTO questionDTO) {
        Question question = mapToEntity(questionDTO);
        question.setQuestionId(null); // Ensure ID is not set
        return mapToDTO(questionRepository.save(question));
    }

    @Override
    public QuestionDTO updateQuestion(Long id, QuestionDTO questionDTO) {
        return questionRepository.findById(id)
            .map(existing -> {
                existing.setText(questionDTO.getText());
                existing.setCategory(questionDTO.getCategory());
                existing.setDifficulty(questionDTO.getDifficulty());
                existing.setCorrectAnswer(questionDTO.getCorrectAnswer());
                existing.setMarks(questionDTO.getMarks());
                existing.setOptions(questionDTO.getOptions()); // <-- Add this line
                return mapToDTO(questionRepository.save(existing));
            })
            .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));
    }

    @Override
    public void deleteQuestion(Long id) {
        if (!questionRepository.existsById(id)) {
            throw new RuntimeException("Question not found with id: " + id);
        }
        questionRepository.deleteById(id);
    }

    @Override
    public QuestionDTO getQuestionById(Long id) {
        return questionRepository.findById(id)
            .map(this::mapToDTO)
            .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));
    }

    @Override
    public List<QuestionDTO> getAllQuestions() {
        return questionRepository.findAll().stream().map(this::mapToDTO).toList();
    }

    @Override
    public void importQuestions(List<QuestionDTO> questions) {
        List<Question> entities = questions.stream().map(this::mapToEntity).toList();
        questionRepository.saveAll(entities);
    }

    @Override
    public List<QuestionDTO> exportQuestions() {
        return questionRepository.findAll().stream().map(this::mapToDTO).toList();
    }

    @Override
    public List<QuestionDTO> getQuestionsByIds(List<Long> ids) {
        return questionRepository.findAllById(ids).stream().map(this::mapToDTO).toList();
    }
}