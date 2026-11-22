import { useCallback, useEffect, useState } from "react";
import "./Badges.css";

const API = "http://localhost:8080/api/badges";

const CRITERIA_LABELS = {
  TOTAL_ACTIVITIES: "Activities",
  TRANSPORT_ACTIVITIES: "Transport logs",
  ELECTRICITY_ACTIVITIES: "Electricity logs",
  FOOD_ACTIVITIES: "Food logs",
  SHOPPING_ACTIVITIES: "Shopping logs",
  ECO_MEALS: "Eco-friendly meals",
  ACTIVE_DAYS: "Active days",
  MAX_TOTAL_EMISSION: "kg CO₂e maximum",
};

function Badges({ token }) {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const authToken = token || localStorage.getItem("token");

  const loadBadges = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Unable to load your achievements");
      }

      const data = await response.json();
      setBadges(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    loadBadges();
  }, [loadBadges]);

  const earnedCount = badges.filter(
    (badge) => badge.earned
  ).length;

  const completion = badges.length
    ? Math.round((earnedCount / badges.length) * 100)
    : 0;

  const visibleBadges = badges.filter((badge) => {
    if (filter === "earned") return badge.earned;
    if (filter === "locked") return !badge.earned;
    return true;
  });

  const getProgress = (badge) => {
    const target = Number(badge.targetValue) || 0;
    const current = Number(badge.progress) || 0;

    if (badge.earned) return 100;

    if (badge.criteriaType === "MAX_TOTAL_EMISSION") {
      return 0;
    }

    return target > 0
      ? Math.min(100, (current / target) * 100)
      : 0;
  };

  const getProgressText = (badge) => {
    const current = Number(badge.progress) || 0;
    const target = Number(badge.targetValue) || 0;

    if (badge.criteriaType === "MAX_TOTAL_EMISSION") {
      return `${current.toFixed(2)} / max ${target} kg CO₂e`;
    }

    return `${current} / ${target} ${
      CRITERIA_LABELS[badge.criteriaType] || "completed"
    }`;
  };

  const formatDate = (value) => {
    if (!value) return "";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? ""
      : date.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
  };

  return (
    <main className="badges-page">
      <div className="badges-container">
        <header className="badges-header">
          <span className="badges-eyebrow">
            ✦ CARBONDOWN REWARDS ✦
          </span>

          <h1>
            The Hall of <em>Achievements</em>
          </h1>

          <p>
            Every sustainable choice deserves recognition.
            Collect golden achievements as your journey grows.
          </p>
        </header>

        <section className="badge-summary">
          <div className="badge-summary-content">
            <span className="summary-label">
              YOUR ACHIEVEMENT COLLECTION
            </span>

            <h2>
              {earnedCount}
              <span> / {badges.length}</span>
            </h2>

            <p>Golden badges unlocked</p>

            <div className="summary-progress">
              <div
                style={{ width: `${completion}%` }}
              />
            </div>

            <small>{completion}% completed</small>
          </div>

          <div className="summary-medal">
            <img
              src="/gold-badge.png"
              alt="Golden achievement medal"
            />
          </div>
        </section>

        <section className="badges-collection">
          <div className="collection-heading">
            <div>
              <span className="collection-eyebrow">
                YOUR COLLECTION
              </span>

              <h2>Achievement Gallery</h2>
            </div>

            <button
              className="badge-refresh"
              onClick={loadBadges}
              disabled={loading}
            >
              ↻ Refresh
            </button>
          </div>

          <div className="badge-filters">
            {[
              ["all", "All Badges"],
              ["earned", "Unlocked"],
              ["locked", "Locked"],
            ].map(([value, label]) => (
              <button
                key={value}
                className={
                  filter === value ? "active" : ""
                }
                onClick={() => setFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>

          {error && (
            <div className="badges-error">{error}</div>
          )}

          {loading ? (
            <div className="badges-loading">
              <div className="badge-spinner" />
              <p>Preparing your achievements...</p>
            </div>
          ) : visibleBadges.length === 0 ? (
            <div className="badges-empty">
              <h3>No badges to display</h3>
              <p>
                Your achievements will appear here.
              </p>
            </div>
          ) : (
            <div className="badges-grid">
              {visibleBadges.map((badge) => (
                <article
                  key={badge.id}
                  className={`badge-card ${
                    badge.earned ? "earned" : "locked"
                  }`}
                >
                  <div className="badge-card-top">
                    <span className="badge-number">
                      ACHIEVEMENT #{String(badge.id).padStart(3, "0")}
                    </span>

                    <span
                      className={`badge-status ${
                        badge.earned ? "unlocked" : ""
                      }`}
                    >
                      {badge.earned
                        ? "✦ UNLOCKED"
                        : "LOCKED"}
                    </span>
                  </div>

                  <div className="badge-medal-wrap">
                    <div className="badge-medal-glow" />

                    <img
                      className="badge-medal-image"
                      src="/gold-badge.png"
                      alt={`${badge.name} gold medal`}
                    />

                    {!badge.earned && (
                      <div className="badge-lock-icon">
                        🔒
                      </div>
                    )}
                  </div>

                  <h3>{badge.name}</h3>

                  <p className="badge-description">
                    {badge.description}
                  </p>

                  <div className="badge-card-bottom">
                    {badge.earned ? (
                      <div className="badge-earned-info">
                        <span>✓ Achievement unlocked</span>

                        {badge.earnedAt && (
                          <small>
                            Earned {formatDate(badge.earnedAt)}
                          </small>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="badge-progress-label">
                          <span>YOUR PROGRESS</span>
                          <span>{Math.round(getProgress(badge))}%</span>
                        </div>

                        <div className="badge-progress-track">
                          <div
                            style={{
                              width: `${getProgress(badge)}%`,
                            }}
                          />
                        </div>

                        <small className="badge-progress-text">
                          {getProgressText(badge)}
                        </small>
                      </>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Badges;