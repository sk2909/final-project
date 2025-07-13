# Exam Module Documentation

## Table of Contents
- [Project Overview](#project-overview)
- [Architecture](#architecture)
  - [Architectural Style](#architectural-style)
  - [Component Interaction](#component-interaction)
- [Dependencies](#dependencies)
- [Database Tables](#database-tables)
  - [ExamAttempts Table](#examattempts-table)
  - [ExamAnswers Table](#examanswers-table)
- [Key Classes](#key-classes)
  - [ExamAttempt](#examattempt)
  - [ExamAttemptRepository](#examattemptrepository)
  - [ExamAttemptController](#examattemptcontroller)
  - [ExamAttemptService](#examattemptservice)
  - [ExamAttemptServiceImpl](#examattemptserviceimpl)
  - [ResourceNotFoundException](#resourcenotfoundexception)
  - [GlobalExceptionHandler](#globalexceptionhandler)
- [REST API Endpoints](#rest-api-endpoints)
  - [Submit Exam Answers](#submit-exam-answers)
  - [Get Exam Report](#get-exam-report)
- [Configuration](#configuration)
  - [Application Properties](#application-properties)

## Project Overview
The Exam Module is part of the Online Exam Portal, designed to facilitate the creation, management, and evaluation of online exams. It provides functionalities for users to attempt exams, submit answers, and view reports.

## Architecture

### Component module diagram

![Component Diagram](images/image.svg)
 

### Architectural Style
- **Backend**: REST API-based architecture using Spring Boot
- **Database**: Relational Database (MySQL)

### Component Interaction
- The backend exposes REST APIs for managing exam attempts and reports.
- The database stores exam attempts, answers, and scores.

## Dependencies
- **Spring Boot Starter Web**: For building REST APIs.
- **Spring Boot Starter Data JPA**: For database interaction using JPA.
- **Spring Boot Starter Security**: For securing the application (e.g., JWT authentication).
- **MySQL Connector**: For connecting to the MySQL database.
- **Hibernate**: For ORM (Object-Relational Mapping) functionality.
- **Spring Boot Starter Validation**: For validating user inputs.
- **Spring Boot Starter Test**: For testing the application.
- **Jakarta Persistence API**: For entity mapping and persistence.
- **JWT Library**: For handling JSON Web Tokens (authentication).
- **Spring Boot Starter Actuator**: For monitoring and managing the application.

## Database Tables
### ExamAttempts Table
- **Primary Key**: `id`
- **Columns**:
  - `id`: Unique identifier for the exam attempt
  - `user_id`: Foreign key linking to the User table
  - `exam_id`: Foreign key linking to the Exam table
  - `answers`: Map of question IDs to selected answer indices
  - `score`: Total score for the exam attempt

### ExamAnswers Table
- **Primary Key**: Composite key (`attempt_id`, `question_id`)
- **Columns**:
  - `attempt_id`: Foreign key linking to the ExamAttempts table
  - `question_id`: Foreign key linking to the Question table
  - `answer`: Selected answer index

## Key Classes
### [`ExamAttempt`](backend/src/main/java/com/examportal/model/ExamAttempt.java)
Represents an attempt made by a user for an exam.

### [`ExamAttemptRepository`](backend/src/main/java/com/examportal/repository/ExamAttemptRepository.java)
Handles database operations for exam attempts.

### [`ExamAttemptController`](backend/src/main/java/com/examportal/controller/ExamAttemptController.java)
Exposes REST APIs for submitting answers and retrieving reports.

### [`ExamAttemptService`](backend/src/main/java/com/examportal/service/ExamAttemptService.java)
Defines the business logic for handling exam attempts.

### [`ExamAttemptServiceImpl`](backend/src/main/java/com/examportal/service/Impl/ExamAttemptServiceImpl.java)
Implements the business logic for exam attempts.

### [`ResourceNotFoundException`](backend/src/main/java/com/examportal/exception/ResourceNotFoundException.java)
Custom exception for handling resource not found scenarios.

### [`GlobalExceptionHandler`](backend/src/main/java/com/examportal/exception/GlobalExceptionHandler.java)
Handles exceptions globally across the application.

## REST API Endpoints
### Submit Exam Answers
- **Endpoint**: `POST /api/exams/{examId}/submit`
- **Description**: Submit answers for an exam.
- **Request Parameters**:
  - `examId`: ID of the exam
  - `userId`: ID of the user
  - `answers`: Map of question IDs to selected answer indices
- **Response**:
  - `score`: Total score
  - `total`: Total number of questions

### Get Exam Report
- **Endpoint**: `GET /api/exams/{examId}/report/{userId}`
- **Description**: Retrieve the report for a user's exam attempt.
- **Request Parameters**:
  - `examId`: ID of the exam
  - `userId`: ID of the user
- **Response**:
  - Exam attempt details including score and answers.

## Configuration
### Application Properties
Located in [application.properties](backend/src/main/resources/application.properties):
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/exam_portal_db
spring.datasource.username=root
spring.datasource.password=root
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

jwt.secret=S2x3y2EXoofdtjzwzPRUgH3RDlse7lotS2x3y2EXoofdtjzwzPRUgH3RDlse7lot
```