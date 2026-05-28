package com.naukri;

import com.naukri.entity.User;
import com.naukri.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
@org.springframework.scheduling.annotation.EnableAsync
public class NaukriApplication {
    public static void main(String[] args) {
        SpringApplication.run(NaukriApplication.class, args);
    }

    @Bean
    public CommandLineRunner seedAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // 1. Backfill: Mark all pre-existing users as emailVerified so they are not locked out
            java.util.List<User> preExistingUsers = userRepository.findAll();
            boolean backfillRan = false;
            for (User u : preExistingUsers) {
                if (!u.isEmailVerified() && !"Admin@Jobsyak.com".equalsIgnoreCase(u.getEmail())) {
                    u.setEmailVerified(true);
                    userRepository.save(u);
                    backfillRan = true;
                }
            }
            if (backfillRan) {
                System.out.println("====== BACKFILL: MARKED PRE-EXISTING USERS AS VERIFIED SUCCESSFULLY ======");
            }

            // 2. Seed/Update Super Admin
            String adminEmail = "Admin@Jobsyak.com";
            User admin = userRepository.findByEmail(adminEmail).orElse(null);
            if (admin == null) {
                admin = User.builder()
                        .fullName("System Administrator")
                        .email(adminEmail)
                        .password(passwordEncoder.encode("luciferak"))
                        .role(User.Role.ADMIN)
                        .emailVerified(true)
                        .build();
                userRepository.save(admin);
                System.out.println("====== SEEDED ADMIN ACCOUNT (CREATED) ======");
                System.out.println("Email: " + adminEmail);
                System.out.println("=============================================");
            } else {
                admin.setEmailVerified(true);
                admin.setPassword(passwordEncoder.encode("luciferak"));
                admin.setRole(User.Role.ADMIN);
                userRepository.save(admin);
                System.out.println("====== SEEDED ADMIN ACCOUNT (UPDATED TO VERIFIED) ======");
                System.out.println("Email: " + adminEmail);
                System.out.println("=========================================================");
            }
        };
    }
}
