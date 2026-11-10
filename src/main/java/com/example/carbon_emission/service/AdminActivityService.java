package com.example.carbon_emission.service;

import com.example.carbon_emission.entity.ActivityLog;
import com.example.carbon_emission.repository.ActivityLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminActivityService {

    private final ActivityLogRepository activityLogRepository;
    private final EmissionService emissionService;

    public AdminActivityService(
            ActivityLogRepository activityLogRepository,
            EmissionService emissionService) {

        this.activityLogRepository = activityLogRepository;
        this.emissionService = emissionService;
    }

    public List<ActivityLog> getAllActivities() {

        return activityLogRepository.findAll();
    }

    public ActivityLog updateActivity(
            Long id,
            ActivityLog updatedActivity) {

        ActivityLog existing =
                activityLogRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Activity not found with id: " + id
                                ));

        existing.setCategory(
                updatedActivity.getCategory()
        );

        existing.setActivityType(
                updatedActivity.getActivityType()
        );

        existing.setQuantity(
                updatedActivity.getQuantity()
        );

        existing.setUnit(
                updatedActivity.getUnit()
        );

        existing.setLogDate(
                updatedActivity.getLogDate()
        );

        double emission =
                emissionService.calculateEmission(
                        updatedActivity.getActivityType(),
                        updatedActivity.getQuantity()
                );

        existing.setEmission(emission);

        return activityLogRepository.save(existing);
    }

    public void deleteActivity(Long id) {

        if (!activityLogRepository.existsById(id)) {

            throw new RuntimeException(
                    "Activity not found with id: " + id
            );
        }

        activityLogRepository.deleteById(id);
    }
}