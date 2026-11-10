package com.example.carbon_emission.controller;

import com.example.carbon_emission.entity.EmissionFactor;
import com.example.carbon_emission.service.AdminEmissionFactorService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/emission-factors")
@CrossOrigin(origins = "http://localhost:5173")
@PreAuthorize("hasRole('ADMIN')")
public class AdminEmissionFactorController {

    private final AdminEmissionFactorService service;

    public AdminEmissionFactorController(
            AdminEmissionFactorService service) {

        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<EmissionFactor>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @PostMapping
    public ResponseEntity<?> create(
            @RequestBody EmissionFactor factor) {

        try {
            return ResponseEntity.ok(
                    service.create(factor)
            );

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody EmissionFactor factor) {

        try {
            return ResponseEntity.ok(
                    service.update(id, factor)
            );

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @PathVariable Long id) {

        try {
            service.delete(id);

            return ResponseEntity.ok(
                    "Emission factor deleted successfully"
            );

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }
}