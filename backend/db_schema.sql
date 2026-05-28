-- Jobsy Database Schema (MySQL)
-- Auto-created or manual setup

CREATE DATABASE IF NOT EXISTS naukri_db12;
USE naukri_db12;

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- JOB_SEEKER, RECRUITER, ADMIN
    phone VARCHAR(50),
    headline VARCHAR(255),
    resume_url VARCHAR(255),
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_token VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: companies
CREATE TABLE IF NOT EXISTS companies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website VARCHAR(255),
    location VARCHAR(255),
    logo_url VARCHAR(255),
    owner_id BIGINT NOT NULL,
    CONSTRAINT fk_companies_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: jobs
CREATE TABLE IF NOT EXISTS jobs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255),
    employment_type VARCHAR(50),
    experience_level VARCHAR(50),
    salary_min DOUBLE,
    salary_max DOUBLE,
    skills VARCHAR(2000),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    company_id BIGINT NOT NULL,
    posted_by BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_jobs_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_jobs_posted_by FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: applications
CREATE TABLE IF NOT EXISTS applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cover_letter TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'APPLIED',
    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    job_id BIGINT NOT NULL,
    applicant_id BIGINT NOT NULL,
    CONSTRAINT fk_applications_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    CONSTRAINT fk_applications_applicant FOREIGN KEY (applicant_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: saved_jobs
CREATE TABLE IF NOT EXISTS saved_jobs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    CONSTRAINT fk_saved_jobs_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    CONSTRAINT fk_saved_jobs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed system administrator (password: luciferak)
-- Bcrypt hash of 'luciferak' is used below
INSERT INTO users (full_name, email, password, role, email_verified, created_at)
VALUES ('System Administrator', 'Admin@Jobsyak.com', '$2a$10$tZ20k9m1F4C9w6E13rYgKe3r9QvY9N1R/ePqZ2yZ5YgJg4bV9S0gS', 'ADMIN', TRUE, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE email_verified = TRUE;
