
package com.example.carbon_emission.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "goals")
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private Double target;
    private Double progress;
    private String unit;
    private String status;

    private LocalDate startDate;
    private LocalDate endDate;
    private Double baselineEmission;
    private Double reductionPercent;

    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "user_id")
    private User user;

    @Transient
    private Double currentEmission;

    @Transient
    private Double reductionAchieved;

    @Transient
    private String trackingMessage;

    @Transient
    private Boolean onTrack;

    @Transient
    private Integer baselineLoggedDays;

    @Transient
    private Integer currentLoggedDays;

    public Goal() {}

    public Long getId() { return id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Double getTarget() { return target; }
    public void setTarget(Double target) { this.target = target; }

    public Double getProgress() { return progress; }
    public void setProgress(Double progress) { this.progress = progress; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Double getBaselineEmission() {
        return baselineEmission;
    }
    public void setBaselineEmission(Double value) {
        this.baselineEmission = value;
    }

    public Double getReductionPercent() {
        return reductionPercent;
    }
    public void setReductionPercent(Double value) {
        this.reductionPercent = value;
    }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Double getCurrentEmission() {
        return currentEmission;
    }
    public void setCurrentEmission(Double value) {
        this.currentEmission = value;
    }

    public Double getReductionAchieved() {
        return reductionAchieved;
    }
    public void setReductionAchieved(Double value) {
        this.reductionAchieved = value;
    }

    public String getTrackingMessage() {
        return trackingMessage;
    }
    public void setTrackingMessage(String value) {
        this.trackingMessage = value;
    }

    public Boolean getOnTrack() { return onTrack; }
    public void setOnTrack(Boolean value) { this.onTrack = value; }

    public Integer getBaselineLoggedDays() {
        return baselineLoggedDays;
    }
    public void setBaselineLoggedDays(Integer value) {
        this.baselineLoggedDays = value;
    }

    public Integer getCurrentLoggedDays() {
        return currentLoggedDays;
    }
    public void setCurrentLoggedDays(Integer value) {
        this.currentLoggedDays = value;
    }
}
