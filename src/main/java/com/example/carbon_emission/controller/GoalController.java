
package com.example.carbon_emission.controller;

import com.example.carbon_emission.dto.GoalRequest;
import com.example.carbon_emission.entity.Goal;
import com.example.carbon_emission.entity.User;
import com.example.carbon_emission.repository.UserRepository;
import com.example.carbon_emission.service.GoalService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
@CrossOrigin(origins = "http://localhost:5173")
public class GoalController {

    private final GoalService goalService;
    private final UserRepository userRepository;

    public GoalController(
            GoalService goalService,
            UserRepository userRepository) {
        this.goalService = goalService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> createGoal(
            @RequestBody GoalRequest request,
            Authentication authentication) {

        try {
            User user = userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() ->
                    new RuntimeException("User not found")
                );

            Goal goal = goalService.createGoal(
                user,
                request.getTitle(),
                request.getTarget(),
                request.getStartDate(),
                request.getEndDate()
            );

            return ResponseEntity.ok(goal);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(e.getMessage());

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("Unable to create goal.");
        }
    }

    @GetMapping
    public ResponseEntity<?> getGoals(
            Authentication authentication) {

        try {
            User user = userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() ->
                    new RuntimeException("User not found")
                );

            List<Goal> goals = goalService.getGoals(user);

            return ResponseEntity.ok(goals);

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("Unable to load goals.");
        }
    }
}
