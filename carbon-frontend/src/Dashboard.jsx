
import { useEffect, useState } from "react";
import "./Dashboard.css";

function Dashboard({ token }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/api/dashboard", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Unable to load dashboard");
        return res.json();
      })
      .then(setData)
      .catch(err => setError(err.message));
  }, [token]);

  if (error) return <div className="dashboard-page">{error}</div>;

  if (!data) {
    return <div className="dashboard-page">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-heading">
        <span>YOUR SUSTAINABILITY OVERVIEW</span>
        <h1>Dashboard</h1>
        <p>Understand your impact and make greener choices.</p>
      </header>

      <section className="dashboard-stats">
        <article className="dashboard-stat">
          <span>Total Emissions</span>
          <h2>{Number(data.totalEmission || 0).toFixed(2)}</h2>
          <small>kg CO₂e</small>
        </article>

        <article className="dashboard-stat">
          <span>Today's Emissions</span>
          <h2>{Number(data.todayEmission || 0).toFixed(2)}</h2>
          <small>kg CO₂e</small>
        </article>

        <article className="dashboard-stat">
          <span>This Month</span>
          <h2>{Number(data.monthEmission || 0).toFixed(2)}</h2>
          <small>kg CO₂e</small>
        </article>

        <article className="dashboard-stat">
          <span>Activities Logged</span>
          <h2>{data.activityCount || 0}</h2>
          <small>Total activities</small>
        </article>
      </section>

      <section className="dashboard-recent">
        <h2>Recent Activities</h2>

        {data.recentActivities?.length ? (
          data.recentActivities.map(item => (
            <div className="dashboard-activity" key={item.id}>
              <div>
                <h3>{item.activityType}</h3>
                <p>{item.category} · {item.logDate}</p>
              </div>
              <strong>
                {Number(item.emission || 0).toFixed(2)} kg CO₂e
              </strong>
            </div>
          ))
        ) : (
          <p>No activities recorded yet.</p>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
