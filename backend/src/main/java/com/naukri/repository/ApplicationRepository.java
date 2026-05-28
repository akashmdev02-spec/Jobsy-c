package com.naukri.repository;

import com.naukri.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByApplicantIdOrderByAppliedAtDesc(Long applicantId);
    List<Application> findByJobIdOrderByAppliedAtDesc(Long jobId);
    Optional<Application> findByJobIdAndApplicantId(Long jobId, Long applicantId);
    void deleteByApplicantId(Long applicantId);
    void deleteByJobId(Long jobId);
}
