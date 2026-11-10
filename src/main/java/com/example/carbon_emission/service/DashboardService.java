package com.example.carbon_emission.service;

import com.example.carbon_emission.entity.ActivityLog;
import com.example.carbon_emission.entity.User;
import com.example.carbon_emission.repository.ActivityLogRepository;
import com.example.carbon_emission.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final ActivityLogRepository activityRepository;
    private final UserRepository userRepository;

    public DashboardService(
            ActivityLogRepository activityRepository,
            UserRepository userRepository) {

        this.activityRepository = activityRepository;
        this.userRepository = userRepository;
    }

    public Map<String, Object> getDashboard(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        List<ActivityLog> activities =
                activityRepository.findByUser(user);

        double total = 0;
        double today = 0;
        double month = 0;

        LocalDate now = LocalDate.now();

        for (ActivityLog activity : activities) {

            double emission = activity.getEmission();

            total += emission;

            if (activity.getLogDate().equals(now)) {
                today += emission;
            }

            if (activity.getLogDate().getYear() == now.getYear()
                    && activity.getLogDate().getMonth() == now.getMonth()) {
                month += emission;
            }
        }

        Map<String, Object> dashboard = new HashMap<>();

        dashboard.put("totalEmission", total);
        dashboard.put("todayEmission", today);
        dashboard.put("monthEmission", month);
        dashboard.put("activityCount", activities.size());
        dashboard.put("recentActivities",
                activities.stream()
                        .limit(5)
                        .toList());

        return dashboard;
    }
}