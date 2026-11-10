import { useEffect, useState } from "react";
import "./Activities.css";

const API = "http://localhost:8080";

function Activities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadActivities = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/";
      return;
    }

    try {
      const response = await fetch(`${API}/api/activities`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/";
        return;
      }

      const data = await response.json();

      setActivities(Array.isArray(data) ? data : []);
    } catch {
      setMessage("Unable to load activities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const deleteActivity = async (id) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API}/api/activities/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setActivities((current) =>
          current.filter((activity) => activity.id !== id)
        );
      } else {
        const error = await response.text();
        setMessage(error || "Unable to delete activity.");
      }
    } catch {
      setMessage("Unable to connect to server.");
    }
  };

  const getIcon = (category) => {
    switch (category?.toLowerCase()) {
      case "transport":
        return "🚗";
      case "electricity":
        return "⚡";
      case "food":
        return "🍃";
      case "shopping":
        return "🛍";
      default:
        return "◌";
    }
  };

  const getCategoryName = (category) => {
    if (!category) return "Other";

    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="activities-page">

      <div className="activities-header">
        <div>
          <span className="activities-eyebrow">
            YOUR ACTIVITY LOG
          </span>

          <h1>Daily activities</h1>

          <p>
            Every activity helps you understand your carbon
            footprint better.
          </p>
        </div>

        <div className="activity-count">
          <strong>{activities.length}</strong>
          <span>activities</span>
        </div>
      </div>

      {message && (
        <div className="activity-message">
          {message}
        </div>
      )}

      {loading ? (
        <div className="activity-loading">
          <div className="loading-circle"></div>
          <p>Loading your activities...</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="activities-empty">

          <div className="empty-icon">
            ◌
          </div>

          <h2>Your journey starts here.</h2>

          <p>
            You haven't logged any activities yet. Add your first
            activity from the dashboard to start tracking your
            footprint.
          </p>

          <button
            onClick={() => {
              window.location.href = "/dashboard";
            }}
          >
            Go to dashboard →
          </button>

        </div>
      ) : (
        <div className="activities-list">

          {activities.map((activity) => (
            <div
              className="activity-card"
              key={activity.id}
            >

              <div className="activity-card-icon">
                {getIcon(activity.category)}
              </div>

              <div className="activity-card-main">

                <div className="activity-card-title">
                  <div>
                    <span className="activity-category">
                      {getCategoryName(activity.category)}
                    </span>

                    <h2>
                      {activity.activityType
                        ?.replaceAll("_", " ")
                        .replace(/\b\w/g, (letter) =>
                          letter.toUpperCase()
                        )}
                    </h2>
                  </div>
                </div>

                <div className="activity-details">

                  <div>
                    <span>QUANTITY</span>
                    <strong>
                      {activity.quantity} {activity.unit}
                    </strong>
                  </div>

                  <div>
                    <span>DATE</span>
                    <strong>{activity.logDate}</strong>
                  </div>

                </div>

              </div>

              <div className="activity-card-emission">

                <span>CARBON EMISSION</span>

                <strong>
                  {Number(activity.emission || 0).toFixed(2)}
                </strong>

                <small>kg CO₂e</small>

                <button
                  onClick={() => deleteActivity(activity.id)}
                >
                  Delete
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default Activities;