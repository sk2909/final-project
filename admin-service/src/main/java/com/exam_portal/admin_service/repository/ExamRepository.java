package com.exam_portal.admin_service.repository;

import com.exam_portal.admin_service.model.Exam;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExamRepository extends JpaRepository<Exam, Long> {
}