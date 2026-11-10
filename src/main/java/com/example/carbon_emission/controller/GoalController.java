package com.example.carbon_emission.controller;

import com.example.carbon_emission.dto.GoalRequest;
import com.example.carbon_emission.entity.Goal;
import com.example.carbon_emission.entity.User;
import com.example.carbon_emission.repository.GoalRepository;
import com.example.carbon_emission.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
@CrossOrigin(origins = "http://localhost:5173")
public class GoalController {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;

    public GoalController(
            GoalRepository goalRepository,
            UserRepository userRepository) {

        this.goalRepository = goalRepository;
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
                            new RuntimeException("User not found"));

            Goal goal = new Goal();

            goal.setTitle(request.getTitle());
            goal.setTarget(request.getTarget());
            goal.setUnit(request.getUnit());
            goal.setProgress(0.0);
            goal.setStatus("ACTIVE");
            goal.setUser(user);

            return ResponseEntity.ok(
                    goalRepository.save(goal)
            );

        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getGoals(
            Authentication authentication) {

        try {
            User user = userRepository
                    .findByEmail(authentication.getName())
                    .orElseThrow(() ->
                            new RuntimeException("User not found"));

            List<Goal> goals =
                    goalRepository.findByUser(user);

            return ResponseEntity.ok(goals);

        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}