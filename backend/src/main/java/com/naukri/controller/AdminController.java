package com.naukri.controller;

import com.naukri.entity.*;
import com.naukri.exception.ApiException;
import com.naukri.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final SavedJobRepository savedJobRepository;

    // --- STATS ---
    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("users", userRepository.count());
        stats.put("companies", companyRepository.count());
        stats.put("jobs", jobRepository.count());
        stats.put("applications", applicationRepository.count());
        return stats;
    }

    // --- USERS MANAGEMENT ---
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PutMapping("/users/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        User u = userRepository.findById(id).orElseThrow(() -> ApiException.notFound("User not found"));
        if (body.containsKey("fullName")) u.setFullName((String) body.get("fullName"));
        if (body.containsKey("email")) u.setEmail((String) body.get("email"));
        if (body.containsKey("phone")) u.setPhone((String) body.get("phone"));
        if (body.containsKey("headline")) u.setHeadline((String) body.get("headline"));
        if (body.containsKey("resumeUrl")) u.setResumeUrl((String) body.get("resumeUrl"));
        if (body.containsKey("role")) u.setRole(User.Role.valueOf((String) body.get("role")));
        if (body.containsKey("emailVerified")) u.setEmailVerified((Boolean) body.get("emailVerified"));
        return userRepository.save(u);
    }

    @DeleteMapping("/users/{id}")
    @Transactional
    public void deleteUser(@PathVariable Long id) {
        User u = userRepository.findById(id).orElseThrow(() -> ApiException.notFound("User not found"));
        
        // Block deleting active admin if it's the main admin seed
        if ("Admin@Jobsyak.com".equalsIgnoreCase(u.getEmail())) {
            throw ApiException.forbidden("Cannot delete system seed administrator");
        }

        // 1. Clean up seeker data: applications & saved jobs
        applicationRepository.deleteByApplicantId(id);
        savedJobRepository.deleteByUserId(id);

        // 2. Clean up recruiter data: jobs posted, applications for those jobs
        List<Job> postedJobs = jobRepository.findByPostedById(id);
        for (Job job : postedJobs) {
            applicationRepository.deleteByJobId(job.getId());
            savedJobRepository.deleteByJobId(job.getId());
            jobRepository.delete(job);
        }

        // 3. Clean up companies owned
        List<Company> companies = companyRepository.findByOwnerId(id);
        for (Company c : companies) {
            // Find jobs for this company and delete them
            List<Job> companyJobs = jobRepository.findByCompanyId(c.getId());
            for (Job cJob : companyJobs) {
                applicationRepository.deleteByJobId(cJob.getId());
                savedJobRepository.deleteByJobId(cJob.getId());
                jobRepository.delete(cJob);
            }
            companyRepository.delete(c);
        }

        // 4. Finally delete the user
        userRepository.delete(u);
    }

    // --- COMPANIES MANAGEMENT ---
    @GetMapping("/companies")
    public List<Company> getAllCompanies() {
        return companyRepository.findAll();
    }

    @PutMapping("/companies/{id}")
    public Company updateCompany(@PathVariable Long id, @RequestBody Company body) {
        Company c = companyRepository.findById(id).orElseThrow(() -> ApiException.notFound("Company not found"));
        c.setName(body.getName());
        c.setDescription(body.getDescription());
        c.setWebsite(body.getWebsite());
        c.setLocation(body.getLocation());
        c.setLogoUrl(body.getLogoUrl());
        return companyRepository.save(c);
    }

    @DeleteMapping("/companies/{id}")
    @Transactional
    public void deleteCompany(@PathVariable Long id) {
        Company c = companyRepository.findById(id).orElseThrow(() -> ApiException.notFound("Company not found"));
        
        // Delete all jobs associated with this company
        List<Job> companyJobs = jobRepository.findByCompanyId(id);
        for (Job job : companyJobs) {
            applicationRepository.deleteByJobId(job.getId());
            savedJobRepository.deleteByJobId(job.getId());
            jobRepository.delete(job);
        }

        companyRepository.delete(c);
    }

    // --- JOBS MANAGEMENT ---
    @GetMapping("/jobs")
    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    @PutMapping("/jobs/{id}")
    public Job updateJob(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Job job = jobRepository.findById(id).orElseThrow(() -> ApiException.notFound("Job not found"));
        if (body.containsKey("title")) job.setTitle((String) body.get("title"));
        if (body.containsKey("description")) job.setDescription((String) body.get("description"));
        if (body.containsKey("location")) job.setLocation((String) body.get("location"));
        if (body.containsKey("employmentType")) job.setEmploymentType((String) body.get("employmentType"));
        if (body.containsKey("experienceLevel")) job.setExperienceLevel((String) body.get("experienceLevel"));
        if (body.containsKey("skills")) job.setSkills((String) body.get("skills"));
        
        if (body.containsKey("salaryMin")) {
            Object sMin = body.get("salaryMin");
            job.setSalaryMin(sMin != null ? Double.valueOf(sMin.toString()) : null);
        }
        if (body.containsKey("salaryMax")) {
            Object sMax = body.get("salaryMax");
            job.setSalaryMax(sMax != null ? Double.valueOf(sMax.toString()) : null);
        }
        
        if (body.containsKey("active")) job.setActive((Boolean) body.get("active"));
        return jobRepository.save(job);
    }

    @DeleteMapping("/jobs/{id}")
    @Transactional
    public void deleteJob(@PathVariable Long id) {
        Job job = jobRepository.findById(id).orElseThrow(() -> ApiException.notFound("Job not found"));
        applicationRepository.deleteByJobId(id);
        savedJobRepository.deleteByJobId(id);
        jobRepository.delete(job);
    }

    // --- APPLICATIONS MANAGEMENT ---
    @GetMapping("/applications")
    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }

    @DeleteMapping("/applications/{id}")
    public void deleteApplication(@PathVariable Long id) {
        Application app = applicationRepository.findById(id).orElseThrow(() -> ApiException.notFound("Application not found"));
        applicationRepository.delete(app);
    }
}
