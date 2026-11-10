
import { useEffect, useState } from "react";
import "./Recommendations.css";

const API = "http://localhost:8080/api/activities";

function Recommendations({ token }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Unable to load activities");
        return res.json();
      })
      .then(setActivities)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const totalEmission = activities.reduce(
    (sum, item) => sum + Number(item.emission || 0),
    0
  );

  // Get categories that the user has actually logged
  const loggedCategories = [
    ...new Set(
      activities.map(activity =>
        activity.category?.toLowerCase()
      )
    )
  ];

  const tips = [
    {
      icon: "🚲",
      title: "Choose greener transport",
      description:
        "Walk, cycle or use public transport for shorter journeys.",
      category: "transport"
    },
    {
      icon: "💡",
      title: "Save electricity",
      description:
        "Switch off unused appliances and choose energy-efficient devices.",
      category: "electricity"
    },
    {
      icon: "🥗",
      title: "Try more plant-based meals",
      description:
        "Include more vegetarian meals to reduce food-related emissions.",
      category: "food"
    },
    {
      icon: "🛍️",
      title: "Shop consciously",
      description:
        "Avoid unnecessary purchases and choose reusable products.",
      category: "shopping"
    }
  ];

  // Show recommendations only for categories the user logged
  const filteredTips = tips.filter(tip =>
    loggedCategories.includes(tip.category)
  );

  let priority = "Great start!";

  if (totalEmission > 100) {
    priority = "Focus on reducing your emissions";
  } else if (totalEmission > 30) {
    priority = "Try a few more green habits";
  }

  return (
    <div className="recommend-page">

      <header className="recommend-header">
        <span>YOUR GREEN GUIDE</span>
        <h1>Recommendations</h1>
        <p>
          Small everyday changes can create a meaningful impact.
        </p>
      </header>

      <section className="recommend-summary">
        <div>
          <span>Your recorded emissions</span>

          <h2>
            {loading
              ? "..."
              : `${totalEmission.toFixed(2)} kg CO₂e`}
          </h2>

          <p>{priority}</p>
        </div>

        <div className="recommend-summary-icon">
          🌱
        </div>
      </section>

      <h2 className="recommend-section-title">
        Ways to reduce your footprint
      </h2>

      <div className="recommend-grid">

        {filteredTips.length > 0 ? (
          filteredTips.map((tip, index) => (
            <article
              className="recommend-card"
              key={index}
            >
              <div className="recommend-icon">
                {tip.icon}
              </div>

              <span className="recommend-category">
                {tip.category}
              </span>

              <h3>{tip.title}</h3>

              <p>{tip.description}</p>
            </article>
          ))
        ) : (
          <p>
            Start logging activities to receive personalized
            recommendations.
          </p>
        )}

      </div>

      <section className="recommend-footer">
        <h2>Every action counts.</h2>

        <p>
          Track your activities regularly and work towards a
          lower-carbon lifestyle.
        </p>
      </section>

    </div>
  );
}

export default Recommendations;
