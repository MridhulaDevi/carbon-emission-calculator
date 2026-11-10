package com.example.carbon_emission.repository;

import com.example.carbon_emission.entity.ActivityLog;
import com.example.carbon_emission.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityLogRepository
        extends JpaRepository<ActivityLog, Long> {

    List<ActivityLog> findByUser(User user);

    void deleteByUser(User user);
}