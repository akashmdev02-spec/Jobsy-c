package com.naukri.service;

import com.naukri.dto.JobDtos.*;
import com.naukri.entity.*;
import com.naukri.exception.ApiException;
import com.naukri.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JobService {
    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final CurrentUserService currentUserService;

    public Page<Job> search(String q, String location, String type, int page, int size) {
        return jobRepository.search(q, location, type,
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
    }
    public Job get(Long id) {
        return jobRepository.findById(id).orElseThrow(() -> ApiException.notFound("Job not found"));
    }
    public Job create(JobRequest req) {
        User me = currentUserService.get();
        Company company = companyRepository.findById(req.getCompanyId())
                .orElseThrow(() -> ApiException.notFound("Company not found"));
        if (company.getOwner() == null || !company.getOwner().getId().equals(me.getId()))
            throw ApiException.forbidden("Not your company");
        Job job = Job.builder()
                .title(req.getTitle()).description(req.getDescription())
                .location(req.getLocation()).employmentType(req.getEmploymentType())
                .experienceLevel(req.getExperienceLevel())
                .salaryMin(req.getSalaryMin()).salaryMax(req.getSalaryMax())
                .skills(req.getSkills()).company(company).postedBy(me).active(true)
                .build();
        return jobRepository.save(job);
    }
    public Job update(Long id, JobRequest req) {
        Job job = get(id);
        User me = currentUserService.get();
        if (!job.getPostedBy().getId().equals(me.getId()))
            throw ApiException.forbidden("Not your job");
        job.setTitle(req.getTitle()); job.setDescription(req.getDescription());
        job.setLocation(req.getLocation()); job.setEmploymentType(req.getEmploymentType());
        job.setExperienceLevel(req.getExperienceLevel());
        job.setSalaryMin(req.getSalaryMin()); job.setSalaryMax(req.getSalaryMax());
        job.setSkills(req.getSkills());
        return jobRepository.save(job);
    }
    public void delete(Long id) {
        Job job = get(id);
        User me = currentUserService.get();
        if (!job.getPostedBy().getId().equals(me.getId()))
            throw ApiException.forbidden("Not your job");
        jobRepository.delete(job);
    }
    public List<Job> myPostedJobs() {
        return jobRepository.findByPostedByIdOrderByCreatedAtDesc(currentUserService.get().getId());
    }
}
