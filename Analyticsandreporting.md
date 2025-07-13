# Online Exam Portal - Analytics and Reporting Module Documentation

## Table of Contents
- [Project Overview](#project-overview)
- [Architecture](#architecture)
  - [Backend](#backend)
  - [Layers](#layers)
- [Dependencies](#dependencies)
- [Database Tables](#database-tables)
  - [`analytics`](#analytics)
  - [`reports`](#reports)
- [REST API Endpoints](#rest-api-endpoints)
- [Security Configuration](#security-configuration)
- [Exception Handling](#exception-handling)
- [How to Run](#how-to-run)
- [Future Enhancements](#future-enhancements)
- [Contributors](#contributors)

---

## Project Overview

The **Analytics and Reporting Module** is designed to provide insights into exam performance, user activity, and overall system usage. It generates detailed reports and analytics based on data collected from other modules, such as exams and user interactions. This module is built using **Spring Boot** and integrates with a **MySQL database** for persistent storage.

---

## Architecture

### Backend
- **Framework**: Spring Boot
- **Database**: MySQL
- **Security**: Spring Security (currently configured to allow all requests without authentication)
- **REST API**: Exposes endpoints for generating and retrieving analytics and reports.

### Layers

1. **Controller Layer**:
   - Handles HTTP requests and responses.
   - Maps endpoints to service methods.
   - Example: `AnalyticsController.java`.

2. **Service Layer**:
   - Contains business logic for generating analytics and reports.
   - Example: `AnalyticsService.java` and `AnalyticsServiceImpl.java`.

3. **Repository Layer**:
   - Interacts with the database using JPA.
   - Example: `AnalyticsRepository.java`.

4. **Model Layer**:
   - Represents the database entities.
   - Example: `Analytics.java`.

5. **Exception Handling**:
   - Custom exceptions and global exception handling.
   - Example: `ResourceNotFoundException.java` and `GlobalExceptionHandler.java`.

---

## Dependencies

### Required Dependencies
- **Spring Boot Starter Web**: For building REST APIs.
- **Spring Boot Starter Data JPA**: For database interaction using JPA.
- **MySQL Connector**: For connecting to the MySQL database.
- **Spring Boot Starter Security**: For security configurations.
- **Swagger (Springfox)**: For API documentation.
- **Jakarta Persistence API**: For JPA annotations.

---

## Database Tables

### `analytics`
Stores analytics data.

| Column Name      | Data Type       | Description                     |
|------------------|-----------------|---------------------------------|
| `analytics_id`   | BIGINT (PK)     | Unique identifier for analytics data. |
| `exam_id`        | BIGINT (FK)     | Foreign key referencing `exams`. |
| `user_id`        | BIGINT (FK)     | Foreign key referencing `users`. |
| `score`          | INT             | User's score in the exam.       |
| `time_taken`     | INT             | Time taken to complete the exam (in minutes). |

### `reports`
Stores generated reports.

| Column Name      | Data Type       | Description                     |
|------------------|-----------------|---------------------------------|
| `report_id`      | BIGINT (PK)     | Unique identifier for a report. |
| `report_type`    | VARCHAR         | Type of report (e.g., Exam Summary, User Performance). |
| `generated_at`   | TIMESTAMP       | Timestamp when the report was generated. |
| `data`           | TEXT            | JSON data containing the report details. |

---

## REST API Endpoints

### Analytics Management
1. **Generate Analytics**
   - **Endpoint**: `POST /api/analytics/generate`
   - **Description**: Generates analytics data for a specific exam.
   - **Request Body**:
     ```json
     {
       "examId": 1,
       "userId": 101,
       "score": 85,
       "timeTaken": 45
     }
     ```

2. **Get Analytics by Exam**
   - **Endpoint**: `GET /api/analytics/exam/{examId}`
   - **Description**: Retrieves analytics data for a specific exam.

3. **Get Analytics by User**
   - **Endpoint**: `GET /api/analytics/user/{userId}`
   - **Description**: Retrieves analytics data for a specific user.

### Reporting Management
1. **Generate Report**
   - **Endpoint**: `POST /api/reports/generate`
   - **Description**: Generates a report based on analytics data.
   - **Request Body**:
     ```json
     {
       "reportType": "Exam Summary",
       "examId": 1
     }
     ```

2. **Get Report by ID**
   - **Endpoint**: `GET /api/reports/{reportId}`
   - **Description**: Retrieves a report by its ID.

3. **Get All Reports**
   - **Endpoint**: `GET /api/reports`
   - **Description**: Retrieves all generated reports.

---

## Security Configuration

The current security configuration (`SecurityConfig.java`) disables CSRF and permits all requests without authentication. This is suitable for development but should be updated for production.

---

## Exception Handling

### Custom Exception
- **ResourceNotFoundException**: Thrown when a requested resource (e.g., analytics data or report) is not found.

### Global Exception Handler
- Handles exceptions globally and returns appropriate HTTP status codes.

---

## How to Run

1. **Database Setup**:
   - Create a MySQL database named `analytics_db`.
   - Update the credentials in `application.properties`.

2. **Run the Application**:
   - Use the command: `mvn spring-boot:run`.

3. **Access the Application**:
   - The backend runs on port `8095` by default.

---

## Future Enhancements

1. **Authentication and Authorization**:
   - Implement JWT-based authentication for secure access.

2. **Advanced Analytics**:
   - Add support for predictive analytics and machine learning models.

3. **Customizable Reports**:
   - Allow users to customize report formats and filters.

4. **Frontend Integration**:
   - Develop a frontend to interact with the backend APIs.

---

## Contributors

- **Developer**: Satvik Hegde
- **Date**: June 30, 2025