package com.naukri.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

public class JobDtos {
    @Data public static class JobRequest {
        @NotBlank private String title;
        @NotBlank private String description;
        private String location;
        private String employmentType;
        private String experienceLevel;
        private Double salaryMin;
        private Double salaryMax;
        private String skills;
        @NotNull private Long companyId;
    }
    @Data public static class ApplyRequest {
        private String coverLetter;
        private String resumeUrl;
    }
    @Data public static class CompanyRequest {
        @NotBlank private String name;
        private String description;
        private String website;
        private String location;
        private String logoUrl;
    }
}
