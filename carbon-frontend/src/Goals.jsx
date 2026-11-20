
import { useCallback, useEffect, useState } from "react";
import "./Goals.css";

const API = "http://localhost:8080/api/goals";

const today = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

function Goals({ token }) {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState({
    title: "",
    target: "",
    startDate: today(),
    endDate: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadGoals = useCallback(async () => {
    if (!token) {
      setGoals([]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(API, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      setGoals(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadGoals();

    const refresh = () => {
      if (!document.hidden) loadGoals();
    };

    const interval = setInterval(refresh, 15000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [loadGoals]);

  const addGoal = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!Number.isFinite(Number(form.target)) ||
        Number(form.target) <= 0) {
      setError("Enter a valid emission budget.");
      return;
    }

    if (!form.startDate || !form.endDate) {
      setError("Select both dates.");
      return;
    }

    if (form.startDate > form.endDate) {
      setError("End date cannot be before start date.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: form.title,
          target: Number(form.target),
          unit: "kg CO2e",
          startDate: form.startDate,
          endDate: form.endDate
        })
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      setMessage("Goal created successfully!");
      setForm({
        title: "",
        target: "",
        startDate: today(),
        endDate: ""
      });

      await loadGoals();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(`${date}T00:00:00`)
      .toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
  };

  const formatKg = (value) =>
    `${Number(value || 0).toFixed(2)} kg CO₂e`;

  const activeCount = goals.filter(
    (g) => g.status === "ACTIVE"
  ).length;

  const completedCount = goals.filter(
    (g) => g.status === "COMPLETED"
  ).length;

  return (
    <div className="goals-page">
      <header className="goals-header">
        <span>YOUR SUSTAINABILITY JOURNEY</span>
        <h1>My Goals</h1>
        <p>
          Set your carbon emission limit and monitor
          your progress automatically.
        </p>
      </header>

      <div className="goals-summary">
        <div className="goal-summary-card">
          <span>Total Goals</span>
          <strong>{goals.length}</strong>
        </div>

        <div className="goal-summary-card">
          <span>Active Goals</span>
          <strong>{activeCount}</strong>
        </div>

        <div className="goal-summary-card">
          <span>Completed Goals</span>
          <strong>{completedCount}</strong>
        </div>
      </div>

      {message && (
        <div className="goals-message">{message}</div>
      )}

      {error && (
        <div className="goals-error">{error}</div>
      )}

      <form className="goal-form" onSubmit={addGoal}>
        <div className="goal-form-heading">
          <div>
            <span>PLAN YOUR IMPACT</span>
            <h2>Create a New Goal</h2>
          </div>
          <span className="goal-form-icon">🎯</span>
        </div>

        <div className="goal-form-grid">
          <label className="goal-full-width">
            Goal Name
            <input
              value={form.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  title: e.target.value
                })
              }
              placeholder="e.g. Weekly carbon emission limit"
              required
            />
          </label>

          <label>
            Maximum Emission Budget (kg CO₂e)
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={form.target}
              onChange={(e) =>
                setForm({
                  ...form,
                  target: e.target.value
                })
              }
              placeholder="e.g. 20"
              required
            />
          </label>

          <label>
            Unit
            <select value="kg CO2e" disabled>
              <option value="kg CO2e">kg CO₂e</option>
            </select>
          </label>

          <label>
            Start Date
            <input
              type="date"
              min={today()}
              value={form.startDate}
              onChange={(e) =>
                setForm({
                  ...form,
                  startDate: e.target.value,
                  endDate: ""
                })
              }
              required
            />
          </label>

          <label>
            End Date
            <input
              type="date"
              min={form.startDate || today()}
              value={form.endDate}
              onChange={(e) =>
                setForm({
                  ...form,
                  endDate: e.target.value
                })
              }
              required
            />
          </label>
        </div>

        <p className="goal-form-note">
          All activities dated within your selected period
          will count toward your emission budget.
        </p>

        <button
          className="goal-create-btn"
          type="submit"
          disabled={saving}
        >
          {saving ? "Creating..." : "+ Create Goal"}
        </button>
      </form>

      <div className="goals-list-heading">
        <h2 className="goals-list-title">Your Goals</h2>

        <button
          className="goals-refresh-btn"
          type="button"
          onClick={loadGoals}
        >
          ↻ Refresh Progress
        </button>
      </div>

      {loading ? (
        <div className="goal-empty">
          <h3>Loading goals...</h3>
        </div>
      ) : (
        <div className="goals-list">
          {goals.length === 0 ? (
            <div className="goal-empty">
              <span>🎯</span>
              <h3>No goals yet</h3>
              <p>Create your first emission goal above.</p>
            </div>
          ) : (
            goals.map((goal) => {
              const used = Math.max(
                0,
                Number(goal.progress || 0)
              );

              const target = Number(goal.target || 0);

              const percentage = target > 0
                ? (used / target) * 100
                : 0;

              const barWidth = Math.min(
                100,
                Math.max(0, percentage)
              );

              const remaining = Math.max(
                0,
                target - used
              );

              const exceeded = used > target;
              const overBy = Math.max(0, used - target);
              const status = goal.status || "ACTIVE";

              const isUpcoming = status === "UPCOMING";
              const isCompleted = status === "COMPLETED";
              const isExpired = status === "EXPIRED";

              const statusText = isCompleted
                ? "Goal achieved"
                : isExpired
                ? "Goal expired"
                : isUpcoming
                ? "Tracking not started"
                : exceeded
                ? "Over budget"
                : "Within budget";

              const messageText = isUpcoming
                ? `Tracking starts on ${formatDate(goal.startDate)}.`
                : isCompleted
                ? "Great work! You stayed within your carbon budget."
                : isExpired
                ? `This goal ended ${formatKg(overBy)} over budget.`
                : exceeded
                ? `You've exceeded your budget by ${formatKg(overBy)}. Try reducing high-emission activities.`
                : `You're within your budget. ${formatKg(remaining)} remaining.`;

              return (
                <article className="goal-card" key={goal.id}>
                  <div className="goal-card-heading">
                    <div>
                      <span className="goal-card-label">
                        YOUR CARBON GOAL
                      </span>
                      <h3>{goal.title}</h3>
                    </div>

                    <span
                      className="goal-percentage"
                      style={{
                        color: exceeded
                          ? "#d76a53"
                          : "#149b83",
                        fontSize: "15px",
                        fontWeight: 700,
                        textAlign: "right"
                      }}
                    >
                      {statusText}
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: "18px",
                      marginBottom: "16px"
                    }}
                  >
                    <span
                      style={{
                        display: "block",
                        color: "#71827b",
                        fontSize: "13px",
                        marginBottom: "6px"
                      }}
                    >
                      Total emissions logged
                    </span>

                    <strong
                      style={{
                        fontSize: "32px",
                        color: "#183e36"
                      }}
                    >
                      {used.toFixed(2)}
                    </strong>

                    <span
                      style={{
                        color: "#71827b",
                        marginLeft: "8px"
                      }}
                    >
                      kg CO₂e
                    </span>

                    <p className="goal-progress-caption">
                      Your emission limit is {formatKg(target)}
                    </p>
                  </div>

                  <div className="goal-progress-track">
                    <div
                      className="goal-progress-fill"
                      style={{
                        width: `${barWidth}%`,
                        background: exceeded
                          ? "#e67a63"
                          : "#149b83"
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "8px",
                      marginBottom: "20px",
                      fontSize: "12px",
                      color: "#71827b"
                    }}
                  >
                    <span>0 kg</span>
                    <span>
                      {target.toFixed(2)} kg limit
                    </span>
                  </div>

                  <div className="goal-tracking-details">
                    <div>
                      <span>Emission Budget</span>
                      <strong>{formatKg(target)}</strong>
                    </div>

                    <div>
                      <span>Emissions Logged</span>
                      <strong>{formatKg(used)}</strong>
                    </div>

                    <div>
                      <span>
                        {exceeded
                          ? "Budget Exceeded By"
                          : "Remaining Budget"}
                      </span>
                      <strong
                        style={{
                          color: exceeded
                            ? "#d76a53"
                            : undefined
                        }}
                      >
                        {formatKg(exceeded ? overBy : remaining)}
                      </strong>
                    </div>

                    <div>
                      <span>Budget Status</span>
                      <strong>
                        {exceeded
                          ? "Limit exceeded"
                          : "Within limit"}
                      </strong>
                    </div>

                    <div>
                      <span>Start Date</span>
                      <strong>{formatDate(goal.startDate)}</strong>
                    </div>

                    <div>
                      <span>End Date</span>
                      <strong>{formatDate(goal.endDate)}</strong>
                    </div>
                  </div>

                  <div
                    className={`goal-tracking-alert ${
                      exceeded ? "warning" : "success"
                    }`}
                  >
                    {messageText}
                  </div>

                  <div className="goal-card-footer">
                    <span
                      className={`goal-status ${status.toLowerCase()}`}
                    >
                      {status}
                    </span>
                  </div>
                </article>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default Goals;
