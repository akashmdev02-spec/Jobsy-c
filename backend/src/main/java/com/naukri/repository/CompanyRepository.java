package com.naukri.repository;

import com.naukri.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    List<Company> findByOwnerId(Long ownerId);
}
