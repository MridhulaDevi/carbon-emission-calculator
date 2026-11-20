
package com.example.carbon_emission.service;

import com.example.carbon_emission.entity.EmissionFactor;
import com.example.carbon_emission.repository.EmissionFactorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminEmissionFactorService {

    private final EmissionFactorRepository repository;

    public AdminEmissionFactorService(
            EmissionFactorRepository repository) {
        this.repository = repository;
    }

    public List<EmissionFactor> getAll() {
        return repository.findAll();
    }

    public EmissionFactor create(EmissionFactor factor) {

        validate(factor);

        if (repository.findByActivityTypeIgnoreCase(
                factor.getActivityType()).isPresent()) {
            throw new RuntimeException(
                    "Activity type already exists"
            );
        }

        factor.setCategory(factor.getCategory().trim().toLowerCase());
        factor.setActivityType(
                factor.getActivityType().trim().toLowerCase()
        );
        factor.setUnit(factor.getUnit().trim());

        return repository.save(factor);
    }

    public EmissionFactor update(
            Long id,
            EmissionFactor updated) {

        EmissionFactor existing = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Emission factor not found"
                        )
                );

        validate(updated);

        String activityType =
                updated.getActivityType().trim().toLowerCase();

        repository.findByActivityTypeIgnoreCase(activityType)
                .ifPresent(other -> {
                    if (!other.getId().equals(id)) {
                        throw new RuntimeException(
                                "Activity type already exists"
                        );
                    }
                });

        existing.setCategory(
                updated.getCategory().trim().toLowerCase()
        );

        existing.setActivityType(activityType);
        existing.setUnit(updated.getUnit().trim());
        existing.setFactor(updated.getFactor());

        return repository.save(existing);
    }

    public void delete(Long id) {

        if (!repository.existsById(id)) {
            throw new RuntimeException(
                    "Emission factor not found"
            );
        }

        repository.deleteById(id);
    }

    private void validate(EmissionFactor factor) {

        if (factor.getCategory() == null ||
                factor.getCategory().isBlank()) {
            throw new RuntimeException(
                    "Category is required"
            );
        }

        if (factor.getActivityType() == null ||
                factor.getActivityType().isBlank()) {
            throw new RuntimeException(
                    "Activity type is required"
            );
        }

        if (factor.getUnit() == null ||
                factor.getUnit().isBlank()) {
            throw new RuntimeException(
                    "Unit is required"
            );
        }

        if (factor.getFactor() == null ||
                !Double.isFinite(factor.getFactor()) ||
                factor.getFactor() < 0) {
            throw new RuntimeException(
                    "Enter a valid emission factor"
            );
        }
    }
}
