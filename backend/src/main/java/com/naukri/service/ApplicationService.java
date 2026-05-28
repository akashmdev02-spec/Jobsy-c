package com.naukri.service;

import com.naukri.dto.JobDtos.ApplyRequest;
import com.naukri.entity.*;
import com.naukri.exception.ApiException;
import com.naukri.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationService {
    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final CurrentUserService currentUserService;
    private final EmailService emailService;
    private final UserRepository userRepository;

    @Transactional
    public Application apply(Long jobId, ApplyRequest req) {
        User me = currentUserService.get();
        if (me.getRole() != User.Role.JOB_SEEKER)
            throw ApiException.forbidden("Only job seekers can apply");
        Job job = jobRepository.findById(jobId).orElseThrow(() -> ApiException.notFound("Job not found"));
        applicationRepository.findByJobIdAndApplicantId(jobId, me.getId()).ifPresent(a -> {
            throw ApiException.conflict("Already applied");
        });
        
        // Save resumeUrl directly to SQL User Profile table if provided
        if (req.getResumeUrl() != null && !req.getResumeUrl().trim().isEmpty()) {
            me.setResumeUrl(req.getResumeUrl().trim());
            userRepository.save(me);
        }

        Application app = Application.builder()
                .job(job).applicant(me).coverLetter(req.getCoverLetter())
                .status(Application.Status.APPLIED).build();
        return applicationRepository.save(app);
    }
    public List<Application> myApplications() {
        return applicationRepository.findByApplicantIdOrderByAppliedAtDesc(currentUserService.get().getId());
    }
    public List<Application> forJob(Long jobId) {
        Job job = jobRepository.findById(jobId).orElseThrow(() -> ApiException.notFound("Job not found"));
        User me = currentUserService.get();
        if (!job.getPostedBy().getId().equals(me.getId()))
            throw ApiException.forbidden("Not your job");
        return applicationRepository.findByJobIdOrderByAppliedAtDesc(jobId);
    }
    public Application updateStatus(Long applicationId, Application.Status status) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> ApiException.notFound("Application not found"));
        User me = currentUserService.get();
        if (!app.getJob().getPostedBy().getId().equals(me.getId()))
            throw ApiException.forbidden("Not your job");
        app.setStatus(status);
        
        Application saved = applicationRepository.save(app);
        
        // Send email status notification to seeker
        emailService.sendStatusUpdateEmail(
            app.getApplicant().getEmail(),
            app.getJob().getTitle(),
            app.getJob().getCompany() != null ? app.getJob().getCompany().getName() : "Company",
            status.name(),
            app.getApplicant().getFullName()
        );
        
        return saved;
    }
}
