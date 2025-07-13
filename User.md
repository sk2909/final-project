# User Module - Online Exam Portal

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
  - [Spring Boot Backend](#1-spring-boot-backend)
  - [Layered Structure](#2-layered-structure)
- [Main Components](#main-components)
  - [Controllers](#controllers)
  - [Services](#services)
  - [Repositories](#repositories)
  - [Security](#security)
  - [Exception Handling](#exception-handling)
- [Database Tables](#database-tables)
  - [User Table](#user-table)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [User Profile](#user-profile)
- [Security](#security-1)
- [Exception Handling](#exception-handling-1)
- [Configuration](#configuration)
- [How to Run](#how-to-run)
- [Notes](#notes)

---

## Project Overview

This module is part of the **Online Exam Portal** system, responsible for user management and authentication. It provides REST APIs for user registration, login, profile management, and JWT-based authentication. The system supports different user roles such as **Admin**, **Student**, and **Examiner**.

---

## Architecture

### Component module diagram

![Component Diagram](images/user_component.drawio.svg)

### 1. **Spring Boot Backend**
- **Framework:** Spring Boot
- **Database:** MySQL
- **ORM:** Spring Data JPA (Hibernate)
- **Security:** Spring Security with JWT (JSON Web Token)
- **Password Encryption:** BCrypt

### 2. **Layered Structure**
- **Controller Layer:** Handles HTTP requests and responses.
- **Service Layer:** Contains business logic.
- **Repository Layer:** Handles database operations.
- **Security Layer:** Manages authentication, authorization, and token management.
- **Exception Handling:** Centralized via `@ControllerAdvice`.

---

## Main Components

### **Controllers**
- `UserController`: Exposes endpoints for user registration, login, logout, profile view/update, and token refresh.

### **Services**
- `UserService`: Interface for user-related operations.
- `UserServiceImpl`: Implements user registration, authentication, profile management.

### **Repositories**
- `UserRepository`: JPA repository for `User` entity.

### **Security**
- `JwtUtil`: Generates and validates JWT tokens.
- `JwtRequestFilter`: Intercepts requests to validate JWT tokens.
- `TokenBlacklistService`: Manages blacklisted (logged out) tokens.
- `SecurityConfig`: Configures security rules and filters.

### **Exception Handling**
- `ResourceNotFoundException`: Custom exception for missing resources.
- `GlobalExceptionHandler`: Handles exceptions globally.

---

## Database Tables

### **User Table**

| Column   | Type         | Constraints         | Description                |
|----------|--------------|---------------------|----------------------------|
| userId   | BIGINT       | PRIMARY KEY, AUTO   | Unique user ID             |
| name     | VARCHAR      | NOT NULL            | User's full name           |
| email    | VARCHAR      | NOT NULL, UNIQUE    | User's email address       |
| password | VARCHAR      | NOT NULL            | Encrypted password         |
| role     | VARCHAR      |                     | User role (Admin/Student/Examiner) |

**Entity Mapping:**  
See `User.java` for JPA annotations.

---

## API Endpoints

### **Authentication**
- `POST /api/users/register`  
  Register a new user.  
  **Body:** `{ "name": "...", "email": "...", "password": "...", "role": "..." }`

- `POST /api/users/login`  
  Authenticate user and receive JWT token.  
  **Body:** `{ "email": "...", "password": "..." }`  
  **Response:** `Bearer <token>`

- `POST /api/users/logout`  
  Invalidate the current JWT token.  
  **Header:** `Authorization: Bearer <token>`

- `POST /api/users/refresh-token`  
  Refresh JWT token before it expires.  
  **Header:** `Authorization: Bearer <token>`

### **User Profile**
- `GET /api/users/{userId}`  
  Get user profile (Admin or self).

- `PUT /api/users/{userId}`  
  Update user profile.

---

## Security

- **JWT Authentication:**  
  All endpoints except `/api/users/register` and `/api/users/login` require a valid JWT token.
- **Token Blacklisting:**  
  Logged out tokens are blacklisted and cannot be reused.
- **Password Storage:**  
  Passwords are stored encrypted using BCrypt.

---

## Exception Handling

- **Resource Not Found:**  
  Returns `404 Not Found` with a message.
- **Global Errors:**  
  Returns `500 Internal Server Error` with a generic message.

---

## Configuration

- **Database:**  
  Configured in `application.properties`:
  ```
  spring.datasource.url=jdbc:mysql://localhost:3306/exam_portal
  spring.datasource.username=root
  spring.datasource.password=root
  ```

- **JWT Secret:**  
  Set in `application.properties` as `jwt.secret`.

---

## How to Run

1. Configure MySQL and update credentials in `application.properties`.
2. Build and run the Spring Boot application.
3. Use tools like Postman to interact with the API endpoints.

---

## Notes

- Only `/api/users/register` and `/api/users/login` are public.
- All other endpoints require a valid JWT in the `Authorization` header.
- Admin endpoints (e.g., `/api/admin/**`) require `ADMIN` role.

---