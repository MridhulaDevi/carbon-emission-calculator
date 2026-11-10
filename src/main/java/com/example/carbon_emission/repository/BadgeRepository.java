package com.example.carbon_emission.repository;

import com.example.carbon_emission.entity.Badge;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BadgeRepository extends JpaRepository<Badge, Long> {
}