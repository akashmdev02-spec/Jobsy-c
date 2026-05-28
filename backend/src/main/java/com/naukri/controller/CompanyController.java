package com.naukri.controller;

import com.naukri.dto.JobDtos.CompanyRequest;
import com.naukri.entity.Company;
import com.naukri.service.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/companies")
@RequiredArgsConstructor
public class CompanyController {
    private final CompanyService companyService;

    @GetMapping public List<Company> all() { return companyService.all(); }
    @GetMapping("/{id}") public Company get(@PathVariable Long id) { return companyService.get(id); }
    @PostMapping public Company create(@Valid @RequestBody CompanyRequest req) { return companyService.create(req); }
    @GetMapping("/mine") public List<Company> mine() { return companyService.mine(); }
}
