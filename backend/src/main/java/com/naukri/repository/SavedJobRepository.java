package com.naukri.repository;

import com.naukri.entity.SavedJob;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SavedJobRepository extends JpaRepository<SavedJob, Long> {
    List<SavedJob> findByUserIdOrderBySavedAtDesc(Long userId);
    Optional<SavedJob> findByJobIdAndUserId(Long jobId, Long userId);
    void deleteByJobIdAndUserId(Long jobId, Long userId);
    void deleteByUserId(Long userId);
    void deleteByJobId(Long jobId);
}
