
import { useEffect, useState } from "react";
import "./Recommendations.css";

const API = "http://localhost:8080/api";

const CATEGORY_META = {
  transport: { icon: "✈", title: "Transport", color: "blue" },
  food: { icon: "🥗", title: "Food", color: "orange" },
  electricity: { icon: "⚡", title: "Electricity", color: "yellow" },
  shopping: { icon: "🛍", title: "Shopping", color: "purple" },
};

function parseAIResponse(value) {
  if (value && typeof value === "object") return value;
  if (typeof value !== "string") return null;

  const clean = value.trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");

  try {
    return JSON.parse(clean);
  } catch {
    return null;
  }
}

function Recommendations({ token }) {
  const [activities, setActivities] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadRecommendations() {
      setLoading(true);
      setError("");
      setRecommendations(null);

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const activityResponse = await fetch(
          `${API}/activities`,
          { headers, signal: controller.signal }
        );

        if (!activityResponse.ok) {
          throw new Error("Unable to load activities");
        }

        const activityData = await activityResponse.json();

        if (controller.signal.aborted) return;

        setActivities(
          Array.isArray(activityData) ? activityData : []
        );

        if (
          !Array.isArray(activityData) ||
          activityData.length === 0
        ) {
          return;
        }

        const response = await fetch(
          `${API}/recommendations`,
          { headers, signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(
            "Unable to generate AI recommendations"
          );
        }

        const data = await response.json();

        if (!controller.signal.aborted) {
          setRecommendations(
            parseAIResponse(data.recommendations)
          );
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    if (token) {
      loadRecommendations();
    } else {
      setActivities([]);
      setRecommendations(null);
      setError("Please log in to view recommendations.");
      setLoading(false);
    }

    return () => controller.abort();
  }, [token]);

  const totalEmission = activities.reduce(
    (sum, item) => sum + Number(item.emission || 0),
    0
  );

  const categoryEmissions = activities.reduce(
    (result, item) => {
      const category = String(item.category || "")
        .toLowerCase()
        .trim();

      if (category) {
        result[category] =
          (result[category] || 0) +
          Number(item.emission || 0);
      }

      return result;
    },
    {}
  );

  const sortedCategories = Object.entries(categoryEmissions)
    .sort((a, b) => b[1] - a[1]);

  const loggedCategories = new Set(
    sortedCategories.map(([category]) => category)
  );

  const aiCategories = Array.isArray(
    recommendations?.categories
  )
    ? recommendations.categories.filter(
        (item) =>
          item &&
          typeof item.category === "string" &&
          loggedCategories.has(
            item.category.toLowerCase().trim()
          ) &&
          Array.isArray(item.tips) &&
          item.tips.length > 0
      )
    : [];

  return (
    <div className="recommend-page">
      <header className="recommend-header">
        <span>YOUR AI GREEN GUIDE</span>
        <h1>Personalized Recommendations</h1>
        <p>
          Smart suggestions based on your actual carbon footprint.
        </p>
      </header>

      <section className="recommend-summary">
        <div>
          <span>Your recorded emissions</span>
          <h2>{totalEmission.toFixed(2)} kg CO₂e</h2>
          <p>{activities.length} activities analyzed</p>
        </div>

        <div className="recommend-summary-icon">🌱</div>
      </section>

      {sortedCategories.length > 0 && (
        <section className="recommend-category-summary">
          <h2 className="recommend-section-title">
            Your Emission Breakdown
          </h2>

          <div className="recommend-grid">
            {sortedCategories.map(([category, emission]) => (
              <article
                className="recommend-card"
                key={category}
              >
                <span className="recommend-category">
                  {category}
                </span>

                <h3>
                  {emission.toFixed(2)} kg CO₂e
                </h3>

                <p>
                  {totalEmission > 0
                    ? (
                        (emission / totalEmission) *
                        100
                      ).toFixed(1)
                    : "0.0"}
                  % of total emissions
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="recommend-insights-heading">
        <div>
          <h2 className="recommend-section-title">
            AI-Powered Recommendations
          </h2>

          <p>
            Practical actions tailored to the activities
            you've logged in the last 30 days.
          </p>
        </div>

        {!loading && aiCategories.length > 0 && (
          <span className="recommend-insights-count">
            ✨ {aiCategories.length} categories
          </span>
        )}
      </div>

      {loading ? (
        <div className="recommend-state-card">
          <div className="recommend-spinner" />
          <h3>Analyzing your activities...</h3>
          <p>
            Preparing personalized suggestions using AI.
          </p>
        </div>
      ) : error ? (
        <div className="recommend-state-card">
          <h3>Unable to load recommendations</h3>
          <p>{error}</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="recommend-state-card">
          <h3>🌱 Start your green journey</h3>
          <p>
            Log activities to receive personalized recommendations.
          </p>
        </div>
      ) : aiCategories.length === 0 ? (
        <div className="recommend-state-card">
          <h3>No recent recommendations available</h3>
          <p>
            Log an activity in the last 30 days and refresh.
            If you already did, check that Groq is returning JSON.
          </p>
        </div>
      ) : (
        <div className="recommend-ai-grid">
          {aiCategories.map((group, index) => {
            const categoryKey = group.category
              .toLowerCase()
              .trim();

            const meta = CATEGORY_META[categoryKey] || {
              icon: "🌿",
              title: group.category,
              color: "green",
            };

            return (
              <article
                className={
                  `recommend-ai-card recommend-ai-${meta.color}`
                }
                key={`${categoryKey}-${index}`}
              >
                <div className="recommend-ai-card-header">
                  <div className="recommend-ai-icon">
                    {meta.icon}
                  </div>

                  <div className="recommend-ai-card-title">
                    <span>
                      PERSONALIZED ACTION PLAN
                    </span>

                    <h3>{meta.title}</h3>

                    {group.activityType && (
                      <p>
                        Based on: {group.activityType}
                      </p>
                    )}
                  </div>

                  <span className="recommend-ai-tip-count">
                    {group.tips.length} tips
                  </span>
                </div>

                <div className="recommend-ai-tips">
                  {group.tips.map((tip, tipIndex) => (
                    <div
                      className="recommend-ai-tip"
                      key={tipIndex}
                    >
                      <span className="recommend-ai-tip-number">
                        {String(tipIndex + 1).padStart(
                          2,
                          "0"
                        )}
                      </span>

                      <div>
                        <h4>
                          {tip.title ||
                            `Action ${tipIndex + 1}`}
                        </h4>

                        <p>{tip.action || ""}</p>

                        {tip.reason && (
                          <p className="recommend-ai-reason">
                            <strong>
                              Why it helps:
                            </strong>{" "}
                            {tip.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <section className="recommend-footer">
        <h2>Every action counts.</h2>
        <p>
          Make smarter everyday choices to reduce
          your carbon footprint.
        </p>
      </section>
    </div>
  );
}

export default Recommendations;
