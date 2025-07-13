package com.exam_portal.exam_management_service.service;

import com.exam_portal.exam_management_service.model.Result;

import java.util.Optional;

public interface ResultService {
    Optional<Result> getResultByExamAndUser(Long examId, Long userId);
}