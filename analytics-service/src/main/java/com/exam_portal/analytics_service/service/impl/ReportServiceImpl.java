package com.exam_portal.analytics_service.service.impl;

import com.exam_portal.analytics_service.client.ResultClient;
import com.exam_portal.analytics_service.model.Report;
import com.exam_portal.analytics_service.repository.ReportRepository;
import com.exam_portal.analytics_service.service.ReportService;
import com.examportal.common.dto.ResultDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final ResultClient resultClient;
    private final ReportRepository reportRepository;

    @Override
    public List<Report> getReports(Long examId, Long userId) {
        List<ResultDTO> resultDTOs = resultClient.getResults(examId, userId);
        return resultDTOs.stream()
                .map(this::saveReport) // Save and return the report with grade
                .toList();
    }

    @Override
    public Report saveReport(ResultDTO dto) {
        String grade = calculateGrade(dto.getMarksObtained(), dto.getTotalMarks());
        Report report = new Report(
                null,
                dto.getExamId(),
                dto.getUserId(),
                dto.getTotalMarks(),
                dto.getMarksObtained(),
                grade
        );
        return reportRepository.save(report);
    }

    private String calculateGrade(Double marksObtained, Double totalMarks) {
        if (marksObtained == null || totalMarks == null || totalMarks == 0) return "N/A";
        double percent = (marksObtained / totalMarks) * 100;
        if (percent >= 90) return "0";
        if (percent >= 80) return "A+";
        if (percent >= 70) return "A";
        if (percent >= 60) return "B+";
        if (percent >= 50) return "B";
        if (percent >= 40) return "C";
        return "F";
    }
}
