package com.naukri.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendVerificationEmail(String toEmail, String token, String fullName) {

        String verificationLink =
                "http://localhost:8080/api/auth/verify?token=" + token;

        String subject = "Jobsy - Please Verify Your Email Address";

        String messageBody = String.format(
                "Hello %s,\n\n" +
                "Thank you for registering at Jobsy portal!\n\n" +
                "Please click the link below to verify your email address:\n\n" +
                "%s\n\n" +
                "If you did not register, you can ignore this email.\n\n" +
                "Best regards,\n" +
                "The Jobsy Team",
                fullName,
                verificationLink
        );

        try {

            SimpleMailMessage message = new SimpleMailMessage();

            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(messageBody);

            mailSender.send(message);

            System.out.println("====== EMAIL SENT SUCCESSFULLY ======");
            System.out.println("TO: " + toEmail);

        } catch (Exception e) {

            System.err.println("====== EMAIL SEND FAILED ======");

            e.printStackTrace();

            System.err.println("TO: " + toEmail);

            System.err.println("Verification Link:");
            System.err.println(verificationLink);
        }
    }

    public void sendStatusUpdateEmail(
            String toEmail,
            String jobTitle,
            String companyName,
            String newStatus,
            String fullName
    ) {

        String subject = "Jobsy - Application Status Update";

        String messageBody = String.format(
                "Hello %s,\n\n" +
                "Your application status has been updated.\n\n" +
                "Job Title: %s\n" +
                "Company: %s\n" +
                "New Status: %s\n\n" +
                "Best regards,\n" +
                "The Jobsy Team",
                fullName,
                jobTitle,
                companyName,
                newStatus
        );

        try {

            SimpleMailMessage message = new SimpleMailMessage();

            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(messageBody);

            mailSender.send(message);

            System.out.println("====== STATUS EMAIL SENT ======");

        } catch (Exception e) {

            System.err.println("====== STATUS EMAIL FAILED ======");

            e.printStackTrace();
        }
    }
}