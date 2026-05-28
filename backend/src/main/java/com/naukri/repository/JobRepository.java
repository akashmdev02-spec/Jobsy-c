package com.naukri.repository;

import com.naukri.entity.Job;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {
    Page<Job> findByActiveTrue(Pageable pageable);
    List<Job> findByPostedByIdOrderByCreatedAtDesc(Long userId);
    List<Job> findByPostedById(Long userId);
    List<Job> findByCompanyId(Long companyId);

    @Query("""
        SELECT j FROM Job j
        WHERE j.active = true
          AND (:q IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :q, '%'))
                          OR LOWER(j.description) LIKE LOWER(CONCAT('%', :q, '%'))
                          OR LOWER(j.skills) LIKE LOWER(CONCAT('%', :q, '%')))
          AND (:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%')))
          AND (:type IS NULL OR j.employmentType = :type)
        """)
    Page<Job> search(@Param("q") String q,
                     @Param("location") String location,
                     @Param("type") String type,
                     Pageable pageable);
}
