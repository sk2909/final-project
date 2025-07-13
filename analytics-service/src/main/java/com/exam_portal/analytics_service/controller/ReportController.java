package com.exam_portal.analytics_service.controller;

import com.exam_portal.analytics_service.client.ResultClient;
import com.exam_portal.analytics_service.model.Report;
import com.exam_portal.analytics_service.service.ReportService;
import com.examportal.common.dto.ResultDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/analytics/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ResultClient resultClient;
    private final ReportService reportService;

    @GetMapping
    public List<Report> getReports(@RequestParam(required = false) Long examId,
                                   @RequestParam(required = false) Long userId) {
        return reportService.getReports(examId, userId);
    }
    @PostMapping("/save")
    public Report saveReport(@RequestBody ResultDTO resultDTO) {
        return reportService.saveReport(resultDTO);
    }
}
