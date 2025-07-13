package com.examportal.common.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExamDTO {
    private Long examId;
    private String title;
    private String description;
    private int duration;
    private int totalMarks;
    private List<Long> questionIds; // List of question IDs
    private List<QuestionDTO> questions;
}