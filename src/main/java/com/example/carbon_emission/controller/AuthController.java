package com.example.carbon_emission.controller;

import com.example.carbon_emission.dto.LoginRequest;
import com.example.carbon_emission.dto.RegisterRequest;
import com.example.carbon_emission.dto.GoogleLoginRequest;
import com.example.carbon_emission.service.AuthService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // =========================
    // REGISTER
    // =========================

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody RegisterRequest request) {

        try {

            authService.register(request);

            return ResponseEntity.ok(
                    "Registration successful. Please sign in."
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================
    // LOGIN
    // =========================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request) {

        try {

            String token = authService.login(request);

            return ResponseEntity.ok(token);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================
    // GOOGLE LOGIN
    // =========================

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(
            @Valid @RequestBody GoogleLoginRequest request) {

        try {

            String token = authService.googleLogin(
                    request.getCredential()
            );

            return ResponseEntity.ok(token);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}