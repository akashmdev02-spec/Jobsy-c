package com.naukri.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "applications",
       uniqueConstraints = @UniqueConstraint(columnNames = {"job_id", "applicant_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Application {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "job_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "applicant_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User applicant;


    @Column(length = 2000)
    private String coverLetter;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.APPLIED;

    @Builder.Default
    @Column(nullable = false, updatable = false)
    private Instant appliedAt = Instant.now();

    public enum Status { APPLIED, SHORTLISTED, REJECTED, HIRED }
}
