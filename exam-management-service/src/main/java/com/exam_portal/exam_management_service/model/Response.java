package com.exam_portal.exam_management_service.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Response {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long responseId;

    private Long examId;

    private Long userId;

    private Long questionId;

    private String answer;

    private Double marksObtained;

    private boolean submitted; // New field to track if the exam is submitted
}
