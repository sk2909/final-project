package com.exam_portal.exam_management_service.service.impl;

import com.exam_portal.exam_management_service.model.Result;
import com.exam_portal.exam_management_service.repository.ResultRepository;
import com.exam_portal.exam_management_service.service.ResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ResultServiceImpl implements ResultService {

    private final ResultRepository resultRepository;

    @Override
    public Optional<Result> getResultByExamAndUser(Long examId, Long userId) {
        return resultRepository.findByExamIdAndUserId(examId, userId);
    }
}