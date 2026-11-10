package com.example.carbon_emission.controller;

import com.example.carbon_emission.dto.PasswordChangeRequest;
import com.example.carbon_emission.dto.ProfileRequest;
import com.example.carbon_emission.entity.User;
import com.example.carbon_emission.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "http://localhost:5173")
public class ProfileController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public ProfileController(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    // GET PROFILE
    @GetMapping
    public ResponseEntity<?> getProfile(Authentication authentication) {

        User user = userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(user);
    }

    // UPDATE PROFILE
    @PutMapping
    public ResponseEntity<?> updateProfile(
            @RequestBody ProfileRequest request,
            Authentication authentication) {

        User user = userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(request.getName());
        user.setGender(request.getGender());
        user.setAge(request.getAge());

        user.setPreferredTransport(
                request.getPreferredTransport()
        );

        user.setDietPreference(
                request.getDietPreference()
        );

        user.setEnergySource(
                request.getEnergySource()
        );

        user.setSustainabilityGoal(
                request.getSustainabilityGoal()
        );

        userRepository.save(user);

        return ResponseEntity.ok(user);
    }

    // CHANGE PASSWORD
    @PutMapping("/password")
    public ResponseEntity<?> changePassword(
            @RequestBody PasswordChangeRequest request,
            Authentication authentication) {

        User user = userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check old password
        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPassword())) {

            return ResponseEntity
                    .badRequest()
                    .body("Current password is incorrect");
        }

        // Validate new password
        if (request.getNewPassword() == null ||
                request.getNewPassword().length() < 6) {

            return ResponseEntity
                    .badRequest()
                    .body("New password must contain at least 6 characters");
        }

        // Hash new password
        user.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );

        userRepository.save(user);

        return ResponseEntity.ok("Password changed successfully");
    }
}