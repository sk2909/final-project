package com.exam_portal.analytics_service.service;

import com.exam_portal.analytics_service.model.Report;
import com.examportal.common.dto.ResultDTO;
import java.util.List;

public interface ReportService {
    List<Report> getReports(Long examId, Long userId);
    Report saveReport(ResultDTO resultDTO);
}