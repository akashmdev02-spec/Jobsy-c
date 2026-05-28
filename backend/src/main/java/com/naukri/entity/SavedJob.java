package com.naukri.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "saved_jobs",
       uniqueConstraints = @UniqueConstraint(columnNames = {"job_id", "user_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SavedJob {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "job_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User user;


    @Builder.Default
    @Column(nullable = false, updatable = false)
    private Instant savedAt = Instant.now();
}
