package com.example.carbon_emission.service;

import com.example.carbon_emission.dto.LoginRequest;
import com.example.carbon_emission.dto.RegisterRequest;
import com.example.carbon_emission.entity.User;
import com.example.carbon_emission.repository.UserRepository;
import com.example.carbon_emission.security.JwtUtil;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Locale;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Value("${google.client.id}")
    private String googleClientId;

    public AuthService(
            UserRepository userRepository,
            JwtUtil jwtUtil) {

        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
        this.jwtUtil = jwtUtil;
    }

    // =========================
    // REGISTER
    // =========================

    public User register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());

        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        user.setGender(request.getGender());
        user.setAge(request.getAge());
        user.setRole("USER");

        return userRepository.save(user);
    }

    // =========================
    // NORMAL LOGIN
    // =========================

    public String login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("Invalid email or password")
                );

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new RuntimeException("Invalid email or password");
        }

        return jwtUtil.generateToken(
                user.getEmail(),
                user.getRole()
        );
    }

    // =========================
    // GOOGLE LOGIN
    // =========================

    public String googleLogin(String credential) {

        if (credential == null || credential.isBlank()) {
            throw new RuntimeException("Google credential is required");
        }

        GoogleIdToken idToken;

        try {

            GoogleIdTokenVerifier verifier =
                    new GoogleIdTokenVerifier.Builder(
                            new NetHttpTransport(),
                            GsonFactory.getDefaultInstance()
                    )
                    .setAudience(
                            Collections.singletonList(
                                    googleClientId.trim()
                            )
                    )
                    .build();

            GoogleIdToken parsed = GoogleIdToken.parse(
                    GsonFactory.getDefaultInstance(),
                    credential.trim()
            );

            System.out.println(
                    "Issuer valid: " +
                    parsed.verifyIssuer(verifier.getIssuers())
            );

            System.out.println(
                    "Audience valid: " +
                    parsed.verifyAudience(verifier.getAudience())
            );

            System.out.println(
                    "Time valid: " +
                    parsed.verifyTime(System.currentTimeMillis(), 300)
            );

            idToken = verifier.verify(credential.trim());

            System.out.println(
                    "Final verification: " + (idToken != null)
            );

        } catch (Exception e) {

            e.printStackTrace();

            throw new RuntimeException(
                    "Unable to verify Google credentials"
            );
        }

        if (idToken == null) {
            throw new RuntimeException("Invalid Google credential");
        }

        GoogleIdToken.Payload payload = idToken.getPayload();

        if (!Boolean.TRUE.equals(payload.getEmailVerified())) {
            throw new RuntimeException("Google email is not verified");
        }

        String email = payload.getEmail();

        if (email == null || email.isBlank()) {
            throw new RuntimeException("Google email is unavailable");
        }

        email = email.trim().toLowerCase(Locale.ROOT);

        String name = (String) payload.get("name");
        String hostedDomain = (String) payload.get("hd");

        if (!email.endsWith("@gmail.com")
                && (hostedDomain == null || hostedDomain.isBlank())) {

            throw new RuntimeException(
                    "Please use a Gmail or Google Workspace account"
            );
        }

        User user = userRepository.findByEmail(email)
                .orElse(null);

        // =========================
        // NEW GOOGLE USER
        // =========================

        if (user == null) {

            user = new User();

            user.setName(
                    name != null && !name.isBlank()
                            ? name
                            : email.split("@")[0]
            );

            user.setEmail(email);

            user.setPassword(
                    passwordEncoder.encode(
                            UUID.randomUUID().toString()
                    )
            );

            user.setGender(null);
            user.setAge(null);
            user.setRole("USER");

            user = userRepository.save(user);
        }

        // =========================
        // ADMIN ACCOUNT PROTECTION
        // =========================

        if (!"USER".equals(user.getRole())) {

            throw new RuntimeException(
                    "Please use your existing login method"
            );
        }

        // =========================
        // GENERATE JWT
        // =========================

        return jwtUtil.generateToken(
                user.getEmail(),
                user.getRole()
        );
    }
}