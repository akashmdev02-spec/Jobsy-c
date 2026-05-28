package com.naukri.service;

import com.naukri.dto.AuthDtos.*;
import com.naukri.entity.User;
import com.naukri.exception.ApiException;
import com.naukri.repository.UserRepository;
import com.naukri.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authManager;
    private final EmailService emailService;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail()))
            throw ApiException.conflict("Email already registered");
        
        String verificationToken = java.util.UUID.randomUUID().toString();
        
        User u = User.builder()
                .fullName(req.getFullName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(req.getRole())
                .phone(req.getPhone())
                .emailVerified(false)
                .verificationToken(verificationToken)
                .build();
                
        u = userRepository.save(u);
        
        // Send Verification Email
        emailService.sendVerificationEmail(u.getEmail(), verificationToken, u.getFullName());
        
        String token = jwtService.generate(u.getEmail(), u.getRole().name(), u.getId());
        return new AuthResponse(token, u.getId(), u.getEmail(), u.getFullName(), u.getRole().name());
    }

    public AuthResponse login(LoginRequest req) {
        var u = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new ApiException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Invalid credentials"));
                
        if (!u.isEmailVerified()) {
            throw ApiException.forbidden("Email not verified. Please check your inbox for verification link.");
        }

        try {
            authManager.authenticate(new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        } catch (BadCredentialsException e) {
            throw new ApiException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        
        String token = jwtService.generate(u.getEmail(), u.getRole().name(), u.getId());
        return new AuthResponse(token, u.getId(), u.getEmail(), u.getFullName(), u.getRole().name());
    }

    public void verify(String token) {
        User u = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> ApiException.notFound("Invalid or expired verification token"));
        u.setEmailVerified(true);
        u.setVerificationToken(null);
        userRepository.save(u);
    }
}
