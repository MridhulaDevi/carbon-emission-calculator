package com.example.carbon_emission.service;

import com.example.carbon_emission.entity.ActivityLog;
import com.example.carbon_emission.entity.Badge;
import com.example.carbon_emission.entity.User;
import com.example.carbon_emission.repository.ActivityLogRepository;
import com.example.carbon_emission.repository.BadgeRepository;
import com.example.carbon_emission.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final ActivityLogRepository activityRepository;
    private final UserRepository userRepository;

    public BadgeService(
            BadgeRepository badgeRepository,
            ActivityLogRepository activityRepository,
            UserRepository userRepository) {

        this.badgeRepository = badgeRepository;
        this.activityRepository = activityRepository;
        this.userRepository = userRepository;
    }

    public List<Badge> getBadges(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        List<ActivityLog> activities =
                activityRepository.findByUser(user);

        return badgeRepository.findAll()
                .stream()
                .filter(badge ->
                        isEligible(badge, activities))
                .toList();
    }

    private boolean isEligible(
            Badge badge,
            List<ActivityLog> activities) {

        if (badge.getName().equalsIgnoreCase("First Activity")) {
            return !activities.isEmpty();
        }

        if (badge.getName().equalsIgnoreCase("Activity Tracker")) {
            return activities.size() >= 7;
        }

        if (badge.getName().equalsIgnoreCase("Low Carbon")) {
            return activities.stream()
                    .mapToDouble(ActivityLog::getEmission)
                    .sum() <= 10;
        }

        return false;
    }
}