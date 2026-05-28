package com.naukri.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;


@Entity
@Table(name = "jobs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Job {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 5000)
    private String description;

    private String location;
    private String employmentType; // FULL_TIME, PART_TIME, CONTRACT, INTERN
    private String experienceLevel; // ENTRY, MID, SENIOR
    private Double salaryMin;
    private Double salaryMax;

    @Column(length = 2000)
    private String skills; // comma-separated

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "company_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "posted_by")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User postedBy;


    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;

    @Builder.Default
    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
