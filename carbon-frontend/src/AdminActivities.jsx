
import React, { useEffect, useMemo, useState } from "react";
import "./AdminActivities.css";

const API_URL = "http://localhost:8080";

function AdminActivities() {
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // NEW FILTER STATES
  const [selectedUser, setSelectedUser] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const request = async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: getHeaders(),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Server error (${response.status})`);
    }

    const text = await response.text();

    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  };

  const loadActivities = async () => {
    setLoading(true);
    setError("");

    try {
      const activityData = await request("/api/admin/activities");

      setActivities(
        Array.isArray(activityData) ? activityData : []
      );

      try {
        const userData = await request("/api/admin/users");

        setUsers(
          Array.isArray(userData) ? userData : []
        );
      } catch (userError) {
        console.error("Unable to load user names:", userError);
        setUsers([]);
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load activities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const getUserName = (activity) => {
    if (activity.userName) {
      return activity.userName;
    }

    if (activity.user?.name) {
      return activity.user.name;
    }

    const userId =
      activity.userId ?? activity.user?.id;

    if (userId != null) {
      const matchedUser = users.find(
        (user) => String(user.id) === String(userId)
      );

      if (matchedUser) {
        return matchedUser.name || matchedUser.email;
      }

      return `User #${userId}`;
    }

    return "Unknown User";
  };

  // USER OPTIONS FROM ACTUAL ACTIVITIES
  const userOptions = useMemo(() => {
    const names = activities.map((activity) =>
      getUserName(activity)
    );

    return [...new Set(names)].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [activities, users]);

  // AVAILABLE YEARS FROM ACTIVITY DATES
  const availableYears = useMemo(() => {
    const years = activities
      .map((activity) =>
        String(activity.logDate || "").slice(0, 4)
      )
      .filter((year) => /^\d{4}$/.test(year));

    return [...new Set(years)].sort((a, b) =>
      b.localeCompare(a)
    );
  }, [activities]);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // FILTER ACTIVITIES
  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const userName = getUserName(activity);
      const date = String(activity.logDate || "").slice(0, 10);

      const year = date.slice(0, 4);
      const month = date.slice(5, 7);

      const matchesUser =
        selectedUser === "all" ||
        userName === selectedUser;

      const matchesDate =
        !selectedDate ||
        date === selectedDate;

      const matchesMonth =
        selectedMonth === "all" ||
        month === selectedMonth;

      const matchesYear =
        selectedYear === "all" ||
        year === selectedYear;

      return (
        matchesUser &&
        matchesDate &&
        matchesMonth &&
        matchesYear
      );
    });
  }, [
    activities,
    users,
    selectedUser,
    selectedDate,
    selectedMonth,
    selectedYear,
  ]);

  const resetFilters = () => {
    setSelectedUser("all");
    setSelectedDate("");
    setSelectedMonth("all");
    setSelectedYear("all");
  };

  const filtersActive =
    selectedUser !== "all" ||
    selectedDate !== "" ||
    selectedMonth !== "all" ||
    selectedYear !== "all";

  const deleteActivity = async (id) => {
    if (!window.confirm("Delete this activity?")) return;

    setError("");
    setMessage("");

    try {
      await request(`/api/admin/activities/${id}`, {
        method: "DELETE",
      });

      setActivities((previous) =>
        previous.filter((activity) => activity.id !== id)
      );

      setMessage("Activity deleted successfully.");
    } catch (err) {
      console.error(err);
      setError("Unable to delete activity.");
    }
  };

  const openEdit = (activity) => {
    setEditing({ ...activity });
    setError("");
    setMessage("");
  };

  const updateField = (event) => {
    const { name, value } = event.target;

    setEditing((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const saveActivity = async (event) => {
    event.preventDefault();

    if (!editing) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await request(
        `/api/admin/activities/${editing.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            category: editing.category,
            activityType: editing.activityType,
            quantity: Number(editing.quantity),
            unit: editing.unit,
            logDate: editing.logDate,
          }),
        }
      );

      setEditing(null);
      setMessage("Activity updated successfully.");

      const updatedActivities = await request(
        "/api/admin/activities"
      );

      setActivities(
        Array.isArray(updatedActivities)
          ? updatedActivities
          : []
      );
    } catch (err) {
      console.error(err);
      setError("Unable to update activity.");
    } finally {
      setSaving(false);
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

      {/* HEADER */}
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

      {/* ACTIVITY TABLE */}
      <div className="activity-table-card">

        <div className="activity-table-heading">
          <h2>All Activities</h2>
          <span>
            {filteredActivities.length} of {activities.length} records
          </span>
        </div>

        {/* NEW FILTER SECTION */}
        <div className="activity-filter-section">

          <div className="activity-filter-heading">
            <div>
              <h3>Filter Activities</h3>
              <p>
                Refine records by user, date, month, or year.
              </p>
            </div>

            <button
              type="button"
              className="activity-filter-reset"
              onClick={resetFilters}
              disabled={!filtersActive}
            >
              ↺ Reset Filters
            </button>
          </div>

          <div className="activity-filter-grid">

            {/* USER FILTER */}
            <div className="activity-filter-field">
              <label htmlFor="activity-user-filter">
                User
              </label>

              <select
                id="activity-user-filter"
                value={selectedUser}
                onChange={(e) =>
                  setSelectedUser(e.target.value)
                }
              >
                <option value="all">All Users</option>

                {userOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* DATE FILTER */}
            <div className="activity-filter-field">
              <label htmlFor="activity-date-filter">
                Date
              </label>

              <input
                id="activity-date-filter"
                type="date"
                value={selectedDate}
                onChange={(e) =>
                  setSelectedDate(e.target.value)
                }
              />
            </div>

            {/* MONTH FILTER */}
            <div className="activity-filter-field">
              <label htmlFor="activity-month-filter">
                Month
              </label>

              <select
                id="activity-month-filter"
                value={selectedMonth}
                onChange={(e) =>
                  setSelectedMonth(e.target.value)
                }
              >
                <option value="all">All Months</option>

                {months.map((month, index) => (
                  <option
                    key={month}
                    value={String(index + 1).padStart(2, "0")}
                  >
                    {month}
                  </option>
                ))}
              </select>
            </div>

            {/* YEAR FILTER */}
            <div className="activity-filter-field">
              <label htmlFor="activity-year-filter">
                Year
              </label>

              <select
                id="activity-year-filter"
                value={selectedYear}
                onChange={(e) =>
                  setSelectedYear(e.target.value)
                }
              >
                <option value="all">All Years</option>

                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filtersActive && (
            <p className="activity-filter-result">
              Showing {filteredActivities.length} matching{" "}
              {filteredActivities.length === 1
                ? "activity"
                : "activities"}
            </p>
          )}
        </div>

        {/* TABLE */}
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
              {filteredActivities.map((activity) => (
                <tr key={activity.id}>
                  <td>#{activity.id}</td>

                  <td>
                    <strong>{getUserName(activity)}</strong>
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
                    {Number(activity.emission ?? 0).toFixed(2)}
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

        {filteredActivities.length === 0 && (
          <div className="no-activities">
            <div>📊</div>
            <h3>
              {activities.length === 0
                ? "No activities found"
                : "No matching activities"}
            </h3>
            <p>
              {activities.length === 0
                ? "No activity records are currently available."
                : "Try changing or resetting your filters."}
            </p>
          </div>
        )}
      </div>

      {/* EDIT ACTIVITY MODAL */}
      {editing && (
        <div className="activity-modal-overlay">
          <div className="activity-modal">

            <div className="activity-modal-header">
              <div>
                <p>ADMIN</p>
                <h2>Edit Activity</h2>
              </div>

              <button
                type="button"
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
                    value={editing.quantity ?? ""}
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
                    value={String(editing.logDate || "").slice(0, 10)}
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
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
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
