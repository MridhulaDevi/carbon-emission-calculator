
package com.example.carbon_emission.service;

import com.example.carbon_emission.dto.ActivityLogRequest;
import com.example.carbon_emission.entity.ActivityLog;
import com.example.carbon_emission.entity.User;
import com.example.carbon_emission.repository.ActivityLogRepository;
import com.example.carbon_emission.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityLogService {

    private final ActivityLogRepository activityRepository;
    private final UserRepository userRepository;
    private final EmissionService emissionService;

    public ActivityLogService(
            ActivityLogRepository activityRepository,
            UserRepository userRepository,
            EmissionService emissionService) {

        this.activityRepository = activityRepository;
        this.userRepository = userRepository;
        this.emissionService = emissionService;
    }

    // ADD ACTIVITY
    public ActivityLog addActivity(
            ActivityLogRequest request,
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        double emission = emissionService.calculateEmission(
                request.getActivityType(),
                request.getQuantity()
        );

        ActivityLog activity = new ActivityLog();

        activity.setCategory(request.getCategory());
        activity.setActivityType(request.getActivityType());
        activity.setQuantity(request.getQuantity());
        activity.setUnit(request.getUnit());
        activity.setLogDate(request.getLogDate());
        activity.setEmission(emission);
        activity.setUser(user);

        return activityRepository.save(activity);
    }

    // GET ACTIVITIES
    public List<ActivityLog> getActivities(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return activityRepository.findByUser(user);
    }

    // UPDATE ACTIVITY
    public ActivityLog updateActivity(
            Long id,
            ActivityLogRequest request,
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        ActivityLog activity = activityRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Activity not found"));

        if (!activity.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        double emission = emissionService.calculateEmission(
                request.getActivityType(),
                request.getQuantity()
        );

        activity.setCategory(request.getCategory());
        activity.setActivityType(request.getActivityType());
        activity.setQuantity(request.getQuantity());
        activity.setUnit(request.getUnit());
        activity.setLogDate(request.getLogDate());
        activity.setEmission(emission);

        return activityRepository.save(activity);
    }

    // DELETE ACTIVITY
    public void deleteActivity(Long id, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        ActivityLog activity = activityRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Activity not found"));

        if (!activity.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        activityRepository.delete(activity);
    }
}
