import { useCallback, useEffect, useState } from "react";
import "./AdminBadges.css";

const API = "http://localhost:8080/api/admin/badges";

const CRITERIA = [
  { value: "TOTAL_ACTIVITIES", label: "Total Activities" },
  { value: "TRANSPORT_ACTIVITIES", label: "Transport Activities" },
  { value: "ELECTRICITY_ACTIVITIES", label: "Electricity Activities" },
  { value: "FOOD_ACTIVITIES", label: "Food Activities" },
  { value: "SHOPPING_ACTIVITIES", label: "Shopping Activities" },
  { value: "ECO_MEALS", label: "Vegetarian / Vegan Meals" },
  { value: "ACTIVE_DAYS", label: "Distinct Active Days" },
  { value: "MAX_TOTAL_EMISSION", label: "Maximum Total Emissions" },
];

const EMPTY_FORM = {
  name: "",
  description: "",
  icon: "gold",
  criteriaType: "TOTAL_ACTIVITIES",
  targetValue: 1,
  active: true,
};

function AdminBadges() {
  const [badges, setBadges] = useState([]);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const loadBadges = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error("Unable to load admin badges");
      }

      const data = await response.json();
      setBadges(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBadges();
  }, [loadBadges]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const target = Number(form.targetValue);

    if (!form.name.trim()) {
      setError("Please enter a badge name");
      return;
    }

    if (
      !Number.isFinite(target) ||
      target < 0 ||
      (form.criteriaType !== "MAX_TOTAL_EMISSION" &&
        (!Number.isInteger(target) || target < 1))
    ) {
      setError("Please enter a valid target value");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const url = editingId
        ? `${API}/${editingId}`
        : API;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          ...form,
          name: form.name.trim(),
          targetValue: target,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to save badge");
      }

      setMessage(
        editingId
          ? "Badge updated successfully!"
          : "New badge created successfully!"
      );

      resetForm();
      await loadBadges();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (badge) => {
    setForm({
      name: badge.name || "",
      description: badge.description || "",
      icon: "gold",
      criteriaType: badge.criteriaType,
      targetValue: badge.targetValue,
      active: badge.active,
    });

    setEditingId(badge.id);
    setShowForm(true);
    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (badge) => {
    const confirmed = window.confirm(
      `Delete "${badge.name}" permanently? This will also remove its earned records from all users.`
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      const response = await fetch(`${API}/${badge.id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error("Unable to delete badge");
      }

      setMessage("Badge deleted successfully");
      await loadBadges();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleStatus = async (badge) => {
    try {
      setError("");
      setMessage("");

      const response = await fetch(`${API}/${badge.id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          ...badge,
          active: !badge.active,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to update badge status");
      }

      setMessage("Badge status updated");
      await loadBadges();
    } catch (err) {
      setError(err.message);
    }
  };

  const activeCount = badges.filter((b) => b.active).length;

  return (
    <main className="admin-badges-page">
      <header className="admin-badges-header">
        <div>
          <span className="admin-badges-eyebrow">
            CARBONDOWN ADMINISTRATION
          </span>

          <h1>Badge Management</h1>

          <p>
            Design achievements, define milestones, and
            reward sustainable actions.
          </p>
        </div>

        <button
          className="admin-add-badge"
          onClick={() => {
            resetForm();
            setShowForm(true);
            setError("");
            setMessage("");
          }}
        >
          + Create Badge
        </button>
      </header>

      <section className="admin-badge-stats">
        <div className="admin-badge-stat">
          <span>Total Badges</span>
          <strong>{badges.length}</strong>
          <small>Created achievements</small>
        </div>

        <div className="admin-badge-stat">
          <span>Active Badges</span>
          <strong>{activeCount}</strong>
          <small>Visible to users</small>
        </div>

        <div className="admin-badge-stat">
          <span>Inactive Badges</span>
          <strong>{badges.length - activeCount}</strong>
          <small>Currently hidden</small>
        </div>
      </section>

      {error && (
        <div className="admin-badge-error">{error}</div>
      )}

      {message && (
        <div className="admin-badge-success">{message}</div>
      )}

      {showForm && (
        <section className="admin-badge-form-section">
          <div className="admin-form-heading">
            <div>
              <span>ACHIEVEMENT DESIGNER</span>
              <h2>
                {editingId ? "Edit Badge" : "Create New Badge"}
              </h2>
            </div>

            <button
              type="button"
              className="admin-close-form"
              onClick={resetForm}
            >
              ✕
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="admin-badge-form"
          >
            <div className="admin-badge-field">
              <label>Badge Name *</label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Eco Champion"
                maxLength={100}
                required
              />
            </div>

            <div className="admin-badge-field">
              <label>Unlocking Criteria *</label>

              <select
                name="criteriaType"
                value={form.criteriaType}
                onChange={handleChange}
              >
                {CRITERIA.map((criterion) => (
                  <option
                    key={criterion.value}
                    value={criterion.value}
                  >
                    {criterion.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-badge-field full">
              <label>Description</label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe what this badge celebrates..."
                maxLength={255}
                rows={3}
              />
            </div>

            <div className="admin-badge-field">
              <label>
                {form.criteriaType === "MAX_TOTAL_EMISSION"
                  ? "Maximum Emission (kg CO₂e)"
                  : "Required Target"}
              </label>

              <input
                type="number"
                name="targetValue"
                value={form.targetValue}
                onChange={handleChange}
                min={
                  form.criteriaType === "MAX_TOTAL_EMISSION"
                    ? "0"
                    : "1"
                }
                step={
                  form.criteriaType === "MAX_TOTAL_EMISSION"
                    ? "0.01"
                    : "1"
                }
                required
              />

              <small>
                {form.criteriaType === "MAX_TOTAL_EMISSION"
                  ? "Badge unlocks when total emissions are at or below this limit."
                  : "Badge unlocks when the user reaches this target."}
              </small>
            </div>

            <div className="admin-badge-preview">
              <img
                src="/gold-badge.png"
                alt="Badge preview"
              />
              <span>GOLD ACHIEVEMENT</span>
            </div>

            <div className="admin-badge-field full">
              <label className="admin-active-toggle">
                <input
                  type="checkbox"
                  name="active"
                  checked={form.active}
                  onChange={handleChange}
                />
                <span>Make this badge visible to users</span>
              </label>
            </div>

            <div className="admin-badge-form-actions">
              <button
                type="button"
                className="admin-cancel"
                onClick={resetForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="admin-save"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Save Changes"
                  : "Create Achievement"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="admin-badge-list-section">
        <div className="admin-list-heading">
          <div>
            <span>MANAGE COLLECTION</span>
            <h2>All Achievements</h2>
          </div>

          <button onClick={loadBadges}>
            ↻ Refresh
          </button>
        </div>

        {loading ? (
          <div className="admin-badge-empty">
            Loading badges...
          </div>
        ) : badges.length === 0 ? (
          <div className="admin-badge-empty">
            No badges created yet.
          </div>
        ) : (
          <div className="admin-badges-grid">
            {badges.map((badge) => (
              <article
                className="admin-badge-card"
                key={badge.id}
              >
                <div className="admin-badge-card-top">
                  <span>BADGE #{badge.id}</span>

                  <span
                    className={
                      badge.active
                        ? "admin-status active"
                        : "admin-status inactive"
                    }
                  >
                    {badge.active ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>

                <img
                  className="admin-badge-image"
                  src="/gold-badge.png"
                  alt={badge.name}
                />

                <h3>{badge.name}</h3>

                <p>{badge.description}</p>

                <div className="admin-badge-rule">
                  <span>UNLOCK CONDITION</span>

                  <strong>
                    {CRITERIA.find(
                      (c) => c.value === badge.criteriaType
                    )?.label || badge.criteriaType}
                  </strong>

                  <small>
                    Target: {badge.targetValue}
                  </small>
                </div>

                <div className="admin-badge-actions">
                  <button
                    onClick={() => handleEdit(badge)}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => toggleStatus(badge)}
                  >
                    {badge.active ? "Disable" : "Enable"}
                  </button>

                  <button
                    className="delete"
                    onClick={() => handleDelete(badge)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminBadges;