package com.example.carbon_emission.controller;

import com.example.carbon_emission.entity.Badge;
import com.example.carbon_emission.service.BadgeService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/badges")
@CrossOrigin(origins = "http://localhost:5173")
public class BadgeController {

    private final BadgeService badgeService;

    public BadgeController(BadgeService badgeService) {
        this.badgeService = badgeService;
    }

    @GetMapping
    public ResponseEntity<List<Badge>> getBadges(
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                badgeService.getBadges(email)
        );
    }
}