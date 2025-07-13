package com.exam_portal.exam_management_service.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Result {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long resultId;

    private Long examId;

    private Long userId;

    private Double totalMarks;

    private Double marksObtained;

    private String feedback; // Optional feedback from the user
}