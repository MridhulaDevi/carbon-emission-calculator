
import { useCallback, useEffect, useMemo, useState } from "react";
import "./Activities.css";

const API = "http://localhost:8080";

// Change these only if your Spring Boot controller uses different paths.
const FACTORS_URL = "/api/emission-factors";
const ACTIVITIES_URL = "/api/activities";

const today = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset)
    .toISOString()
    .slice(0, 10);
};

const emptyForm = () => ({
  category: "",
  activityType: "",
  quantity: "",
  unit: "",
  logDate: today(),
});

const titleCase = (value) =>
  String(value ?? "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const extractArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.activities)) return data.activities;
  if (Array.isArray(data?.factors)) return data.factors;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

// Adjust this mapping if your Java entity uses other field names.
const normalizeFactor = (record) => ({
  id: record.id,
  category: String(
    record.category ?? record.categoryName ?? ""
  ).trim(),
  activityType: String(
    record.activityType ??
    record.activity_type ??
    record.subcategory ??
    record.subCategory ??
    record.type ??
    ""
  ).trim(),
  unit: String(
    record.unit ?? record.measurementUnit ?? ""
  ).trim(),
  factor: Number(
    record.factor ??
    record.emissionFactor ??
    record.factorValue ??
    record.emission_factor ??
    record.value
  ),
});

function Activities({ token: tokenProp, onActivityChanged }) {
  const token = tokenProp || localStorage.getItem("token");

  const [activities, setActivities] = useState([]);
  const [factors, setFactors] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [factorLoading, setFactorLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [factorError, setFactorError] = useState("");
  const [search, setSearch] = useState("");

  const request = useCallback(
    async (path, options = {}) => {
      const response = await fetch(`${API}${path}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(options.body
            ? { "Content-Type": "application/json" }
            : {}),
          ...(options.headers || {}),
        },
      });

      const text = await response.text();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Your session has expired. Please sign in again."
          );
        }

        throw new Error(
          `HTTP ${response.status}: ${text || response.statusText}`
        );
      }

      if (!text.trim()) return null;

      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    },
    [token]
  );

  const loadActivities = useCallback(async () => {
    const data = await request(ACTIVITIES_URL);
    setActivities(extractArray(data));
  }, [request]);

  const loadFactors = useCallback(async () => {
    setFactorLoading(true);
    setFactorError("");

    try {
      const data = await request(FACTORS_URL);

      const records = extractArray(data)
        .map(normalizeFactor)
        .filter(
          (item) =>
            item.category &&
            item.activityType &&
            item.unit &&
            Number.isFinite(item.factor)
        );

      setFactors(records);

      if (records.length === 0) {
        setFactorError(
          "No usable emission factors were returned. Check the database records and API field names."
        );
      }
    } catch (err) {
      setFactors([]);
      setFactorError(
        `Unable to load emission factors: ${err.message}`
      );
    } finally {
      setFactorLoading(false);
    }
  }, [request]);

  useEffect(() => {
    let active = true;

    async function initialize() {
      setLoading(true);
      setError("");

      try {
        const data = await request(ACTIVITIES_URL);

        if (active) {
          setActivities(extractArray(data));
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    initialize();
    loadFactors();

    return () => {
      active = false;
    };
  }, [request, loadFactors]);

  // Categories are generated from database records.
  const categories = useMemo(
    () => [...new Set(factors.map((f) => f.category))],
    [factors]
  );

  // Activity types are filtered by the selected category.
  const availableTypes = useMemo(
    () =>
      factors.filter(
        (factor) => factor.category === form.category
      ),
    [factors, form.category]
  );

  // Populate the initial selection once database factors arrive.
  useEffect(() => {
    if (!factors.length || editingId !== null) return;

    setForm((previous) => {
      const categoryExists = factors.some(
        (factor) => factor.category === previous.category
      );

      const category = categoryExists
        ? previous.category
        : factors[0].category;

      const choices = factors.filter(
        (factor) => factor.category === category
      );

      const selected =
        choices.find(
          (factor) =>
            factor.activityType === previous.activityType
        ) || choices[0];

      if (!selected) return previous;

      if (
        previous.category === category &&
        previous.activityType === selected.activityType &&
        previous.unit === selected.unit
      ) {
        return previous;
      }

      return {
        ...previous,
        category,
        activityType: selected.activityType,
        unit: selected.unit,
      };
    });
  }, [factors, editingId]);

  const selectedFactor = useMemo(
    () =>
      factors.find(
        (factor) =>
          factor.category === form.category &&
          factor.activityType === form.activityType
      ),
    [factors, form.category, form.activityType]
  );

  const quantity = Number(form.quantity);

  const estimate =
    selectedFactor &&
    form.quantity !== "" &&
    Number.isFinite(quantity) &&
    quantity > 0
      ? quantity * selectedFactor.factor
      : null;

  const totalEmission = activities.reduce(
    (sum, item) => {
      const emission = Number(item.emission);
      return sum + (Number.isFinite(emission) ? emission : 0);
    },
    0
  );

  const filteredActivities = activities.filter((activity) => {
    const text = [
      activity.category,
      activity.activityType,
      activity.logDate,
    ]
      .join(" ")
      .toLowerCase();

    return text.includes(search.toLowerCase());
  });

  const changeCategory = (category) => {
    const first = factors.find(
      (factor) => factor.category === category
    );

    setForm((previous) => ({
      ...previous,
      category,
      activityType: first?.activityType || "",
      unit: first?.unit || "",
    }));
  };

  const changeActivityType = (activityType) => {
    const selected = factors.find(
      (factor) =>
        factor.category === form.category &&
        factor.activityType === activityType
    );

    setForm((previous) => ({
      ...previous,
      activityType,
      unit: selected?.unit || "",
    }));
  };

  const resetForm = () => {
    const first = factors[0];

    setForm({
      ...emptyForm(),
      category: first?.category || "",
      activityType: first?.activityType || "",
      unit: first?.unit || "",
    });

    setEditingId(null);
  };

  const saveActivity = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!selectedFactor) {
      setError("Please select an activity with a valid emission factor.");
      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    const payload = {
      category: form.category,
      activityType: form.activityType,
      quantity,
      unit: selectedFactor.unit,
      logDate: form.logDate,
    };

    setSaving(true);

    try {
      if (editingId !== null) {
        await request(`${ACTIVITIES_URL}/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        setMessage("Activity updated successfully.");
      } else {
        await request(ACTIVITIES_URL, {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setMessage("Activity logged successfully.");
      }

      resetForm();
      await loadActivities();
      onActivityChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const editActivity = (activity) => {
    const factor = factors.find(
      (item) =>
        item.category === activity.category &&
        item.activityType === activity.activityType
    );

    if (!factor) {
      setError(
        "This activity's emission factor is unavailable. Refresh the factors before editing."
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setEditingId(activity.id);

    setForm({
      category: activity.category,
      activityType: activity.activityType,
      quantity: String(activity.quantity ?? ""),
      unit: factor.unit,
      logDate: String(activity.logDate || today()).slice(0, 10),
    });

    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteActivity = async (id) => {
    if (!window.confirm("Delete this activity?")) return;

    setDeletingId(id);
    setError("");
    setMessage("");

    try {
      await request(`${ACTIVITIES_URL}/${id}`, {
        method: "DELETE",
      });

      if (editingId === id) resetForm();

      await loadActivities();
      onActivityChanged?.();

      setMessage("Activity deleted successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const getIcon = (category) => {
    switch (String(category).toLowerCase()) {
      case "transport":
        return "🚗";
      case "electricity":
        return "⚡";
      case "food":
        return "🌿";
      case "shopping":
        return "🛍️";
      default:
        return "🌍";
    }
  };

  return (
    <div className="activities-page">
      <header className="activities-header">
        <div>
          <span className="activities-eyebrow">
            CARBONDOWN / ACTIVITY MANAGEMENT
          </span>

          <h1>Track your impact.</h1>

          <p>
            Log everyday choices, calculate carbon emissions
            in real time, and manage your activity history.
          </p>
        </div>

        <div className="activity-count">
          <strong>{activities.length}</strong>
          <span>Activities logged</span>
        </div>
      </header>

      {message && (
        <div className="activity-notice success">
          {message}
        </div>
      )}

      {error && (
        <div className="activity-notice error">
          {error}
        </div>
      )}

      <div className="activity-workspace">
        <section className="activity-form-panel">
          <div className="activity-section-heading">
            <div className="activity-section-symbol">＋</div>

            <div>
              <span className="activities-eyebrow">
                ACTIVITY LOGGER
              </span>
              <h2>
                {editingId !== null
                  ? "Edit your activity"
                  : "Log a new activity"}
              </h2>
              <p>
                Categories and factors are loaded from your database.
              </p>
            </div>
          </div>

          {factorError && (
            <div className="activity-notice error">
              {factorError}

              <button
                type="button"
                className="activity-retry"
                onClick={loadFactors}
              >
                Retry
              </button>
            </div>
          )}

          <form
            className="activity-log-form"
            onSubmit={saveActivity}
          >
            <label htmlFor="activity-category">
              Category
            </label>

            <select
              id="activity-category"
              value={form.category}
              onChange={(e) =>
                changeCategory(e.target.value)
              }
              disabled={factorLoading || !categories.length}
              required
            >
              {!categories.length && (
                <option value="">
                  {factorLoading
                    ? "Loading categories..."
                    : "No categories available"}
                </option>
              )}

              {categories.map((category) => (
                <option key={category} value={category}>
                  {titleCase(category)}
                </option>
              ))}
            </select>

            <label htmlFor="activity-type">
              Activity type / Subcategory
            </label>

            <select
              id="activity-type"
              value={form.activityType}
              onChange={(e) =>
                changeActivityType(e.target.value)
              }
              disabled={!availableTypes.length}
              required
            >
              {!availableTypes.length && (
                <option value="">
                  No activity types available
                </option>
              )}

              {availableTypes.map((item) => (
                <option
                  key={item.id ?? `${item.category}-${item.activityType}`}
                  value={item.activityType}
                >
                  {titleCase(item.activityType)}
                </option>
              ))}
            </select>

            <div className="activity-form-grid">
              <div>
                <label htmlFor="activity-quantity">
                  Quantity {form.unit ? `(${form.unit})` : ""}
                </label>

                <input
                  id="activity-quantity"
                  type="number"
                  min="0.000001"
                  step="any"
                  placeholder="Enter quantity"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      quantity: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <label htmlFor="activity-date">
                  Activity date
                </label>

                <input
                  id="activity-date"
                  type="date"
                  value={form.logDate}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      logDate: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            <button
              className="activity-submit"
              type="submit"
              disabled={
                saving ||
                factorLoading ||
                !selectedFactor
              }
            >
              {saving
                ? "Saving activity..."
                : editingId !== null
                ? "Save changes →"
                : "Calculate & log activity →"}
            </button>

            {editingId !== null && (
              <button
                className="activity-cancel"
                type="button"
                onClick={resetForm}
              >
                Cancel editing
              </button>
            )}
          </form>
        </section>

        <aside className="activity-live-panel">
          <div className="activity-live-top">
            <span>LIVE CARBON CALCULATOR</span>
            <span className="activity-live-status">
              ● LIVE
            </span>
          </div>

          <div className="activity-live-art">◎</div>

          <span className="activity-live-caption">
            ESTIMATED CARBON EMISSIONS
          </span>

          <div className="activity-live-number">
            {estimate === null
              ? "—"
              : estimate.toFixed(3)}
          </div>

          <div className="activity-live-unit">
            kg CO₂e
          </div>

          <p className="activity-live-description">
            Your carbon footprint estimate updates as you
            enter the quantity.
          </p>

          <div className="activity-calculation">
            <div>
              <span>Selected activity</span>
              <strong>
                {selectedFactor
                  ? titleCase(selectedFactor.activityType)
                  : "Not available"}
              </strong>
            </div>

            <div>
              <span>Emission factor</span>
              <strong>
                {selectedFactor
                  ? selectedFactor.factor.toFixed(5)
                  : "—"}
              </strong>
            </div>

            <div>
              <span>Factor unit</span>
              <strong>
                {selectedFactor
                  ? `kg CO₂e / ${selectedFactor.unit}`
                  : "—"}
              </strong>
            </div>

            <div>
              <span>Calculation</span>
              <strong>
                {selectedFactor
                  ? `${form.quantity || 0} × ${selectedFactor.factor}`
                  : "—"}
              </strong>
            </div>
          </div>

          <div className="activity-live-footer">
            Factors are retrieved from the backend.
            Final emissions are calculated and stored
            by Spring Boot.
          </div>
        </aside>
      </div>

      <section className="activity-history">
        <div className="activity-history-top">
          <div>
            <span className="activities-eyebrow">
              YOUR FOOTPRINT RECORDS
            </span>

            <h2>Activity history</h2>

            <p>
              {activities.length} activities ·{" "}
              {totalEmission.toFixed(2)} kg CO₂e total
            </p>
          </div>

          <input
            type="search"
            placeholder="Search activities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="activity-loading">
            <div className="loading-circle" />
            <p>Loading activities...</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="activities-empty">
            <div className="empty-icon">🌿</div>

            <h2>
              {search
                ? "No matching activities"
                : "Your journey starts here."}
            </h2>

            <p>
              {search
                ? "Try a different search."
                : "Use the activity logger above to add your first activity."}
            </p>
          </div>
        ) : (
          <div className="activities-list">
            {filteredActivities.map((activity) => (
              <article
                className="activity-card"
                key={activity.id}
              >
                <div className="activity-card-icon">
                  {getIcon(activity.category)}
                </div>

                <div className="activity-card-main">
                  <span className="activity-category">
                    {titleCase(activity.category)}
                  </span>

                  <h3>
                    {titleCase(activity.activityType)}
                  </h3>

                  <div className="activity-details">
                    <div>
                      <span>QUANTITY</span>
                      <strong>
                        {activity.quantity} {activity.unit}
                      </strong>
                    </div>

                    <div>
                      <span>DATE</span>
                      <strong>
                        {String(activity.logDate || "").slice(0, 10)}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="activity-card-emission">
                  <span>CARBON EMISSION</span>

                  <strong>
                    {activity.emission == null
                      ? "—"
                      : Number(activity.emission).toFixed(2)}
                  </strong>

                  <small>kg CO₂e</small>

                  <div className="activity-card-actions">
                    <button
                      type="button"
                      className="activity-edit-btn"
                      onClick={() => editActivity(activity)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="activity-delete-btn"
                      onClick={() =>
                        deleteActivity(activity.id)
                      }
                      disabled={deletingId === activity.id}
                    >
                      {deletingId === activity.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Activities;
