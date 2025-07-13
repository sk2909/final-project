package com.exam_portal.question_service.repository;

import com.exam_portal.question_service.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestionRepository extends JpaRepository<Question, Long> {
}