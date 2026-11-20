
package com.example.carbon_emission.service;

import com.example.carbon_emission.entity.ActivityLog;
import com.example.carbon_emission.entity.Goal;
import com.example.carbon_emission.entity.User;
import com.example.carbon_emission.repository.ActivityLogRepository;
import com.example.carbon_emission.repository.GoalRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class GoalService {

    private final GoalRepository goalRepository;
    private final ActivityLogRepository activityRepository;

    public GoalService(
            GoalRepository goalRepository,
            ActivityLogRepository activityRepository) {
        this.goalRepository = goalRepository;
        this.activityRepository = activityRepository;
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    @Transactional
    public Goal createGoal(
            User user,
            String title,
            Double target,
            LocalDate startDate,
            LocalDate endDate) {

        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException(
                "Goal name is required."
            );
        }

        if (target == null ||
            !Double.isFinite(target) ||
            target <= 0) {
            throw new IllegalArgumentException(
                "Emission budget must be greater than zero."
            );
        }

        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException(
                "Please select start and end dates."
            );
        }

        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException(
                "End date cannot be before start date."
            );
        }

        if (startDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException(
                "Start date cannot be in the past."
            );
        }

        Goal goal = new Goal();

        goal.setTitle(title.trim());
        goal.setTarget(target);
        goal.setProgress(0.0);
        goal.setUnit("kg CO2e");
        goal.setStatus("UPCOMING");
        goal.setStartDate(startDate);
        goal.setEndDate(endDate);
        goal.setBaselineEmission(null);
        goal.setReductionPercent(null);
        goal.setUser(user);

        Goal saved = goalRepository.save(goal);

        updateProgress(
            saved,
            activityRepository.findByUser(user)
        );

        return saved;
    }

    @Transactional
    public List<Goal> getGoals(User user) {

        List<Goal> goals = goalRepository.findByUser(user);

        List<ActivityLog> activities =
            activityRepository.findByUser(user);

        for (Goal goal : goals) {
            updateProgress(goal, activities);
        }

        return goals;
    }

    private void updateProgress(
            Goal goal,
            List<ActivityLog> activities) {

        if (goal.getStartDate() == null ||
            goal.getEndDate() == null ||
            goal.getTarget() == null ||
            goal.getTarget() <= 0 
            ) {

            goal.setTrackingMessage(
                "Legacy goal. Create a new emission budget goal."
            );
            return;
        }

        LocalDate today = LocalDate.now();

        double totalEmission = activities.stream()
            .filter(a -> a.getLogDate() != null)
            .filter(a -> a.getEmission() != null)
            .filter(a ->
                !a.getLogDate().isBefore(goal.getStartDate())
            )
            .filter(a ->
                !a.getLogDate().isAfter(goal.getEndDate())
            )
            .mapToDouble(ActivityLog::getEmission)
            .sum();

        totalEmission = round(totalEmission);

        double target = goal.getTarget();

        double percentage =
            (totalEmission / target) * 100.0;

        double remaining = Math.max(
            0.0, target - totalEmission
        );

        goal.setProgress(totalEmission);
        goal.setCurrentEmission(totalEmission);
        goal.setReductionAchieved(null);
        goal.setOnTrack(totalEmission <= target);

        if (today.isBefore(goal.getStartDate())) {
            goal.setStatus("UPCOMING");
            goal.setTrackingMessage(
                "Tracking starts on " + goal.getStartDate()
            );
        } else if (today.isAfter(goal.getEndDate())) {

            if (totalEmission <= target) {
                goal.setStatus("COMPLETED");
                goal.setTrackingMessage(
                    "Congratulations! You stayed within your " +
                    "emission budget."
                );
            } else {
                goal.setStatus("EXPIRED");
                goal.setTrackingMessage(
                    "Goal expired. Your emissions exceeded " +
                    "the target budget."
                );
            }

        } else if (totalEmission > target) {
            goal.setStatus("ACTIVE");
            goal.setTrackingMessage(
                "Emission budget exceeded by " +
                round(totalEmission - target) + " kg CO2e."
            );
        } else {
            goal.setStatus("ACTIVE");
            goal.setTrackingMessage(
                "You have " + round(remaining) +
                " kg CO2e remaining in your budget."
            );
        }
    }
}
