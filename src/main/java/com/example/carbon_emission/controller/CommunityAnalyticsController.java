package com.example.carbon_emission.controller;

import com.example.carbon_emission.service.CommunityAnalyticsService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:5173")
public class CommunityAnalyticsController {

    private final CommunityAnalyticsService communityService;

    public CommunityAnalyticsController(
            CommunityAnalyticsService communityService) {

        this.communityService = communityService;
    }

    @GetMapping("/community")
    public ResponseEntity<?> getCommunityAnalytics(
            @RequestParam(defaultValue = "month") String filter,
            @RequestParam(defaultValue = "all") String category,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String month,
            Authentication authentication) {

        try {

            return ResponseEntity.ok(
                    communityService.getCommunityAnalytics(
                            authentication.getName(),
                            filter,
                            category,
                            date,
                            month
                    )
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );

        } catch (Exception e) {

            return ResponseEntity.internalServerError().body(
                    Map.of(
                            "message",
                            "Unable to load community analytics."
                    )
            );
        }
    }
}