package com.exam_portal.analytics_service.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reportId;

    private Long examId;
    private Long userId;
    private Double totalMarks;
    private Double marksObtained;
    private String performanceMetrics; // e.g., grade, percentile, etc.
}
