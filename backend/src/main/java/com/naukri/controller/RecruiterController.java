package com.naukri.controller;

import com.naukri.entity.Job;
import com.naukri.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/recruiter")
@RequiredArgsConstructor
public class RecruiterController {
    private final JobService jobService;

    @GetMapping("/jobs")
    public List<Job> myJobs() { return jobService.myPostedJobs(); }
}
