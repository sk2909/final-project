package com.examportal.common.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResultDTO {
    private Long resultId;       // Unique ID for the result
    private Long examId;         // ID of the exam
    private Long userId;         // ID of the user
    private Double totalMarks;   // Total marks for the exam
    private Double marksObtained; // Marks obtained by the user
    private String feedback;     // Optional feedback from the user
}