package com.example.carbon_emission.service;

import com.example.carbon_emission.entity.*;
import com.example.carbon_emission.repository.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final ActivityLogRepository activityRepository;
    private final UserRepository userRepository;

    public BadgeService(
            BadgeRepository badgeRepository,
            UserBadgeRepository userBadgeRepository,
            ActivityLogRepository activityRepository,
            UserRepository userRepository) {

        this.badgeRepository = badgeRepository;
        this.userBadgeRepository = userBadgeRepository;
        this.activityRepository = activityRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public List<Map<String, Object>> getBadges(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        List<ActivityLog> activities =
                activityRepository.findByUser(user);

        List<UserBadge> earnedBadges =
                userBadgeRepository.findByUserId(user.getId());

        Map<Long, UserBadge> earnedMap = new HashMap<>();

        for (UserBadge earned : earnedBadges) {
            earnedMap.put(earned.getBadge().getId(), earned);
        }

        List<Map<String, Object>> result = new ArrayList<>();

        for (Badge badge :
                badgeRepository.findByActiveTrueOrderByIdAsc()) {

            double progress = calculateProgress(
                    badge.getCriteriaType(),
                    activities
            );

            boolean eligible = isEligible(badge, progress);

            UserBadge earned = earnedMap.get(badge.getId());

            if (eligible && earned == null) {
                earned = userBadgeRepository.save(
                        new UserBadge(user, badge)
                );
                earnedMap.put(badge.getId(), earned);
            }

            Map<String, Object> item = new LinkedHashMap<>();

            item.put("id", badge.getId());
            item.put("name", badge.getName());
            item.put("description", badge.getDescription());
            item.put("icon", badge.getIcon());
            item.put("criteriaType", badge.getCriteriaType());
            item.put("targetValue", badge.getTargetValue());
            item.put("progress", progress);
            item.put("earned", earned != null);
            item.put(
                    "earnedAt",
                    earned == null ? null : earned.getEarnedAt()
            );

            result.add(item);
        }

        return result;
    }

    private boolean isEligible(Badge badge, double progress) {

        if ("MAX_TOTAL_EMISSION".equals(badge.getCriteriaType())) {
            return progress <= badge.getTargetValue();
        }

        return progress >= badge.getTargetValue();
    }

    private double calculateProgress(
            String type,
            List<ActivityLog> activities) {

        return switch (type) {

            case "TOTAL_ACTIVITIES" -> activities.size();

            case "TRANSPORT_ACTIVITIES" ->
                    countCategory(activities, "transport");

            case "ELECTRICITY_ACTIVITIES" ->
                    countCategory(activities, "electricity");

            case "FOOD_ACTIVITIES" ->
                    countCategory(activities, "food");

            case "SHOPPING_ACTIVITIES" ->
                    countCategory(activities, "shopping");

            case "ECO_MEALS" ->
                    activities.stream()
                            .filter(a ->
                                    "vegetarian_meal".equalsIgnoreCase(
                                            a.getActivityType()
                                    )
                                    ||
                                    "vegan_meal".equalsIgnoreCase(
                                            a.getActivityType()
                                    )
                            )
                            .count();

            case "ACTIVE_DAYS" ->
                    activities.stream()
                            .map(ActivityLog::getLogDate)
                            .filter(Objects::nonNull)
                            .distinct()
                            .count();

            case "MAX_TOTAL_EMISSION" ->
                    activities.stream()
                            .mapToDouble(a ->
                                    a.getEmission() == null
                                            ? 0
                                            : a.getEmission()
                            )
                            .sum();

            default -> 0;
        };
    }

    private long countCategory(
            List<ActivityLog> activities,
            String category) {

        return activities.stream()
                .filter(a ->
                        category.equalsIgnoreCase(a.getCategory())
                )
                .count();
    }
}