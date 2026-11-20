
package com.example.carbon_emission.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "emission_factors")
public class EmissionFactor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String category;

    @Column(
        name = "activity_type",
        unique = true,
        nullable = false
    )
    private String activityType;

    @Column(nullable = false)
    private String unit;

    @Column(nullable = false)
    private Double factor;

    public EmissionFactor() {
    }

    public EmissionFactor(
            String category,
            String activityType,
            String unit,
            Double factor) {

        this.category = category;
        this.activityType = activityType;
        this.unit = unit;
        this.factor = factor;
    }

    // Retain compatibility with existing constructor calls.
    public EmissionFactor(
            String activityType,
            String unit,
            Double factor) {

        this.activityType = activityType;
        this.unit = unit;
        this.factor = factor;
    }

    public Long getId() {
        return id;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getActivityType() {
        return activityType;
    }

    public void setActivityType(String activityType) {
        this.activityType = activityType;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public Double getFactor() {
        return factor;
    }

    public void setFactor(Double factor) {
        this.factor = factor;
    }
}
