package com.naukri.controller;

import com.naukri.dto.AuthDtos.*;
import com.naukri.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest req) { return authService.register(req); }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) { return authService.login(req); }

    @GetMapping("/verify")
    public org.springframework.http.ResponseEntity<Void> verify(@RequestParam String token) {
        authService.verify(token);
        return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.FOUND)
                .location(java.net.URI.create("http://localhost:5173/verify-success"))
                .build();
    }
}
