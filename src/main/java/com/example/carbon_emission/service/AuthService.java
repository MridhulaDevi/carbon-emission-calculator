package com.example.carbon_emission.service;

import com.example.carbon_emission.dto.LoginRequest;
import com.example.carbon_emission.dto.RegisterRequest;
import com.example.carbon_emission.entity.User;
import com.example.carbon_emission.repository.UserRepository;
import com.example.carbon_emission.security.JwtUtil;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
        this.jwtUtil = jwtUtil;
    }

    // =========================
    // REGISTER
    // =========================
    public User register(RegisterRequest request) {

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // Create new user
        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());

        // Encrypt password
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        user.setGender(request.getGender());
        user.setAge(request.getAge());

        // Normal registration = USER
        user.setRole("USER");

        // Save to PostgreSQL
        return userRepository.save(user);
    }

    // =========================
    // LOGIN
    // =========================
    public String login(LoginRequest request) {

        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("Invalid email or password")
                );

        // Check password
        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new RuntimeException("Invalid email or password");
        }

        // Generate JWT token
        return jwtUtil.generateToken(
                user.getEmail(),
                user.getRole()
        );
    }
}