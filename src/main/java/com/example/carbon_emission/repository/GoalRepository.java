package com.example.carbon_emission.repository;

import com.example.carbon_emission.entity.Goal;
import com.example.carbon_emission.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GoalRepository extends JpaRepository<Goal, Long> {

    List<Goal> findByUser(User user);
}