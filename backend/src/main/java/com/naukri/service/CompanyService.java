package com.naukri.service;

import com.naukri.dto.JobDtos.CompanyRequest;
import com.naukri.entity.Company;
import com.naukri.exception.ApiException;
import com.naukri.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CompanyService {
    private final CompanyRepository companyRepository;
    private final CurrentUserService currentUserService;

    public List<Company> all() { return companyRepository.findAll(); }
    public Company get(Long id) {
        return companyRepository.findById(id).orElseThrow(() -> ApiException.notFound("Company not found"));
    }
    public Company create(CompanyRequest req) {
        var me = currentUserService.get();
        Company c = Company.builder()
                .name(req.getName()).description(req.getDescription())
                .website(req.getWebsite()).location(req.getLocation())
                .logoUrl(req.getLogoUrl()).owner(me).build();
        return companyRepository.save(c);
    }
    public List<Company> mine() {
        return companyRepository.findByOwnerId(currentUserService.get().getId());
    }
}
