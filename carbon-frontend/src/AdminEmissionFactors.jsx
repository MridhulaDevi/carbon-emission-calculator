
import React, { useEffect, useState } from "react";
import "./AdminEmissionFactors.css";

const API_URL = "http://localhost:8080";

const CATEGORIES = [
  "transport",
  "electricity",
  "food",
  "shopping"
];

const emptyForm = {
  category: "",
  activityType: "",
  unit: "",
  factor: ""
};

function AdminEmissionFactors() {
  const [factors, setFactors] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`
  });

  const loadFactors = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/admin/emission-factors`,
        { headers: getHeaders() }
      );

      if (!response.ok) {
        throw new Error(`Server error (${response.status})`);
      }

      const data = await response.json();
      setFactors(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load emission factors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFactors();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditing(null);
  };

  const saveFactor = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!form.category) {
      setError("Please select a category.");
      return;
    }

    if (!form.activityType.trim()) {
      setError("Please enter an activity type.");
      return;
    }

    const factorValue = Number(form.factor);

    if (!Number.isFinite(factorValue) || factorValue < 0) {
      setError("Please enter a valid emission factor.");
      return;
    }

    setSaving(true);

    try {
      const url = editing
        ? `${API_URL}/api/admin/emission-factors/${editing.id}`
        : `${API_URL}/api/admin/emission-factors`;

      const response = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          category: form.category,
          activityType: form.activityType.trim().toLowerCase(),
          unit: form.unit.trim(),
          factor: factorValue
        })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Unable to save emission factor.");
      }

      resetForm();

      setMessage(
        editing
          ? "Emission factor updated successfully."
          : "Emission factor added successfully."
      );

      await loadFactors();
    } catch (err) {
      setError(err.message || "Unable to save emission factor.");
    } finally {
      setSaving(false);
    }
  };

  const editFactor = (factor) => {
    setEditing(factor);

    setForm({
      category: factor.category || "",
      activityType: factor.activityType || "",
      unit: factor.unit || "",
      factor: factor.factor ?? ""
    });

    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteFactor = async (id) => {
    if (!window.confirm("Delete this emission factor?")) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/emission-factors/${id}`,
        {
          method: "DELETE",
          headers: getHeaders()
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Unable to delete emission factor.");
      }

      setFactors((previous) =>
        previous.filter((factor) => factor.id !== id)
      );

      setMessage("Emission factor deleted successfully.");

      if (editing?.id === id) {
        resetForm();
      }
    } catch (err) {
      setError(err.message || "Unable to delete emission factor.");
    }
  };

  const formatCategory = (category) => {
    if (!category) return "Not assigned";

    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const availableCategories = [
    ...new Set([
      ...CATEGORIES,
      ...factors.map((factor) => factor.category).filter(Boolean)
    ])
  ];

  if (loading && factors.length === 0) {
    return (
      <div className="factor-loading">
        <div className="factor-spinner"></div>
        <p>Loading emission factors...</p>
      </div>
    );
  }

  return (
    <div className="admin-factors-page">
      <div className="factor-header">
        <div>
          <p className="admin-label">ADMIN PANEL</p>
          <h1>Emission Factors</h1>
          <p>
            Configure the values used to calculate carbon emissions.
          </p>
        </div>

        <button
          className="factor-refresh"
          onClick={loadFactors}
          disabled={loading}
        >
          ↻ Refresh
        </button>
      </div>

      {message && (
        <div className="factor-success">
          ✓ {message}
        </div>
      )}

      {error && (
        <div className="factor-error">
          ⚠ {error}
        </div>
      )}

      <div className="factor-layout">
        <div className="factor-form-card">
          <h2>
            {editing
              ? "Edit Emission Factor"
              : "Add Emission Factor"}
          </h2>

          <p>Define the CO₂e value for an activity type.</p>

          <form onSubmit={saveFactor}>
            <label>Category</label>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="factor-category-select"
            >
              <option value="">Select category</option>

              {availableCategories.map((category) => (
                <option key={category} value={category}>
                  {formatCategory(category)}
                </option>
              ))}
            </select>

            <label>Activity Type / Subcategory</label>

            <input
              name="activityType"
              placeholder="Example: jeep"
              value={form.activityType}
              onChange={handleChange}
              required
            />

            <label>Unit</label>

            <input
              name="unit"
              placeholder="Example: km"
              value={form.unit}
              onChange={handleChange}
              required
            />

            <label>Factor (kg CO₂e / unit)</label>

            <input
              type="number"
              step="any"
              min="0"
              name="factor"
              placeholder="Example: 0.21"
              value={form.factor}
              onChange={handleChange}
              required
            />

            <div className="factor-form-buttons">
              <button
                type="submit"
                className="factor-save"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editing
                    ? "Save Changes"
                    : "Add Factor"}
              </button>

              {editing && (
                <button
                  type="button"
                  className="factor-cancel"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="factor-table-card">
          <div className="factor-table-header">
            <div>
              <h2>Configured Factors</h2>
              <p>{factors.length} factors</p>
            </div>
          </div>

          <div className="factor-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category</th>
                  <th>Activity Type</th>
                  <th>Unit</th>
                  <th>Factor</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {factors.map((factor) => (
                  <tr key={factor.id}>
                    <td>#{factor.id}</td>

                    <td>
                      <span className="factor-category-badge">
                        {formatCategory(factor.category)}
                      </span>
                    </td>

                    <td>
                      <strong>{factor.activityType}</strong>
                    </td>

                    <td>{factor.unit}</td>

                    <td>
                      <span className="factor-number">
                        {Number(factor.factor).toFixed(4)}
                      </span>
                    </td>

                    <td>
                      <div className="factor-actions">
                        <button
                          className="factor-edit"
                          onClick={() => editFactor(factor)}
                        >
                          ✏ Edit
                        </button>

                        <button
                          className="factor-delete"
                          onClick={() => deleteFactor(factor.id)}
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

          {factors.length === 0 && (
            <div className="factor-empty">
              ⚙️
              <h3>No emission factors</h3>
              <p>Add your first emission factor.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminEmissionFactors;
