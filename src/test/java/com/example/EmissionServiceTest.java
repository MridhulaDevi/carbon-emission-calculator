package com.example;

import com.example.carbon_emission.entity.EmissionFactor;
import com.example.carbon_emission.repository.EmissionFactorRepository;
import com.example.carbon_emission.service.EmissionFactorService;
import com.example.carbon_emission.service.EmissionService;

import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EmissionServiceTest {

    private final EmissionFactorRepository repository =
            mock(EmissionFactorRepository.class);

    private final EmissionFactorService factorService =
            new EmissionFactorService(repository);

    private final EmissionService emissionService =
            new EmissionService(factorService);

    @Test
    void testCarEmission() {

        when(repository.findByActivityTypeIgnoreCase("car"))
                .thenReturn(Optional.of(
                        new EmissionFactor("car", "km", 0.21)
                ));

        double result =
                emissionService.calculateEmission("car", 100);

        assertEquals(21.0, result);
    }

    @Test
    void testFlightEmission() {

        when(repository.findByActivityTypeIgnoreCase("flight"))
                .thenReturn(Optional.of(
                        new EmissionFactor("flight", "km", 0.25)
                ));

        double result =
                emissionService.calculateEmission("flight", 200);

        assertEquals(50.0, result);
    }

    @Test
    void testElectricityEmission() {

        when(repository.findByActivityTypeIgnoreCase("electricity"))
                .thenReturn(Optional.of(
                        new EmissionFactor("electricity", "kWh", 0.82)
                ));

        double result =
                emissionService.calculateEmission("electricity", 100);

        assertEquals(82.0, result);
    }

    @Test
    void testFoodEmission() {

        when(repository.findByActivityTypeIgnoreCase("vegetarian_meal"))
                .thenReturn(Optional.of(
                        new EmissionFactor(
                                "vegetarian_meal",
                                "serving",
                                1.70
                        )
                ));

        double result =
                emissionService.calculateEmission(
                        "vegetarian_meal", 2
                );

        assertEquals(3.40, result);
    }

    @Test
    void testZeroQuantity() {

        when(repository.findByActivityTypeIgnoreCase("car"))
                .thenReturn(Optional.of(
                        new EmissionFactor("car", "km", 0.21)
                ));

        double result =
                emissionService.calculateEmission("car", 0);

        assertEquals(0.0, result);
    }

    @Test
    void testNegativeQuantity() {

        assertThrows(
                IllegalArgumentException.class,
                () -> emissionService.calculateEmission("car", -1)
        );
    }

    @Test
    void testUnknownActivityType() {

        when(repository.findByActivityTypeIgnoreCase("unknown"))
                .thenReturn(Optional.empty());

        assertThrows(
                RuntimeException.class,
                () -> emissionService.calculateEmission(
                        "unknown", 10
                )
        );
    }

    @Test
void testCaseInsensitiveActivityType() {

    EmissionFactor carFactor =
            new EmissionFactor("car", "km", 0.21);

    when(repository.findByActivityTypeIgnoreCase("CAR"))
            .thenReturn(Optional.of(carFactor));

    double result =
            emissionService.calculateEmission("CAR", 100);

    assertEquals(21.0, result);
}
}