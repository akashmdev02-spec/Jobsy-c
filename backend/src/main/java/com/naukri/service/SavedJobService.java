package com.naukri.service;

import com.naukri.entity.*;
import com.naukri.exception.ApiException;
import com.naukri.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SavedJobService {
    private final SavedJobRepository savedJobRepository;
    private final JobRepository jobRepository;
    private final CurrentUserService currentUserService;

    public SavedJob save(Long jobId) {
        User me = currentUserService.get();
        Job job = jobRepository.findById(jobId).orElseThrow(() -> ApiException.notFound("Job not found"));
        return savedJobRepository.findByJobIdAndUserId(jobId, me.getId())
                .orElseGet(() -> savedJobRepository.save(SavedJob.builder().job(job).user(me).build()));
    }
    @Transactional
    public void unsave(Long jobId) {
        savedJobRepository.deleteByJobIdAndUserId(jobId, currentUserService.get().getId());
    }
    public List<SavedJob> mine() {
        return savedJobRepository.findByUserIdOrderBySavedAtDesc(currentUserService.get().getId());
    }
}
