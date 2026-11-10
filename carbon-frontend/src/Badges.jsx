
import { useEffect, useState } from "react";
import "./Badges.css";

const API = "http://localhost:8080/api/badges";

function Badges({ token }) {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(API, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Unable to load badges");
        return res.json();
      })
      .then(setBadges)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const allBadges = [
    {
      name: "First Activity",
      description: "Logged your first carbon activity.",
      icon: "🌱"
    },
    {
      name: "Activity Tracker",
      description: "Logged at least 7 activities.",
      icon: "📊"
    },
    {
      name: "Low Carbon",
      description: "Kept total emissions at or below 10 kg CO₂e.",
      icon: "🌍"
    }
  ];

  const earnedNames = badges.map(badge => badge.name.toLowerCase());

  return (
    <div className="badges-page">
      <header className="badges-header">
        <span>YOUR ACHIEVEMENTS</span>
        <h1>Green Badges</h1>
        <p>Every sustainable action brings you closer to a greener future.</p>
      </header>

      <section className="badge-summary">
        <div>
          <h2>{badges.length} / {allBadges.length}</h2>
          <p>Badges Earned</p>
        </div>
        <span>🏆</span>
      </section>

      {error && <p className="badges-error">{error}</p>}

      {loading ? (
        <p>Loading achievements...</p>
      ) : (
        <div className="badges-grid">
          {allBadges.map((badge, index) => {
            const earned = earnedNames.includes(badge.name.toLowerCase());

            return (
              <article
                className={`badge-card ${earned ? "earned" : "locked"}`}
                key={index}
              >
                <div className="badge-icon">{badge.icon}</div>
                <span className="badge-status">
                  {earned ? "✓ EARNED" : "LOCKED"}
                </span>
                <h3>{badge.name}</h3>
                <p>{badge.description}</p>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Badges;
