package com.example.carbon_emission.controller;

import com.example.carbon_emission.entity.ActivityLog;
import com.example.carbon_emission.service.AdminActivityService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/activities")
@CrossOrigin(origins = "http://localhost:5173")
@PreAuthorize("hasRole('ADMIN')")
public class AdminActivityController {

    private final AdminActivityService adminActivityService;

    public AdminActivityController(
            AdminActivityService adminActivityService) {

        this.adminActivityService = adminActivityService;
    }

    @GetMapping
    public ResponseEntity<List<ActivityLog>> getAllActivities() {

        return ResponseEntity.ok(
                adminActivityService.getAllActivities()
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateActivity(
            @PathVariable Long id,
            @RequestBody ActivityLog activity) {

        try {
            return ResponseEntity.ok(
                    adminActivityService.updateActivity(id, activity)
            );

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteActivity(
            @PathVariable Long id) {

        try {
            adminActivityService.deleteActivity(id);

            return ResponseEntity.ok(
                    "Activity deleted successfully"
            );

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }
}