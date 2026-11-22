package com.example.carbon_emission.controller;

import com.example.carbon_emission.entity.Badge;
import com.example.carbon_emission.repository.BadgeRepository;
import com.example.carbon_emission.repository.UserBadgeRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/admin/badges")
@CrossOrigin(origins = "http://localhost:5173")
@PreAuthorize("hasRole('ADMIN')")
public class AdminBadgeController {

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;

    private static final Set<String> CRITERIA = Set.of(
            "TOTAL_ACTIVITIES",
            "TRANSPORT_ACTIVITIES",
            "ELECTRICITY_ACTIVITIES",
            "FOOD_ACTIVITIES",
            "SHOPPING_ACTIVITIES",
            "ECO_MEALS",
            "ACTIVE_DAYS",
            "MAX_TOTAL_EMISSION"
    );

    public AdminBadgeController(
            BadgeRepository badgeRepository,
            UserBadgeRepository userBadgeRepository) {

        this.badgeRepository = badgeRepository;
        this.userBadgeRepository = userBadgeRepository;
    }

    @GetMapping
    public List<Badge> getAll() {
        return badgeRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Badge> create(@RequestBody Badge input) {

        validate(input);

        Badge badge = new Badge();
        copyFields(input, badge);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(badgeRepository.save(badge));
    }

    @PutMapping("/{id}")
    @Transactional
    public Badge update(
            @PathVariable Long id,
            @RequestBody Badge input) {

        validate(input);

        Badge badge = findBadge(id);

        boolean criteriaChanged =
                !badge.getCriteriaType().equals(input.getCriteriaType())
                || !badge.getTargetValue().equals(input.getTargetValue());

        if (criteriaChanged) {
            userBadgeRepository.deleteByBadgeId(id);
        }

        copyFields(input, badge);

        return badgeRepository.save(badge);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable Long id) {

        findBadge(id);

        userBadgeRepository.deleteByBadgeId(id);
        badgeRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }

    private Badge findBadge(Long id) {
        return badgeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Badge not found"
                ));
    }

    private void validate(Badge badge) {

        if (badge.getName() == null
                || badge.getName().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Badge name is required"
            );
        }

        if (!CRITERIA.contains(badge.getCriteriaType())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid badge criteria"
            );
        }

        Double target = badge.getTargetValue();

        if (target == null
                || !Double.isFinite(target)
                || target < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Target must be a valid non-negative number"
            );
        }

        if (!"MAX_TOTAL_EMISSION".equals(badge.getCriteriaType())
                && (target < 1 || target % 1 != 0)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Activity and day targets must be positive whole numbers"
            );
        }
    }

    private void copyFields(Badge source, Badge target) {

        target.setName(source.getName().trim());
        target.setDescription(source.getDescription());
        target.setIcon("gold");
        target.setCriteriaType(source.getCriteriaType());
        target.setTargetValue(source.getTargetValue());
        target.setActive(
                source.getActive() == null
                        ? true
                        : source.getActive()
        );
    }
}