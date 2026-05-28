package com.naukri.controller;

import com.naukri.dto.JobDtos.ApplyRequest;
import com.naukri.entity.Application;
import com.naukri.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/applications")
@RequiredArgsConstructor
public class ApplicationController {
    private final ApplicationService applicationService;

    @PostMapping("/jobs/{jobId}")
    public Application apply(@PathVariable Long jobId, @RequestBody(required = false) ApplyRequest req) {
        return applicationService.apply(jobId, req == null ? new ApplyRequest() : req);
    }

    @GetMapping("/me")
    public List<Application> mine() { return applicationService.myApplications(); }

    @GetMapping("/jobs/{jobId}")
    public List<Application> forJob(@PathVariable Long jobId) { return applicationService.forJob(jobId); }

    @PatchMapping("/{id}/status")
    public Application updateStatus(@PathVariable Long id, @RequestBody Map<String,String> body) {
        return applicationService.updateStatus(id, Application.Status.valueOf(body.get("status")));
    }
}
