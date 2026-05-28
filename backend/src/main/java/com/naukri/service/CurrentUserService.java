package com.naukri.service;

import com.naukri.entity.User;
import com.naukri.exception.ApiException;
import com.naukri.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CurrentUserService {
    private final UserRepository userRepository;

    public User get() {
        Authentication a = SecurityContextHolder.getContext().getAuthentication();
        if (a == null || a.getName() == null)
            throw new ApiException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Not authenticated");
        return userRepository.findByEmail(a.getName())
                .orElseThrow(() -> ApiException.notFound("User not found"));
    }
}
