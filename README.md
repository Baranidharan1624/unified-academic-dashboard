# CampusOne - Unified Academic Dashboard

A comprehensive full-stack Academic Management System built with Spring Boot and React.

## 🚀 Technology Stack

### Backend
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17
- **Database**: H2 (Development) / MySQL (Production)
- **Authentication**: JWT (JSON Web Tokens)
- **Build Tool**: Maven

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router 7
- **HTTP Client**: Axios
- **Styling**: CSS (Glass-morphism design)

---

## 📁 Project Structure

```
unified-academic-dashboard/
├── backend/                    # Spring Boot Application
│   ├── src/main/java/com/campusone/
│   │   ├── config/            # Security, JWT, Database configs
│   │   ├── controller/        # REST API endpoints
│   │   ├── dto/               # Data Transfer Objects
│   │   ├── exception/         # Custom exceptions
│   │   ├── model/             # JPA Entities
│   │   ├── repository/        # Spring Data JPA Repositories
│   │   ├── service/           # Business logic
│   │   └── util/              # Utilities (JWT)
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── database/          # SQL schemas & seeds
│   └── pom.xml
│
├── frontend/                   # React Application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── features/          # Feature-based pages
│   │   ├── pages/             # Role-based dashboards
│   │   ├── services/          # API clients
│   │   ├── context/           # React Context
│   │   ├── hooks/             # Custom hooks
│   │   ├── router/            # Route configuration
│   │   └── assets/            # CSS & images
│   └── package.json
│
├── database/                   # SQL files & CSV data
│   ├── schema.sql
│   ├── seed-data.sql
│   ├── student_dataset.csv
│   └── staff_dataset.csv
│
└── README.md
```

---

## 🏗️ Architecture

### Backend Architecture (Spring Boot)

| Layer | Description |
|-------|-------------|
| **Controller** | REST API endpoints handling HTTP requests |
| **Service** | Business logic and data processing |
| **Repository** | Data access layer (Spring Data JPA) |
| **Model** | JPA entities representing database tables |
| **DTO** | Data Transfer Objects for request/response |

### Frontend Architecture (React)

| Layer | Description |
|-------|-------------|
| **Router** | Navigation with protected routes based on roles |
| **Context** | Global state (Authentication) |
| **Services** | API calls with JWT interceptors |
| **Components** | Reusable UI elements |
| **Pages** | Role-specific dashboard pages |

---

## 🔐 User Roles

| Role | Permissions |
|------|-------------|
| **ADMIN** | Full system access, user management, reports |
| **FACULTY** | Course management, attendance, tasks |
| **STUDENT** | View courses, attendance, submit tasks |

---

## 📱 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Admin
- `GET /admin/users` - Get all users
- `POST /admin/users` - Create user
- `POST /admin/import/users` - Bulk import from Excel
- `GET /admin/students` - Student management
- `GET /admin/staff` - Staff management

### Courses
- `GET /api/courses` - List courses
- `POST /api/courses` - Create course
- `PUT /api/courses/{id}` - Update course
- `DELETE /api/courses/{id}` - Delete course

### Timetable
- `GET /api/timetable` - Get timetable entries
- `POST /api/timetable` - Create timetable entry

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Send notification

---

## ⚙️ Configuration

### Database Configuration
```properties
# H2 (Development - Default)
spring.datasource.url=jdbc:h2:mem:campusone
spring.datasource.username=sa
spring.datasource.password=

# MySQL (Local or Production)
spring.datasource.url=jdbc:mysql://localhost:3306/campusone
spring.datasource.username=root
spring.datasource.password=your_password
```

MySQL Workbench is the client you use to manage the database. The backend still needs a running MySQL server on `localhost:3306` or another host you configure.

### Fresh Local MySQL Setup
1. Start your local MySQL Server.
2. Open MySQL Workbench and connect to `localhost`.
3. Set `backend/.env` to your MySQL username and password.
4. Run `mvn spring-boot:run` from `backend`.

On first run, the app creates the `campusone` database if it does not exist, creates the tables from the JPA entities, and inserts the default admin user.

### Email Configuration
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password
```

### JWT Configuration
```properties
app.jwt.secret=your_secret_key
app.jwt.expiration-ms=86400000
```

---

## 🖥️ Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- Maven 3.8+

### Backend Setup

```bash
cd backend

# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend will start on `http://localhost:5173`

---

## 🔑 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@campusone.edu | admin123 |

---

## 📦 Key Features

### Admin Features
- 📊 Dashboard with analytics
- 👥 User management (Students, Staff)
- 📚 Course management
- 📅 Timetable management
- 🏫 Room management
- 📧 Bulk user import (Excel)
- 📈 Reports & analytics
- 🔔 Send notifications

### Faculty Features
- 📊 Personal dashboard
- 📝 Attendance management
- 📚 Course management
- 📅 Timetable view
- 📋 Create & manage tasks
- ✅ View task submissions

### Student Features
- 📊 Personal dashboard
- 📅 View timetable
- ✅ View & submit tasks
- 📈 View attendance
- 🔔 Notifications

---

## 📂 Database Schema

### Core Tables
- `users` - User accounts
- `courses` - Course catalog
- `enrollments` - Student enrollments
- `attendance` - Attendance records
- `timetable_entries` - Schedule entries
- `rooms` - Room management
- `tasks` - Assignments
- `task_submissions` - Student submissions
- `notifications` - System notifications

---

## 🔧 Development

### Environment Variables

**Backend** (application.properties):
```properties
SERVER_PORT=8080
SPRING_JPA_HIBERNATE_DDL_AUTO=update
APP_JWT_SECRET=your_secret
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_password
```

**Frontend**:
```properties
VITE_API_BASE_URL=http://localhost:8080
```

---

## 📄 License

This project is for educational purposes.

---

## 👨‍💻 Author

Developed as a unified academic management solution.

