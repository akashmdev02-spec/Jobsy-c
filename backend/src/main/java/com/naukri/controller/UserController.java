package com.naukri.controller;

import com.naukri.entity.User;
import com.naukri.service.CurrentUserService;
import com.naukri.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;

    @GetMapping("/me")
    public User me() { return currentUserService.get(); }

    @PutMapping("/me")
    public User updateMe(@RequestBody Map<String,String> body) {
        User u = currentUserService.get();
        if (body.containsKey("fullName")) u.setFullName(body.get("fullName"));
        if (body.containsKey("phone")) u.setPhone(body.get("phone"));
        if (body.containsKey("headline")) u.setHeadline(body.get("headline"));
        if (body.containsKey("resumeUrl")) u.setResumeUrl(body.get("resumeUrl"));
        return userRepository.save(u);
    }
}
