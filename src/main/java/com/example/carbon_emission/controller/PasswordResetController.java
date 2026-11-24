package com.example.carbon_emission.controller;

import com.example.carbon_emission.entity.User;
import com.example.carbon_emission.repository.UserRepository;
import com.example.carbon_emission.dto.OtpService;
import com.example.carbon_emission.dto.EmailService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class PasswordResetController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final EmailService emailService;

    public PasswordResetController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            OtpService otpService,
            EmailService emailService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.otpService = otpService;
        this.emailService = emailService;
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(
            @RequestBody Map<String, String> request) {

        String email = request.get("email");

        if (email == null || email.isBlank()) {

            return ResponseEntity.badRequest().body(
                    Map.of("message", "Please enter your email ID.")
            );
        }

        email = email.trim();

        User user = userRepository.findByEmail(email)
                .orElse(null);

        if (user == null) {

            return ResponseEntity.badRequest().body(
                    Map.of("message", "Email ID is not registered.")
            );
        }

        String otp;

        try {

            otp = otpService.generateOtp(user.getEmail());

        } catch (RuntimeException e) {

            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }

        try {

            emailService.sendOtp(
                    user.getEmail(),
                    user.getName(),
                    otp
            );

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Verification code sent to your email."
                    )
            );

        } catch (Exception e) {

            otpService.removeOtp(user.getEmail(), otp);

            return ResponseEntity.status(503).body(
                    Map.of(
                            "message",
                            "Unable to send verification email. Please try again."
                    )
            );
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(
            @RequestBody Map<String, String> request) {

        String email = request.get("email");
        String otp = request.get("otp");

        if (email == null || email.isBlank()
                || otp == null || !otp.matches("[0-9]{6}")) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "Please enter a valid 6-digit OTP."
                    )
            );
        }

        try {

            String resetToken = otpService.verifyOtp(
                    email.trim(), otp
            );

            return ResponseEntity.ok(
                    Map.of(
                            "message", "OTP verified successfully.",
                            "resetToken", resetToken
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestBody Map<String, String> request) {

        String email = request.get("email");
        String resetToken = request.get("resetToken");
        String newPassword = request.get("newPassword");
        String confirmPassword = request.get("confirmPassword");

        if (email == null || email.isBlank()
                || resetToken == null || resetToken.isBlank()) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "Please complete OTP verification first."
                    )
            );
        }

        if (newPassword == null || newPassword.length() < 6) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "Password must contain at least 6 characters."
                    )
            );
        }

        if (!newPassword.equals(confirmPassword)) {

            return ResponseEntity.badRequest().body(
                    Map.of("message", "Passwords do not match.")
            );
        }

        if (newPassword.getBytes(StandardCharsets.UTF_8).length > 72) {

            return ResponseEntity.badRequest().body(
                    Map.of("message", "Password is too long.")
            );
        }

        User user = userRepository.findByEmail(email.trim())
                .orElse(null);

        if (user == null) {

            return ResponseEntity.badRequest().body(
                    Map.of("message", "Email ID is not registered.")
            );
        }

        if (!otpService.consumeResetToken(
                user.getEmail(), resetToken)) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "Verification expired or invalid. Please restart password recovery."
                    )
            );
        }

        user.setPassword(
                passwordEncoder.encode(newPassword)
        );

        userRepository.save(user);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Password reset successfully. Please sign in."
                )
        );
    }
}