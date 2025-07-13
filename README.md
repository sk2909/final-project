# Online Exam Portal

## 📚 Table of Contents
- [Overview](#📝-overview)
- [Features](#✨-features)
- [Technologies Used](#💻-technologies-used)
- [Architecture Diagram](#🏗️-microservice-architecture-diagram)
- [Module Overview](#📦-module-overview)
  - [Admin Module](#🔧-admin-module)
  - [User Module](#👤-user-module)
  - [Exam Management Module](#📝-exam-management-module)
  - [Question Bank Module](#❓-question-bank-module)
  - [Analytics and Reporting Module](#📊-analytics-and-reporting-module)
- [Setup Instructions](#⚙️-setup-instructions)
- [Start the Services](#🚀-start-the-services)
- [Testing](#✅-testing)
- [Advanced Features](#🌟-advanced-features)
- [Deployment](#📦-deployment)
- [Contributers](#🤝-contributers)


---

## 📝 Overview
The **Online Exam Portal** is a web-based application designed to streamline the creation, management, and evaluation of online assessments. It supports multiple modules, including user management, exam creation, question banks, and analytics.

---

## ✨ Features
- **Admin Module**: Manage exams, questions, and user roles.
- **User Module**: User registration, login, and profile management.
- **Exam Management Module**: Attempt exams, view results, and provide feedback.
- **Question Bank Module**: Manage categorized questions.
- **Analytics and Reporting Module**: Generate performance reports and insights.

---

## 💻 Technologies Used
- **Backend**: Java (Spring Boot)
- **Frontend**: Angular or React (optional)
- **Database**: MySQL/PostgreSQL/SQL Server
- **Microservices**: Spring Cloud (Eureka, Gateway, Config Server)
- **API Documentation**: Swagger

---

## 🏗️ Microservice Architecture Diagram
![Architecture Diagram](images/arch.drawio.svg)

---

## 📦 Module Overview

### 🔧 Admin Module
- Create and manage exams, questions, and user roles.
- [Detailed Documentation](admin.md)

### 👤 User Module
- User registration, login, and profile management.
- [Detailed Documentation](User.md)

### 📝 Exam Management Module
- Attempt exams, view results, and provide feedback.
- [Detailed Documentation](Exam.md)

### ❓ Question Bank Module
- Manage a repository of categorized questions.
- [Detailed Documentation](Question.md)

### 📊 Analytics and Reporting Module
- Generate performance reports and insights.
- [Detailed Documentation](Analytics.md)

---

## ⚙️ Setup Instructions

### Prerequisites
Ensure the following are installed:
- **Java Development Kit (JDK)**: Version 17 or higher.
- **Apache Maven**: For building the project.
- **MySQL Database**: For persistent storage.
- **Git**: To clone the repository.

### Database Setup
1. Install and start MySQL.
2. Create the required databases for the microservices:
   ```sql
   CREATE DATABASE question_service;
   CREATE DATABASE admin_service;
   CREATE DATABASE user_service;
   CREATE DATABASE response_service;
   CREATE DATABASE report_service;
3. Update the database credentials in the respective application.yml files for each microservice.

#### Build the Project

1. Navigate to the project root directory:
```
cd online-exam-portal-Microservices
 ```
2. Run the following Maven command to build all modules:
```
mvn clean install
```
---
##  🚀 Start the Services

Discovery Service
1. Navigate to the discovery-server directory:
```
cd discovery-server
```
2. Run the service using Maven:
```
mvn spring-boot:run
```
3. Access the Eureka Dashboard at:
```
http://localhost:8761
```

Config Server
1. Navigate to the config-server directory:
```
cd config-server
```
2. Run the service using Maven:
```
mvn spring-boot:run
```
Gateway Service
1. Navigate to the gateway-service directory:
```
cd gateway-service
```
2. Run the service using Maven:
```
mvn spring-boot:run
```
3. Access the gateway at:
```
http://localhost:8080
```
#### Microservices

Start each microservice (e.g., question-service, admin-service, etc.) by navigating to their respective directories and running:
```
mvn spring-boot:run
```
---
## ✅ Testing
1. Run the test cases using Maven:
```
mvn test
```
2. Verify the REST API endpoints using tools like Postman or Swagger UI:
```
http://localhost:<port>/swagger-ui.html
```
---
##  🌟 Advanced Features

- Bulk Import/Export: Import/export questions and reports in bulk.
- Role-Based Access Control: Assign roles to users for restricted access.
- Performance Analytics: Generate detailed reports for exams and users.
----
## 📦 Deployment

- Use Docker for containerization.
- Deploy microservices to Kubernetes or cloud platforms like AWS, Azure, or Google Cloud.
---
##  🤝 Contributers

- Satvik Hegde
- Tarun K Y
- Sanidhya H R
- Muhammed Sultan

