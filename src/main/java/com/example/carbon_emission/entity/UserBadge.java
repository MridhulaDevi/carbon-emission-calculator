package com.example.carbon_emission.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "user_badges",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"user_id", "badge_id"}
    )
)
public class UserBadge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "badge_id")
    private Badge badge;

    @Column(name = "earned_at", nullable = false)
    private LocalDateTime earnedAt;

    public UserBadge() {}

    public UserBadge(User user, Badge badge) {
        this.user = user;
        this.badge = badge;
        this.earnedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Badge getBadge() {
        return badge;
    }

    public void setBadge(Badge badge) {
        this.badge = badge;
    }

    public LocalDateTime getEarnedAt() {
        return earnedAt;
    }

    public void setEarnedAt(LocalDateTime earnedAt) {
        this.earnedAt = earnedAt;
    }
}