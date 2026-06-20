# ERP System

A role-based **Enterprise Resource Planning (ERP)** application for managing company operations — users, departments, employees, attendance, leave, payroll, payslips, and performance reviews.

This repository contains the **Spring Boot backend**. The React website lives in the sibling folder: `../erp-frontend`.

---

## Problem Statement

Companies need one place to manage day-to-day operations instead of using separate spreadsheets and tools.

| Challenge | How this project helps |
|-----------|------------------------|
| Different teams need different access | Each role (Admin, HR, Finance, Employee) sees only their own portal |
| Employee records are scattered | HR manages employees in one system |
| Attendance and leave are hard to track | Employees mark attendance; HR approves leave |
| Payroll is manual and error-prone | Finance generates and processes salaries and payslips |
| No central user control | Admin creates users, assigns roles, and manages departments |

---

## System Overview

```
┌─────────────────────┐         ┌─────────────────────┐         ┌──────────────┐
│   React Frontend    │  HTTP   │  Spring Boot API    │   SQL   │    MySQL     │
│   (erp-frontend)    │ ──────► │  (this project)     │ ──────► │   (erp_db)   │
│   localhost:3000    │         │   localhost:8080    │         │              │
└─────────────────────┘         └─────────────────────┘         └──────────────┘
```

1. User opens the website in a browser.
2. Frontend sends requests to the backend API.
3. Backend reads/writes data in MySQL.
4. After login, a secure token (JWT) keeps the user signed in.

---

## User Roles

| Role | Who uses it | Main responsibility |
|------|-------------|---------------------|
| **ADMIN** | System administrator | Manage users, roles, departments, passwords |
| **HR** | Human Resources | Manage employees, attendance, leave, payroll overview, performance |
| **FINANCE** | Accounts / payroll team | Process payroll, manage payslips |
| **EMPLOYEE** | Regular staff | View attendance, request leave, see payslips and performance |
| **INVENTORY** | Stock / warehouse team | Reserved for future inventory module (backend security only) |

---

## Features

### Authentication

- User signup (`POST /auth/signup`)
- User login (`POST /auth/signin`)
- JWT-based session after login
- Password encryption (BCrypt)
- Role-based access control

### Admin Module

- Create, update, and delete users
- Assign roles: ADMIN, HR, FINANCE, INVENTORY
- Activate / deactivate users
- Reset user passwords
- Paginated user listing with search
- Department assignment for users

### Department Management

- Create, read, update, delete departments
- View department details
- Link users to departments

### HR Module — Employees

- Create, update, delete employees
- Paginated employee listing with filters
- Activate / deactivate employees
- View employee details by ID

### HR Module — Attendance

- Mark attendance for employees
- Self check-in (`mark-now`) for employees
- Attendance statuses: `PRESENT`, `ABSENT`, `LEAVE`, `NOT_MARKED`
- Daily, weekly, and monthly attendance summaries
- Organization-wide attendance reports
- Export attendance to **Excel** and **PDF**
- Monthly attendance report per employee (PDF / Excel)

### HR Module — Leave

- Employees apply for leave
- HR approves or rejects leave requests
- View all leave requests (paginated)
- Filter leave by status
- Auto-update attendance when leave is approved

### HR Module — Payroll & Performance

- Generate monthly salary records
- Approve, forward, and mark salaries as paid
- Regenerate or delete salary entries
- Payroll dashboard and monthly summary
- Salary status counts (pending, approved, paid, etc.)
- Create and view performance reviews
- Employee-specific and organization-wide review listing
- Performance bonus configuration via `application.properties`

### Finance Module

- Payroll processing workflow
- Payslip generation and download
- Email payslip to employee (SMTP configured in `application.properties`)
- Filter payslips by month
- Payslip activity logs
- Finance dashboard with payout totals and pending counts

### Employee Self-Service (via frontend)

- Personal dashboard with attendance summary
- Mark today's attendance
- Submit and track leave requests
- View and download own payslips
- View performance reviews
- Link login to Employee ID (profile setup)

### Planned / Partial

| Feature | Status |
|---------|--------|
| Inventory (stock, purchase orders) | Mentioned in security config — **not fully built yet** |
| Financial reporting | Listed as planned |
| Inventory frontend portal | **Not implemented** |

---

## Tech Stack

### Backend (this folder)

| Technology | Purpose |
|------------|---------|
| Java 17 | Programming language |
| Spring Boot 3.4 | Application framework |
| Spring Security | Authentication and authorization |
| Spring Data JPA | Database access |
| MySQL | Data storage |
| JWT | Login tokens |
| Maven | Build tool |
| Lombok | Reduces boilerplate code |

### Frontend (`../erp-frontend`)

| Technology | Purpose |
|------------|---------|
| React 19 + TypeScript | User interface |
| Vite | Dev server and build |
| React Router | Page navigation |
| Bootstrap 5 | Styling |
| Axios | API calls |
| React Hook Form + Zod | Form validation |
| TanStack Query | Data fetching |
| Zustand | Auth state |
| Recharts | Dashboard charts |

---

## Prerequisites

Install these before starting:

| Tool | Version | Check with |
|------|---------|------------|
| Java JDK | 17+ | `java -version` |
| Maven | 3.8+ | `mvn -version` |
| MySQL | 8.x | MySQL Workbench or `mysql --version` |
| Node.js | 18+ | `node -version` |
| npm | 9+ | `npm -version` |

Also ensure **MySQL service is running** on your machine.

---

## Step-by-Step Setup

### Step 1 — Create the database

Open MySQL and run:

```sql
CREATE DATABASE erp_db;
```

> The backend is configured to use database name **`erp_db`** (see `application.properties`).

---

### Step 2 — Configure backend database credentials

Open `src/main/resources/application.properties` and update:

```properties
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD
spring.datasource.url=jdbc:mysql://localhost:3306/erp_db
```

Optional (for payslip email):

```properties
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

> Tables are created automatically on first run (`spring.jpa.hibernate.ddl-auto=update`). You do not need to write SQL scripts manually.

---

### Step 3 — Start the backend

From the `ERP` folder:

```bash
mvn spring-boot:run
```

Wait until you see the application started successfully.

- Backend URL: **http://localhost:8080**
- Test signup endpoint: `POST http://localhost:8080/auth/signup`

---

### Step 4 — Configure and start the frontend

Open a **new terminal** and go to the frontend folder:

```bash
cd ../erp-frontend
```

Create `.env` from the example (if not already present):

```bash
cp .env.example .env
```

Default content:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Install dependencies (first time only):

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

- Frontend URL: **http://localhost:3000**

---

### Step 5 — Create your first account

1. Open **http://localhost:3000/signup**
2. Fill in name, email, password, and choose role **ADMIN**
3. After success, go to **http://localhost:3000/login**
4. Sign in — you will land on the Admin dashboard

> The database starts empty. You must create at least one account (via signup or API) before you can log in.

---

## Recommended First-Time Workflow

Follow this order to understand the full system:

| Step | Role | Action |
|------|------|--------|
| 1 | Admin | Sign up and log in |
| 2 | Admin | Create departments (e.g. Engineering, HR, Finance) |
| 3 | Admin | Create HR and Finance user accounts |
| 4 | HR | Log in → add employees |
| 5 | Employee | Log in with employee credentials → complete Profile Setup (link Employee ID) |
| 6 | Employee | Mark attendance and submit a leave request |
| 7 | HR | Approve or reject the leave |
| 8 | Finance | Process payroll and view payslips |

---

## Frontend Pages (by role)

| Role | Routes |
|------|--------|
| Public | `/login`, `/signup` |
| Admin | `/admin/dashboard`, `/admin/users`, `/admin/users/create`, `/admin/departments` |
| HR | `/hr/dashboard`, `/hr/employees`, `/hr/attendance`, `/hr/leaves`, `/hr/payroll`, `/hr/performance` |
| Finance | `/finance/dashboard`, `/finance/payroll`, `/finance/payslips` |
| Employee | `/employee/dashboard`, `/employee/attendance`, `/employee/leaves`, `/employee/payslips`, `/employee/performance`, `/employee/profile` |

---

## API Overview

| Base path | Module |
|-----------|--------|
| `/auth` | Signup, signin |
| `/admin` | User management |
| `/api/departments` | Departments |
| `/api/employees` | Employee CRUD |
| `/api/attendance` | Attendance records and summaries |
| `/api/attendance/export` | Excel / PDF export |
| `/api/leaves` | Leave requests |
| `/api/salary` | Payroll generation and approval |
| `/api/payslip` | Payslip download, email, logs |
| `/api/performance-reviews` | Performance reviews |
| `/api/test` | Email test endpoint |

Most `/api/**` routes require a valid JWT token in the `Authorization` header.

---

## Project Structure

```
ERP/
├── src/main/java/com/erp/
│   ├── config/          # Security, JWT, app configuration
│   ├── controller/      # REST API endpoints
│   ├── dto/               # Data transfer objects
│   ├── entity/            # Database models
│   ├── repository/        # Database queries
│   ├── request/           # Incoming request models
│   ├── response/          # API response models
│   └── service/           # Business logic
├── src/main/resources/
│   └── application.properties
└── pom.xml

erp-frontend/              # React website (sibling folder)
├── src/
│   ├── api/               # API service layer
│   ├── features/          # Feature modules (auth, admin, hr, etc.)
│   ├── pages/             # Page components
│   ├── routes/            # Routing
│   └── store/             # Auth state
└── package.json
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Cannot connect to database | Check MySQL is running; verify username, password, and `erp_db` exists |
| Login fails with valid password | Database may be empty — create account via `/signup` first |
| Frontend cannot reach API | Ensure backend is running on port 8080; check `.env` in `erp-frontend` |
| Employee features not working | Go to **Profile Setup** and link the correct Employee ID |
| Port 8080 already in use | Stop other apps on 8080 or change Spring Boot `server.port` |
| Port 3000 already in use | Vite will suggest another port, or stop the conflicting process |

---

## Build Commands

**Backend**

```bash
mvn clean package
```

**Frontend**

```bash
cd ../erp-frontend
npm run build
npm run preview
```

---

## Summary

This ERP system connects an **Admin**, **HR**, **Finance**, and **Employee** workflow in one application. The backend provides secure APIs and data storage; the React frontend provides role-based dashboards for daily use. Start with signup, configure MySQL, run both servers, and explore each portal step by step.
