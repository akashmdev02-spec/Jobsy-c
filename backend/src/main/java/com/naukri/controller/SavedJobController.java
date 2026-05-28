package com.naukri.controller;

import com.naukri.entity.SavedJob;
import com.naukri.service.SavedJobService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/saved-jobs")
@RequiredArgsConstructor
public class SavedJobController {
    private final SavedJobService savedJobService;

    @PostMapping("/{jobId}") public SavedJob save(@PathVariable Long jobId) { return savedJobService.save(jobId); }
    @DeleteMapping("/{jobId}") public void unsave(@PathVariable Long jobId) { savedJobService.unsave(jobId); }
    @GetMapping public List<SavedJob> mine() { return savedJobService.mine(); }
}
