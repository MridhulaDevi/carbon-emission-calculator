package com.example.carbon_emission.dto;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtp(String email, String name, String otp) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(senderEmail);
        message.setTo(email);

        message.setSubject(
                "CarbonDown - Password Reset Verification"
        );

        message.setText(
                "Hello " + name + ",\n\n"

                + "We received a request to reset your "
                + "CarbonDown account password.\n\n"

                + "Your verification code is: " + otp + "\n\n"

                + "This code is valid for 5 minutes.\n\n"

                + "Please do not share this code with anyone.\n\n"

                + "If you did not request a password reset, "
                + "you can safely ignore this email.\n\n"

                + "Small steps today. A greener tomorrow.\n\n"

                + "Regards,\n"
                + "Team CarbonDown"
        );

        mailSender.send(message);
    }
}