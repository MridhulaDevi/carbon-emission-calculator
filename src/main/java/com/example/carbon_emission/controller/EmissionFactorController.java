
package com.example.carbon_emission.controller;

import com.example.carbon_emission.entity.EmissionFactor;
import com.example.carbon_emission.service.AdminEmissionFactorService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/emission-factors")
@CrossOrigin(origins = "http://localhost:5173")
public class EmissionFactorController {

    private final AdminEmissionFactorService service;

    public EmissionFactorController(
            AdminEmissionFactorService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<EmissionFactor>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }
}
