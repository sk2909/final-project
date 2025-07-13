package com.exam_portal.exam_management_service.repository;

import com.exam_portal.exam_management_service.model.Result;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ResultRepository extends JpaRepository<Result, Long> {
    Optional<Result> findByExamIdAndUserId(Long examId, Long userId);
    long countByUserId(Long userId);
    java.util.List<Result> findByUserId(Long userId);
}