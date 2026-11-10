package com.example.carbon_emission.controller;

import com.example.carbon_emission.dto.ActivityLogRequest;
import com.example.carbon_emission.entity.ActivityLog;
import com.example.carbon_emission.service.ActivityLogService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
@CrossOrigin(origins = "http://localhost:5173")
public class ActivityLogController {

    private final ActivityLogService activityService;

    public ActivityLogController(
            ActivityLogService activityService) {

        this.activityService = activityService;
    }

    // ADD ACTIVITY
    @PostMapping
    public ResponseEntity<?> addActivity(
            @RequestBody ActivityLogRequest request,
            Authentication authentication) {

        try {

            ActivityLog activity =
                    activityService.addActivity(
                            request,
                            authentication.getName()
                    );

            return ResponseEntity.ok(activity);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // GET ACTIVITIES
    @GetMapping
    public ResponseEntity<?> getActivities(
            Authentication authentication) {

        try {

            List<ActivityLog> activities =
                    activityService.getActivities(
                            authentication.getName()
                    );

            return ResponseEntity.ok(activities);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // DELETE ACTIVITY
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteActivity(
            @PathVariable Long id,
            Authentication authentication) {

        try {

            activityService.deleteActivity(
                    id,
                    authentication.getName()
            );

            return ResponseEntity.ok(
                    "Activity deleted successfully"
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}