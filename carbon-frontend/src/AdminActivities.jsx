import React, { useEffect, useState } from "react";
import "./AdminActivities.css";

const API_URL = "http://localhost:8080";

function AdminActivities() {
  const [activities, setActivities] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const loadActivities = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/admin/activities`,
        { headers }
      );

      if (!response.ok) {
        throw new Error();
      }

      setActivities(await response.json());
      setError("");

    } catch {
      setError("Unable to load activities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const deleteActivity = async (id) => {
    if (!window.confirm("Delete this activity?")) return;

    try {
      const response = await fetch(
        `${API_URL}/api/admin/activities/${id}`,
        {
          method: "DELETE",
          headers,
        }
      );

      if (!response.ok) throw new Error();

      setActivities(
        activities.filter((activity) => activity.id !== id)
      );

      setMessage("Activity deleted successfully.");
    } catch {
      setError("Unable to delete activity.");
    }
  };

  const openEdit = (activity) => {
    setEditing({ ...activity });
    setError("");
    setMessage("");
  };

  const updateField = (e) => {
    setEditing({
      ...editing,
      [e.target.name]: e.target.value,
    });
  };

  const saveActivity = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${API_URL}/api/admin/activities/${editing.id}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({
            category: editing.category,
            activityType: editing.activityType,
            quantity: Number(editing.quantity),
            unit: editing.unit,
            logDate: editing.logDate,
          }),
        }
      );

      if (!response.ok) throw new Error();

      const updated = await response.json();

      setActivities(
        activities.map((activity) =>
          activity.id === updated.id ? updated : activity
        )
      );

      setEditing(null);
      setMessage("Activity updated successfully.");

    } catch {
      setError("Unable to update activity.");
    }
  };

  if (loading) {
    return (
      <div className="admin-activities-page loading-page">
        <div className="activity-spinner"></div>
        <p>Loading activities...</p>
      </div>
    );
  }

  return (
    <div className="admin-activities-page">

      <div className="activities-header">
        <div>
          <p className="admin-label">ADMIN PANEL</p>
          <h1>Manage Activities</h1>
          <p>
            View and manage carbon activities recorded by users.
          </p>
        </div>

        <button
          className="activity-refresh"
          onClick={loadActivities}
        >
          ↻ Refresh
        </button>
      </div>

      {message && (
        <div className="activity-success">
          ✓ {message}
        </div>
      )}

      {error && (
        <div className="activity-error">
          ⚠ {error}
        </div>
      )}

      <div className="activity-table-card">

        <div className="activity-table-heading">
          <h2>All Activities</h2>
          <span>{activities.length} records</span>
        </div>

        <div className="activity-table-wrapper">

          <table className="activity-table">

            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Category</th>
                <th>Activity</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Date</th>
                <th>Emission</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {activities.map((activity) => (

                <tr key={activity.id}>

                  <td>#{activity.id}</td>

                  <td>
                    {activity.user?.email || "User"}
                  </td>

                  <td>
                    <span className="category-badge">
                      {activity.category}
                    </span>
                  </td>

                  <td>{activity.activityType}</td>

                  <td>{activity.quantity}</td>

                  <td>{activity.unit}</td>

                  <td>{activity.logDate}</td>

                  <td className="emission-value">
                    {Number(activity.emission || 0).toFixed(2)}
                    {" "}kg
                  </td>

                  <td>
                    <div className="activity-actions">

                      <button
                        className="activity-edit"
                        onClick={() => openEdit(activity)}
                      >
                        ✏ Edit
                      </button>

                      <button
                        className="activity-delete"
                        onClick={() =>
                          deleteActivity(activity.id)
                        }
                      >
                        🗑 Delete
                      </button>

                    </div>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {activities.length === 0 && (
          <div className="no-activities">
            <div>📊</div>
            <h3>No activities found</h3>
            <p>No activity records are currently available.</p>
          </div>
        )}

      </div>

      {editing && (

        <div className="activity-modal-overlay">

          <div className="activity-modal">

            <div className="activity-modal-header">
              <div>
                <p>ADMIN</p>
                <h2>Edit Activity</h2>
              </div>

              <button
                onClick={() => setEditing(null)}
                className="activity-close"
              >
                ×
              </button>
            </div>

            <form onSubmit={saveActivity}>

              <div className="activity-form-grid">

                <div>
                  <label>Category</label>
                  <input
                    name="category"
                    value={editing.category || ""}
                    onChange={updateField}
                    required
                  />
                </div>

                <div>
                  <label>Activity Type</label>
                  <input
                    name="activityType"
                    value={editing.activityType || ""}
                    onChange={updateField}
                    required
                  />
                </div>

                <div>
                  <label>Quantity</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    name="quantity"
                    value={editing.quantity || ""}
                    onChange={updateField}
                    required
                  />
                </div>

                <div>
                  <label>Unit</label>
                  <input
                    name="unit"
                    value={editing.unit || ""}
                    onChange={updateField}
                    required
                  />
                </div>

                <div>
                  <label>Date</label>
                  <input
                    type="date"
                    name="logDate"
                    value={editing.logDate || ""}
                    onChange={updateField}
                    required
                  />
                </div>

              </div>

              <div className="activity-modal-actions">

                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="activity-cancel"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="activity-save"
                >
                  Save Changes
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default AdminActivities;