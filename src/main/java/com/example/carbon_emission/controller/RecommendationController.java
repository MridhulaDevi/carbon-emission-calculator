
package com.example.carbon_emission.controller;

import com.example.carbon_emission.entity.ActivityLog;
import com.example.carbon_emission.service.ActivityLogService;
import com.example.carbon_emission.service.GroqRecommendationService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final ActivityLogService activityService;
    private final GroqRecommendationService groqService;

    public RecommendationController(
            ActivityLogService activityService,
            GroqRecommendationService groqService) {

        this.activityService = activityService;
        this.groqService = groqService;
    }

    @GetMapping
    public ResponseEntity<?> getRecommendations(
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            return ResponseEntity.status(401).body(
                Map.of("error", "Unauthorized")
            );
        }

        try {
            String email = authentication.getName();

            List<ActivityLog> activities =
                activityService.getActivities(email);

            LocalDate today = LocalDate.now();
            LocalDate startDate = today.minusDays(29);

            List<ActivityLog> recentActivities =
                activities.stream()
                    .filter(a -> a.getLogDate() != null)
                    .filter(a -> !a.getLogDate().isBefore(startDate))
                    .filter(a -> !a.getLogDate().isAfter(today))
                    .collect(Collectors.toList());

            if (recentActivities.isEmpty()) {
                return ResponseEntity.ok(
                    Map.of(
                        "recommendations",
                        "No activities logged in the last 30 days. " +
                        "Log activities to receive personalized recommendations."
                    )
                );
            }

            Map<String, List<ActivityLog>> groupedActivities =
                recentActivities.stream()
                    .collect(Collectors.groupingBy(
                        a -> a.getCategory() + " | " +
                             a.getActivityType()
                    ));

            List<Map.Entry<String, List<ActivityLog>>> topActivities =
                groupedActivities.entrySet()
                    .stream()
                    .sorted((a, b) -> Double.compare(
                        totalEmission(b.getValue()),
                        totalEmission(a.getValue())
                    ))
                    
                    .collect(Collectors.toList());

            StringBuilder activityData = new StringBuilder();

            activityData.append(
                "Reporting period: "
                + startDate + " to " + today + "\n"
            );

            activityData.append(
                "These are the user's  logged activity types " +
                "activity types over the last 30 days, ordered by emission\n\n"
            );

            for (Map.Entry<String, List<ActivityLog>> entry
                    : topActivities) {

                List<ActivityLog> logs = entry.getValue();

                ActivityLog first = logs.get(0);

                activityData.append("Category: ")
                    .append(first.getCategory())
                    .append("\nActivity Type: ")
                    .append(first.getActivityType())
                    .append("\nTotal Emission: ")
                    .append(String.format(
                        Locale.US,
                        "%.2f",
                        totalEmission(logs)
                    ))
                    .append(" kg CO2e")
                    .append("\nNumber of Logs: ")
                    .append(logs.size())
                    .append("\nIndividual Activities:\n");

                for (ActivityLog log : logs) {
                    activityData.append("- Quantity: ")
                        .append(log.getQuantity())
                        .append(" ")
                        .append(log.getUnit())
                        .append(", Emission: ")
                        .append(log.getEmission())
                        .append(" kg CO2e")
                        .append(", Date: ")
                        .append(log.getLogDate())
                        .append("\n");
                }

                activityData.append("\n");
            }

            String recommendations =
                groqService.generateRecommendations(
                    activityData.toString()
                );

            return ResponseEntity.ok(
                Map.of("recommendations", recommendations)
            );

        } catch (Exception e) {
            e.printStackTrace();

            return ResponseEntity.internalServerError().body(
                Map.of(
                    "error",
                    "Unable to generate recommendations"
                )
            );
        }
    }

    private double totalEmission(List<ActivityLog> logs) {

        return logs.stream()
            .mapToDouble(a ->
                a.getEmission() == null
                    ? 0.0
                    : a.getEmission().doubleValue()
            )
            .sum();
    }
}
