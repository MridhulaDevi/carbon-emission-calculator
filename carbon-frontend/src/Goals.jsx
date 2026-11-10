
import { useEffect, useState } from "react";
import "./Goals.css";

const API = "http://localhost:8080/api/goals";

function Goals({ token }) {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState({
    title: "",
    target: "",
    unit: "kg CO2e"
  });
  const [message, setMessage] = useState("");

  const loadGoals = async () => {
    try {
      const res = await fetch(API, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Unable to load goals");
      setGoals(await res.json());
    } catch (err) {
      setMessage(err.message);
    }
  };

  useEffect(() => {
    loadGoals();
  }, [token]);

  const addGoal = async e => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          target: Number(form.target)
        })
      });

      if (!res.ok) throw new Error(await res.text());

      setForm({ title: "", target: "", unit: "kg CO2e" });
      setMessage("Goal created successfully!");
      loadGoals();
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="goals-page">
      <header className="goals-header">
        <span>YOUR SUSTAINABILITY JOURNEY</span>
        <h1>My Goals</h1>
        <p>Set meaningful targets and track your progress.</p>
      </header>

      {message && <div className="goals-message">{message}</div>}

      <form className="goal-form" onSubmit={addGoal}>
        <h2>Create a New Goal</h2>

        <label>
          Goal Name
          <input
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Reduce monthly emissions"
            required
          />
        </label>

        <label>
          Target
          <input
            type="number"
            min="0.01"
            step="any"
            value={form.target}
            onChange={e => setForm({ ...form, target: e.target.value })}
            placeholder="Enter target value"
            required
          />
        </label>

        <label>
          Unit
          <select
            value={form.unit}
            onChange={e => setForm({ ...form, unit: e.target.value })}
          >
            <option value="kg CO2e">kg CO₂e</option>
            <option value="activities">Activities</option>
          </select>
        </label>

        <button type="submit">+ Create Goal</button>
      </form>

      <h2 className="goals-list-title">Your Goals</h2>

      <div className="goals-list">
        {goals.length === 0 ? (
          <div className="goal-empty">
            <span>🎯</span>
            <h3>No goals yet</h3>
            <p>Create your first sustainability goal above.</p>
          </div>
        ) : (
          goals.map(goal => {
            const progress = Number(goal.progress || 0);
            const target = Number(goal.target || 0);
            const percentage = target > 0
              ? Math.min((progress / target) * 100, 100)
              : 0;

            return (
              <article className="goal-card" key={goal.id}>
                <div className="goal-card-heading">
                  <h3>{goal.title}</h3>
                  <span>{percentage.toFixed(0)}%</span>
                </div>

                <div className="goal-progress-track">
                  <div
                    className="goal-progress-fill"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <p>
                  {progress} / {target} {goal.unit}
                </p>
                <span className="goal-status">{goal.status || "In Progress"}</span>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Goals;
