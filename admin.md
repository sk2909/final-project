## 1 Admin Module

### Overview
The Admin Module is responsible for all administrative operations in the system. It allows administrators to create, update, and delete exams and questions, as well as manage user roles (assigning roles such as STUDENT or EXAMINER). All endpoints are secured and accessible only to users with the `ROLE_ADMIN` authority.

### Dependencies

The Admin Module depends on the following libraries and frameworks:

- Spring Boot Starter Web (for building RESTful APIs)
- Spring Boot Starter Data JPA (for ORM and database access)
- Spring Boot Starter Security (for securing endpoints and role-based access)
- MySQL/PostgreSQL Driver (for database connectivity)
- Lombok (to reduce boilerplate code in models and services)
- Validation API (for request validation)
- Spring Boot Starter Test (for unit and integration testing)

### Main Components

- **Controller:** `AdminController`  
  Handles HTTP requests for exam, question, and user role management.
- **Service:** `AdminService`, `AdminServiceImpl`  
  Contains business logic for admin operations.
- **Repositories:** `ExamRepository`, `QuestionRepository`, `UserRepository`  
  Data access layers for exams, questions, and users.
- **Models:** `Exam`, `Question`, `User`  
  Entity classes representing the main data structures.

### Endpoints

| Method | Endpoint                              | Description                        | Access      |
|--------|---------------------------------------|------------------------------------|-------------|
| POST   | `/api/admin/exams`                    | Create a new exam                  | ADMIN only  |
| PUT    | `/api/admin/exams/{id}`               | Update an existing exam            | ADMIN only  |
| DELETE | `/api/admin/exams/{id}`               | Delete an exam                     | ADMIN only  |
| POST   | `/api/admin/questions`                | Add a new question                 | ADMIN only  |
| PUT    | `/api/admin/questions/{id}`           | Update a question                  | ADMIN only  |
| DELETE | `/api/admin/questions/{id}`           | Delete a question                  | ADMIN only  |
| PUT    | `/api/admin/users/{id}/role`          | Assign a role to a user            | ADMIN only  |
| PUT    | `/api/admin/exams/{examId}/questions` | Add questions to an existing exam  | ADMIN only  |


### Component Diagram
![Architecture Diagram](images/adminComponent.svg)
### Role Assignment Logic

- When a user registers, their role is always set to **student** (`ROLE_STUDENT`) by default.
- Only an admin can change a user's role (e.g., to **examiner** or **admin**) using the endpoint:  
  `PUT /api/admin/users/{id}/role?role=EXAMINER`
- The `AdminController` exposes this endpoint, and the service layer (`AdminService`) handles the update logic.

### Controller Logic

- **Exam Management:**  
  - Create, update, and delete exams using `ExamRepository`.
  - Assign an examiner and a set of questions to an exam.
- **Question Management:**  
  - CRUD operations on questions using `QuestionRepository`.
- **Role Assignment:**  
  - Assigns roles to users by updating the `role` field in the `User` entity.
- **Add Questions to Exam:**  
  - Allows batch addition of questions to an existing exam.

### Service Layer

- **AdminService** defines the contract for admin operations.
- **AdminServiceImpl** implements business logic for adding, updating, deleting, and retrieving exams and questions, and for assigning user roles.

### Security

- All endpoints are protected and require the user to have the `ROLE_ADMIN` authority.
- Security is enforced via Spring Security configuration in `SecurityConfig.java`.


### Data Model

- **Exam:**  
  - Fields: `examId`, `title`, `description`, `duration`, `totalMarks`, `examiner` (User), `questions` (List of Question)
- **Question:**  
  - Fields: `questionId`, `text`, `category`, `difficulty`, `correctAnswer`, etc.
- **User:**  
  - Fields: `userId`, `name`, `email`, `password`, `role`

### Example: Assign Role API

**Request:**  
`PUT /api/admin/users/5/role?role=EXAMINER`

**Response:**  
Returns the updated `User` object with the new role.

### Error Handling

- Uses `GlobalExceptionHandler` for consistent error responses.
- Throws `ResourceNotFoundException` if entities are not found.

---

**Note:**  
All business logic for the Admin Module is implemented in the backend under the `controller`, `service`, and `repository` packages as described above.


