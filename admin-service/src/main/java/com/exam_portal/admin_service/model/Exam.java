package com.exam_portal.admin_service.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "exams")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Exam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long examId;

    private String title;
    private String description;
    private int duration; // in minutes
    private int totalMarks;

    @ElementCollection
    private List<Long> questionIds; // List of question IDs (foreign keys)
}