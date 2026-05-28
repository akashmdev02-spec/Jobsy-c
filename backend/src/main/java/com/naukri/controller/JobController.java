package com.naukri.controller;

import com.naukri.dto.JobDtos.*;
import com.naukri.entity.Job;
import com.naukri.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/jobs")
@RequiredArgsConstructor
public class JobController {
    private final JobService jobService;

    @GetMapping
    public Page<Job> search(@RequestParam(required = false) String q,
                            @RequestParam(required = false) String location,
                            @RequestParam(required = false) String type,
                            @RequestParam(defaultValue = "0") int page,
                            @RequestParam(defaultValue = "10") int size) {
        return jobService.search(q, location, type, page, size);
    }

    @GetMapping("/{id}") public Job get(@PathVariable Long id) { return jobService.get(id); }

    @PostMapping public Job create(@Valid @RequestBody JobRequest req) { return jobService.create(req); }

    @PutMapping("/{id}") public Job update(@PathVariable Long id, @Valid @RequestBody JobRequest req) {
        return jobService.update(id, req);
    }

    @DeleteMapping("/{id}") public void delete(@PathVariable Long id) { jobService.delete(id); }
}
