# Naukri Clone — Spring Boot + MySQL Backend

A production-style job portal backend with JWT auth, role-based access (JOB_SEEKER / RECRUITER / ADMIN), companies, jobs, applications, and saved jobs. Tables are auto-created on first run; the database is auto-created by MySQL via `createDatabaseIfNotExist=true`.

## Stack
- Java 17, Spring Boot 3.3.4
- Spring Web, Spring Security (JWT), Spring Data JPA, Hibernate
- MySQL 8.x
- Maven, Lombok

## Prerequisites
- JDK 17+
- Maven 3.9+
- MySQL 8.x running on `localhost:3306`

## Configure
Edit `src/main/resources/application.properties` if your MySQL credentials differ. Defaults:
- url: `jdbc:mysql://localhost:3306/naukri_db?createDatabaseIfNotExist=true`
- username: `root`
- password: `root`

## Run
```bash
mvn spring-boot:run
```
Backend boots on `http://localhost:8080/api`. Schema is created/updated automatically (`spring.jpa.hibernate.ddl-auto=update`).

## API

Base URL: `http://localhost:8080/api`

### Auth (public)
- `POST /auth/register` — `{ fullName, email, password, role: JOB_SEEKER|RECRUITER, phone? }`
- `POST /auth/login` — `{ email, password }` → returns `{ token, userId, email, fullName, role }`

Pass `Authorization: Bearer <token>` on all protected calls.

### Users
- `GET /users/me`
- `PUT /users/me` — partial update: `{ fullName?, phone?, headline?, resumeUrl? }`

### Companies
- `GET /companies` (public)
- `GET /companies/{id}` (public)
- `POST /companies` (recruiter) — `{ name, description?, website?, location?, logoUrl? }`
- `GET /companies/mine` (recruiter)

### Jobs
- `GET /jobs?q=&location=&type=&page=0&size=10` (public, paged)
- `GET /jobs/{id}` (public)
- `POST /jobs` (recruiter) — `{ title, description, location, employmentType, experienceLevel, salaryMin, salaryMax, skills, companyId }`
- `PUT /jobs/{id}` (recruiter, owner only)
- `DELETE /jobs/{id}` (recruiter, owner only)
- `GET /recruiter/jobs` — jobs posted by the current recruiter

### Applications
- `POST /applications/jobs/{jobId}` (seeker) — `{ coverLetter? }`
- `GET /applications/me` (seeker)
- `GET /applications/jobs/{jobId}` (recruiter, job owner only)
- `PATCH /applications/{id}/status` — `{ status: APPLIED|SHORTLISTED|REJECTED|HIRED }`

### Saved Jobs
- `POST /saved-jobs/{jobId}`
- `DELETE /saved-jobs/{jobId}`
- `GET /saved-jobs`

## Quick test
```bash
# Register a recruiter
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Acme Recruiter","email":"r@acme.com","password":"secret123","role":"RECRUITER"}'

# Search jobs
curl http://localhost:8080/api/jobs
```

## CORS
Allowed origins are set in `application.properties` under `app.cors.allowed-origins` (defaults to Vite `http://localhost:5173` and `http://localhost:3000`).

## Project Layout
```
src/main/java/com/naukri
  NaukriApplication.java
  config/SecurityConfig.java
  security/{JwtService, JwtAuthFilter, AppUserDetailsService}.java
  entity/{User, Company, Job, Application, SavedJob}.java
  repository/*.java
  dto/{AuthDtos, JobDtos}.java
  service/*.java
  controller/*.java
  exception/{ApiException, GlobalExceptionHandler}.java
```
