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

        if (repository.findByActivityTypeIgnoreCase(
                factor.getActivityType()
        ).isPresent()) {

            throw new RuntimeException(
                    "Activity type already exists"
            );
        }

        return repository.save(factor);
    }

    public EmissionFactor update(
            Long id,
            EmissionFactor updated) {

        EmissionFactor existing = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Emission factor not found"
                        ));

        existing.setActivityType(updated.getActivityType());
        existing.setUnit(updated.getUnit());
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
}