package com.examportal.common.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuestionDTO {
    private Long questionId;
    private String text;
    private String category;
    private String difficulty;
    private String correctAnswer;
    private Integer marks;
    private List<String> options; // <-- Add this line
}
