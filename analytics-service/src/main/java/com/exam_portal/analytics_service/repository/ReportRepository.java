package com.exam_portal.analytics_service.repository;

import com.exam_portal.analytics_service.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByExamId(Long examId);
    List<Report> findByUserId(Long userId);
    List<Report> findByExamIdAndUserId(Long examId, Long userId);
}
