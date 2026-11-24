package com.example.carbon_emission.service;

import com.example.carbon_emission.entity.ActivityLog;
import com.example.carbon_emission.entity.User;
import com.example.carbon_emission.repository.ActivityLogRepository;
import com.example.carbon_emission.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CommunityAnalyticsService {

    private final ActivityLogRepository activityRepository;
    private final UserRepository userRepository;

    private static final int MIN_PEERS = 1;

    private static final List<String> CATEGORIES = List.of(
            "transport",
            "electricity",
            "food",
            "shopping"
    );

    public CommunityAnalyticsService(
            ActivityLogRepository activityRepository,
            UserRepository userRepository) {

        this.activityRepository = activityRepository;
        this.userRepository = userRepository;
    }

    // ==========================================
    // MAIN COMMUNITY ANALYTICS
    // ==========================================

    @Transactional(readOnly = true)
    public Map<String, Object> getCommunityAnalytics(
            String email,
            String filter,
            String category,
            String date,
            String month) {

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found"
                        )
                );

        Long currentUserId = currentUser.getId();

        filter = filter == null
                ? "all"
                : filter.trim().toLowerCase(Locale.ROOT);

        category = category == null
                ? "all"
                : category.trim().toLowerCase(Locale.ROOT);

        if (!List.of("day", "month", "all").contains(filter)) {

            throw new IllegalArgumentException(
                    "Invalid date filter"
            );
        }

        if (!category.equals("all")
                && !CATEGORIES.contains(category)) {

            throw new IllegalArgumentException(
                    "Invalid category"
            );
        }

        LocalDate selectedDate = LocalDate.now();
        YearMonth selectedMonth = YearMonth.now();

        try {

            if (filter.equals("day")
                    && date != null
                    && !date.isBlank()) {

                selectedDate = LocalDate.parse(date);
            }

            if (filter.equals("month")
                    && month != null
                    && !month.isBlank()) {

                selectedMonth = YearMonth.parse(month);
            }

        } catch (Exception e) {

            throw new IllegalArgumentException(
                    "Invalid date or month"
            );
        }

        final String selectedFilter = filter;
        final String selectedCategory = category;

        final LocalDate targetDate = selectedDate;
        final YearMonth targetMonth = selectedMonth;

        // ==========================================
        // FETCH ACTIVITIES
        // ==========================================

        List<ActivityLog> allActivities =
                activityRepository.findAll()
                        .stream()
                        .filter(this::isValidActivity)
                        .collect(Collectors.toList());

        // ==========================================
        // FILTER BY PERIOD
        // ==========================================

        List<ActivityLog> periodActivities =
                allActivities.stream()
                        .filter(activity ->
                                matchesDate(
                                        activity,
                                        selectedFilter,
                                        targetDate,
                                        targetMonth
                                )
                        )
                        .collect(Collectors.toList());

        // ==========================================
        // FILTER BY CATEGORY
        // ==========================================

        List<ActivityLog> filteredActivities =
                periodActivities.stream()
                        .filter(activity ->
                                selectedCategory.equals("all")
                                        || selectedCategory.equals(
                                        normalizeCategory(
                                                activity.getCategory()
                                        )
                                )
                        )
                        .collect(Collectors.toList());

        // ==========================================
        // GROUP ACTIVITIES BY USER
        // ==========================================

        Map<Long, List<ActivityLog>> groupedActivities =
                filteredActivities.stream()
                        .collect(
                                Collectors.groupingBy(
                                        activity ->
                                                activity.getUser().getId()
                                )
                        );

        // ==========================================
        // BUILD LEADERBOARD
        // ==========================================

        List<Map<String, Object>> leaderboard =
                new ArrayList<>();

        Map<Long, Double> userEmissions =
                new HashMap<>();

        for (Map.Entry<Long, List<ActivityLog>> entry
                : groupedActivities.entrySet()) {

            Long userId = entry.getKey();

            List<ActivityLog> userActivities =
                    entry.getValue();

            User user = userActivities.get(0).getUser();

            double totalEmission =
                    calculateTotal(userActivities);

            userEmissions.put(
                    userId,
                    totalEmission
            );

            Map<String, Object> member =
                    new LinkedHashMap<>();

            member.put("userId", userId);

            member.put(
                    "name",
                    getDisplayName(user)
            );

            member.put(
                    "userName",
                    getDisplayName(user)
            );

            member.put(
                    "totalEmission",
                    round(totalEmission)
            );

            member.put(
                    "activityCount",
                    userActivities.size()
            );

            member.put(
                    "isCurrentUser",
                    userId.equals(currentUserId)
            );

            leaderboard.add(member);
        }

        // ==========================================
        // LOWEST EMISSION LEADERBOARD
        // ==========================================

        leaderboard.sort(
                Comparator.<Map<String, Object>>comparingDouble(
                        member ->
                                userEmissions.get(
                                        (Long) member.get("userId")
                                )
                ).thenComparing(
                        member ->
                                String.valueOf(member.get("name"))
                ).thenComparingLong(
                        member ->
                                ((Number) member.get("userId"))
                                        .longValue()
                )
        );

        Integer myRank = null;

        for (int i = 0; i < leaderboard.size(); i++) {

            Map<String, Object> member =
                    leaderboard.get(i);

            member.put("rank", i + 1);

            if (Boolean.TRUE.equals(
                    member.get("isCurrentUser"))) {

                myRank = i + 1;
            }
        }

        // ==========================================
        // MOST ACTIVE USERS LEADERBOARD
        // ==========================================

        List<Map<String, Object>> activityLeaderboard =
                new ArrayList<>();

        for (Map<String, Object> member : leaderboard) {

            activityLeaderboard.add(
                    new LinkedHashMap<>(member)
            );
        }

        activityLeaderboard.sort(
                Comparator.<Map<String, Object>>comparingInt(
                        member ->
                                ((Number) member.get(
                                        "activityCount"
                                )).intValue()
                ).reversed().thenComparingDouble(
                        member ->
                                userEmissions.get(
                                        (Long) member.get("userId")
                                )
                ).thenComparing(
                        member ->
                                String.valueOf(member.get("name"))
                ).thenComparingLong(
                        member ->
                                ((Number) member.get("userId"))
                                        .longValue()
                )
        );

        Integer myActivityRank = null;

        for (int i = 0;
                i < activityLeaderboard.size();
                i++) {

            Map<String, Object> member =
                    activityLeaderboard.get(i);

            member.put("rank", i + 1);

            if (Boolean.TRUE.equals(
                    member.get("isCurrentUser"))) {

                myActivityRank = i + 1;
            }
        }

        // ==========================================
        // CURRENT USER EMISSIONS
        // ==========================================

        boolean currentUserActive =
                userEmissions.containsKey(currentUserId);

        double myEmission =
                userEmissions.getOrDefault(
                        currentUserId,
                        0.0
                );

        int myActivityCount =
                groupedActivities.getOrDefault(
                        currentUserId,
                        Collections.emptyList()
                ).size();

        // ==========================================
        // PEER BENCHMARKING
        // EXCLUDE CURRENT USER
        // ==========================================

        List<Double> peerEmissions =
                userEmissions.entrySet()
                        .stream()
                        .filter(entry ->
                                !entry.getKey().equals(
                                        currentUserId
                                )
                        )
                        .map(Map.Entry::getValue)
                        .collect(Collectors.toList());

        int peerCount = peerEmissions.size();

        boolean benchmarkAvailable =
                currentUserActive
                        && peerCount >= MIN_PEERS;

        Double peerAverage = null;
        Double percentile = null;
        Double difference = null;
        Double percentageDifference = null;

        String comparisonStatus = "unavailable";

        if (benchmarkAvailable) {

            double actualPeerAverage =
                    peerEmissions.stream()
                            .mapToDouble(Double::doubleValue)
                            .average()
                            .orElse(0.0);

            peerAverage = round(actualPeerAverage);

            difference = round(
                    myEmission - actualPeerAverage
            );

            if (actualPeerAverage > 0) {

                percentageDifference = round(
                        ((myEmission - actualPeerAverage)
                                / actualPeerAverage) * 100
                );
            }

            long higherEmissionPeers =
                    peerEmissions.stream()
                            .filter(value -> value > myEmission)
                            .count();

            percentile = round(
                    higherEmissionPeers * 100.0 / peerCount
            );

            if (myEmission < actualPeerAverage) {

                comparisonStatus = "lower";

            } else if (myEmission > actualPeerAverage) {

                comparisonStatus = "higher";

            } else {

                comparisonStatus = "equal";
            }
        }

        // ==========================================
        // CATEGORY-WISE BENCHMARKING
        // ==========================================

        Map<String, Object> categoryBenchmark =
                new LinkedHashMap<>();

        Set<Long> eligiblePeers =
                new HashSet<>(
                        groupedActivities.keySet()
                );

        eligiblePeers.remove(currentUserId);

        for (String currentCategory : CATEGORIES) {

            List<ActivityLog> categoryActivities =
                    periodActivities.stream()
                            .filter(activity ->
                                    currentCategory.equals(
                                            normalizeCategory(
                                                    activity.getCategory()
                                            )
                                    )
                            )
                            .collect(Collectors.toList());

            Map<Long, Double> categoryTotals =
                    new HashMap<>();

            for (ActivityLog activity : categoryActivities) {

                Long userId =
                        activity.getUser().getId();

                categoryTotals.merge(
                        userId,
                        activity.getEmission(),
                        Double::sum
                );
            }

            double myCategoryEmission =
                    categoryTotals.getOrDefault(
                            currentUserId,
                            0.0
                    );

            Double categoryPeerAverage = null;

            if (benchmarkAvailable) {

                double totalPeerCategoryEmission =
                        eligiblePeers.stream()
                                .mapToDouble(userId ->
                                        categoryTotals.getOrDefault(
                                                userId,
                                                0.0
                                        )
                                )
                                .sum();

                categoryPeerAverage = round(
                        totalPeerCategoryEmission
                                / eligiblePeers.size()
                );
            }

            Map<String, Object> categoryResult =
                    new LinkedHashMap<>();

            categoryResult.put(
                    "myEmission",
                    round(myCategoryEmission)
            );

            categoryResult.put(
                    "peerAverage",
                    categoryPeerAverage
            );

            categoryBenchmark.put(
                    currentCategory,
                    categoryResult
            );
        }

        // ==========================================
        // BUILD BENCHMARK RESPONSE
        // ==========================================

        Map<String, Object> benchmark =
                new LinkedHashMap<>();

        benchmark.put(
                "available",
                benchmarkAvailable
        );

        benchmark.put(
                "benchmarkAvailable",
                benchmarkAvailable
        );

        benchmark.put(
                "myEmission",
                round(myEmission)
        );

        benchmark.put(
                "peerAverage",
                peerAverage
        );

        benchmark.put(
                "percentile",
                percentile
        );

        benchmark.put(
                "peerCount",
                peerCount
        );

        benchmark.put(
                "difference",
                difference
        );

        benchmark.put(
                "percentageDifference",
                percentageDifference
        );

        benchmark.put(
                "comparisonStatus",
                comparisonStatus
        );

        benchmark.put(
                "myRank",
                myRank
        );

        benchmark.put(
                "myActivityRank",
                myActivityRank
        );

        benchmark.put(
                "myActivityCount",
                myActivityCount
        );

        benchmark.put(
                "categories",
                categoryBenchmark
        );

        // ==========================================
        // COMMUNITY ACTIVITY FEED
        // ==========================================

        List<Map<String, Object>> posts =
                new ArrayList<>();

        List<ActivityLog> recentActivities =
                filteredActivities.stream()
                        .filter(activity ->
                                !activity.getUser().getId()
                                        .equals(currentUserId)
                        )
                        .sorted(
                                Comparator.comparing(
                                        ActivityLog::getLogDate
                                ).reversed().thenComparing(
                                        ActivityLog::getId,
                                        Comparator.nullsLast(
                                                Comparator.reverseOrder()
                                        )
                                )
                        )
                        .limit(30)
                        .collect(Collectors.toList());

        for (ActivityLog activity : recentActivities) {

            User user = activity.getUser();

            String activityName =
                    formatActivityName(
                            activity.getActivityType()
                    );

            String description =
                    buildActivityDescription(activity);

            Map<String, Object> post =
                    new LinkedHashMap<>();

            post.put(
                    "id",
                    activity.getId()
            );

            post.put(
                    "activityId",
                    activity.getId()
            );

            post.put(
                    "userId",
                    user.getId()
            );

            post.put(
                    "name",
                    getDisplayName(user)
            );

            post.put(
                    "userName",
                    getDisplayName(user)
            );

            post.put(
                    "category",
                    normalizeCategory(
                            activity.getCategory()
                    )
            );

            post.put(
                    "activityType",
                    activity.getActivityType()
            );

            post.put(
                    "activityName",
                    activityName
            );

            post.put(
                    "quantity",
                    activity.getQuantity()
            );

            post.put(
                    "unit",
                    activity.getUnit()
            );

            post.put(
                    "emission",
                    round(activity.getEmission())
            );

            post.put(
                    "totalEmission",
                    round(activity.getEmission())
            );

            post.put(
                    "logDate",
                    activity.getLogDate().toString()
            );

            post.put(
                    "date",
                    activity.getLogDate().toString()
            );

            post.put(
                    "description",
                    description
            );

            post.put(
                    "message",
                    description
            );

            post.put(
                    "isCurrentUser",
                    false
            );

            posts.add(post);
        }

        // ==========================================
        // FINAL API RESPONSE
        // ==========================================

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "activeUsers",
                groupedActivities.size()
        );

        response.put(
                "totalActivities",
                filteredActivities.size()
        );

        response.put(
                "leaderboard",
                leaderboard
        );

        response.put(
                "activityLeaderboard",
                activityLeaderboard
        );

        response.put(
                "myRank",
                myRank
        );

        response.put(
                "myActivityRank",
                myActivityRank
        );

        response.put(
                "benchmark",
                benchmark
        );

        response.put(
                "posts",
                posts
        );

        return response;
    }

    // ==========================================
    // VALIDATE ACTIVITY
    // ==========================================

    private boolean isValidActivity(
            ActivityLog activity) {

        if (activity == null
                || activity.getUser() == null
                || activity.getUser().getId() == null
                || activity.getLogDate() == null
                || activity.getEmission() == null) {

            return false;
        }

        if (!Double.isFinite(activity.getEmission())
                || activity.getEmission() < 0) {

            return false;
        }

        String role = activity.getUser().getRole();

        if ("ADMIN".equalsIgnoreCase(role)
                || "ROLE_ADMIN".equalsIgnoreCase(role)) {

            return false;
        }

        return CATEGORIES.contains(
                normalizeCategory(activity.getCategory())
        );
    }

    // ==========================================
    // DATE MATCHING
    // ==========================================

    private boolean matchesDate(
            ActivityLog activity,
            String filter,
            LocalDate selectedDate,
            YearMonth selectedMonth) {

        LocalDate activityDate =
                activity.getLogDate();

        return switch (filter) {

            case "day" ->
                    activityDate.equals(selectedDate);

            case "month" ->
                    YearMonth.from(activityDate)
                            .equals(selectedMonth);

            case "all" -> true;

            default -> false;
        };
    }

    // ==========================================
    // CALCULATE TOTAL EMISSIONS
    // ==========================================

    private double calculateTotal(
            List<ActivityLog> activities) {

        return activities.stream()
                .mapToDouble(ActivityLog::getEmission)
                .sum();
    }

    // ==========================================
    // USER DISPLAY NAME
    // ==========================================

    private String getDisplayName(User user) {

        if (user.getName() == null
                || user.getName().isBlank()) {

            return "Community Member";
        }

        return user.getName();
    }

    // ==========================================
    // FORMAT ACTIVITY NAME
    // ==========================================

    private String formatActivityName(String activityType) {

        if (activityType == null
                || activityType.isBlank()) {

            return "Activity";
        }

        String formatted = activityType
                .replace("_", " ")
                .replace("-", " ")
                .trim();

        if (formatted.isEmpty()) {

            return "Activity";
        }

        return formatted.substring(0, 1)
                .toUpperCase(Locale.ROOT)
                + formatted.substring(1);
    }

    // ==========================================
    // BUILD COMMUNITY POST DESCRIPTION
    // ==========================================

    private String buildActivityDescription(
            ActivityLog activity) {

        String activityName =
                formatActivityName(
                        activity.getActivityType()
                );

        String quantity =
                activity.getQuantity() == null
                        ? ""
                        : String.valueOf(
                                round(activity.getQuantity())
                        );

        String unit =
                activity.getUnit() == null
                        ? ""
                        : activity.getUnit();

        String amount =
                (quantity + " " + unit).trim();

        if (amount.isEmpty()) {

            return "Logged " + activityName
                    + " with "
                    + round(activity.getEmission())
                    + " kg CO2e emissions.";
        }

        return "Logged " + activityName
                + " (" + amount + ") with "
                + round(activity.getEmission())
                + " kg CO2e emissions.";
    }

    // ==========================================
    // NORMALIZE CATEGORY
    // ==========================================

    private String normalizeCategory(String category) {

        return category == null
                ? ""
                : category.trim()
                        .toLowerCase(Locale.ROOT);
    }

    // ==========================================
    // ROUND TO TWO DECIMAL PLACES
    // ==========================================

    private double round(double value) {

        return Math.round(value * 100.0) / 100.0;
    }
}