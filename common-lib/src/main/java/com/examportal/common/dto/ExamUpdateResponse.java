package com.examportal.common.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ExamUpdateResponse {
    private ExamDTO exam;
    private String warning;
}