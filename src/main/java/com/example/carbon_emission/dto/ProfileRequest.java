package com.example.carbon_emission.dto;

public class ProfileRequest {

    private String name;
    private String gender;
    private Integer age;

    private String preferredTransport;
    private String dietPreference;
    private String energySource;
    private String sustainabilityGoal;

    public ProfileRequest() {}

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getPreferredTransport() {
        return preferredTransport;
    }

    public void setPreferredTransport(String preferredTransport) {
        this.preferredTransport = preferredTransport;
    }

    public String getDietPreference() {
        return dietPreference;
    }

    public void setDietPreference(String dietPreference) {
        this.dietPreference = dietPreference;
    }

    public String getEnergySource() {
        return energySource;
    }

    public void setEnergySource(String energySource) {
        this.energySource = energySource;
    }

    public String getSustainabilityGoal() {
        return sustainabilityGoal;
    }

    public void setSustainabilityGoal(String sustainabilityGoal) {
        this.sustainabilityGoal = sustainabilityGoal;
    }
}