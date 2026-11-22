package com.example.carbon_emission.repository;

import com.example.carbon_emission.entity.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserBadgeRepository
        extends JpaRepository<UserBadge, Long> {

    List<UserBadge> findByUserId(Long userId);

    Optional<UserBadge> findByUserIdAndBadgeId(
            Long userId,
            Long badgeId
    );

    void deleteByBadgeId(Long badgeId);
}