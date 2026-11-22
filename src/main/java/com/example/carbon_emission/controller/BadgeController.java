package com.example.carbon_emission.controller;

import com.example.carbon_emission.service.BadgeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/badges")
@CrossOrigin(origins = "http://localhost:5173")
public class BadgeController {

    private final BadgeService badgeService;

    public BadgeController(BadgeService badgeService) {
        this.badgeService = badgeService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getBadges(
            Authentication authentication) {

        return ResponseEntity.ok(
                badgeService.getBadges(authentication.getName())
        );
    }
}