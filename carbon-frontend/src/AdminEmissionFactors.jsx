import React, { useEffect, useState } from "react";
import "./AdminEmissionFactors.css";

const API_URL = "http://localhost:8080";

function AdminEmissionFactors() {
  const [factors, setFactors] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    activityType: "",
    unit: "",
    factor: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const loadFactors = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/admin/emission-factors`,
        { headers }
      );

      if (!response.ok) throw new Error();

      setFactors(await response.json());
      setError("");

    } catch {
      setError("Unable to load emission factors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFactors();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setForm({
      activityType: "",
      unit: "",
      factor: "",
    });

    setEditing(null);
  };

  const saveFactor = async (e) => {
    e.preventDefault();

    try {
      const url = editing
        ? `${API_URL}/api/admin/emission-factors/${editing.id}`
        : `${API_URL}/api/admin/emission-factors`;

      const response = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers,
        body: JSON.stringify({
          activityType: form.activityType,
          unit: form.unit,
          factor: Number(form.factor),
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }

      const saved = await response.json();

      if (editing) {
        setFactors(
          factors.map((factor) =>
            factor.id === saved.id ? saved : factor
          )
        );

        setMessage("Emission factor updated successfully.");
      } else {
        setFactors([...factors, saved]);
        setMessage("Emission factor added successfully.");
      }

      resetForm();

    } catch (err) {
      setError(err.message || "Unable to save emission factor.");
    }
  };

  const editFactor = (factor) => {
    setEditing(factor);

    setForm({
      activityType: factor.activityType || "",
      unit: factor.unit || "",
      factor: factor.factor ?? "",
    });

    setMessage("");
    setError("");
  };

  const deleteFactor = async (id) => {
    if (!window.confirm("Delete this emission factor?")) return;

    try {
      const response = await fetch(
        `${API_URL}/api/admin/emission-factors/${id}`,
        {
          method: "DELETE",
          headers,
        }
      );

      if (!response.ok) throw new Error();

      setFactors(
        factors.filter((factor) => factor.id !== id)
      );

      setMessage("Emission factor deleted successfully.");

    } catch {
      setError("Unable to delete emission factor.");
    }
  };

  if (loading) {
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

        {/* FORM */}

        <div className="factor-form-card">

          <h2>
            {editing
              ? "Edit Emission Factor"
              : "Add Emission Factor"}
          </h2>

          <p>
            Define the CO₂e value for an activity type.
          </p>

          <form onSubmit={saveFactor}>

            <label>Activity Type</label>

            <input
              name="activityType"
              placeholder="Example: car"
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

              <button type="submit" className="factor-save">
                {editing ? "Save Changes" : "Add Factor"}
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

        {/* TABLE */}

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
                          onClick={() =>
                            deleteFactor(factor.id)
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