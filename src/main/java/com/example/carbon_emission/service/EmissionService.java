package com.example.carbon_emission.service;

import org.springframework.stereotype.Service;

@Service
public class EmissionService {

    private final EmissionFactorService emissionFactorService;

    public EmissionService(
            EmissionFactorService emissionFactorService) {
        this.emissionFactorService = emissionFactorService;
    }

    public double calculateEmission(
            String activityType,
            double quantity) {

        return emissionFactorService.calculateEmission(
                activityType,
                quantity
        );
    }
}