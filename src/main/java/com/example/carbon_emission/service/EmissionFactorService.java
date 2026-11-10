package com.example.carbon_emission.service;

import com.example.carbon_emission.entity.EmissionFactor;
import com.example.carbon_emission.repository.EmissionFactorRepository;
import org.springframework.stereotype.Service;

@Service
public class EmissionFactorService {

    private final EmissionFactorRepository repository;

    public EmissionFactorService(EmissionFactorRepository repository) {
        this.repository = repository;
    }

    public double calculateEmission(String activityType, double quantity) {

        if (quantity < 0) {
            throw new IllegalArgumentException("Quantity cannot be negative");
        }

        EmissionFactor factor = repository
                .findByActivityTypeIgnoreCase(activityType.trim())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Unknown activity type: " + activityType));

        return quantity * factor.getFactor();
    }
}