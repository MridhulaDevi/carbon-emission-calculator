
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Leaf, Users, ClipboardList, Settings, BarChart3,
  RefreshCw, LogOut, ArrowRight, TrendingUp,
  TrendingDown, Flame, CalendarDays, AlertTriangle,
  Activity, ArrowUpRight
} from "lucide-react";
import "./AdminDashboard.css";

const API = "http://localhost:8080";

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  for (const key of ["content", "data", "users", "activities", "factors"]) {
    if (Array.isArray(value?.[key])) return value[key];
  }
  return [];
};

const emission = (a) => {
  const n = Number(a?.emission ?? 0);
  return Number.isFinite(n) ? n : 0;
};

const userId = (a) =>
  a?.user?.id ?? a?.userId ?? a?.user_id ?? null;

const pretty = (value) =>
  String(value ?? "Unknown")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const dateText = (value) => {
  if (!value) return "—";
  const d = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  return Number.isNaN(d.getTime())
    ? String(value)
    : d.toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric"
      });
};

const kg = (value) => Number(value || 0).toFixed(2);

export default function AdminDashboard({ setPage }) {
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [factors, setFactors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (initial = false) => {
    initial ? setLoading(true) : setRefreshing(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please log in again.");

      const headers = { Authorization: `Bearer ${token}` };

      const paths = [
        "/api/admin/users",
        "/api/admin/activities",
        "/api/admin/emission-factors"
      ];

      const responses = await Promise.all(
        paths.map((path) => fetch(API + path, { headers }))
      );

      const failed = responses.findIndex((r) => !r.ok);
      if (failed !== -1) {
        throw new Error(
          `Failed to load ${["users", "activities", "emission factors"][failed]} (HTTP ${responses[failed].status})`
        );
      }

      const result = await Promise.all(responses.map((r) => r.json()));
      setUsers(toArray(result[0]));
      setActivities(toArray(result[1]));
      setFactors(toArray(result[2]));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(true);
  }, [load]);

  const total = useMemo(
    () => activities.reduce((sum, a) => sum + emission(a), 0),
    [activities]
  );

  const ranking = useMemo(() => {
    const map = new Map();

    // Include registered users even if they have no logs.
    users.forEach((u) => {
      map.set(String(u.id), {
        id: String(u.id),
        name: u.name || u.email || `User ${u.id}`,
        email: u.email || "",
        total: 0,
        count: 0,
        highestActivity: null,
        latestActivity: null
      });
    });

    let unmatched = 0;

    activities.forEach((a) => {
      const id = userId(a);

      if (id == null) {
        unmatched++;
        return;
      }

      const key = String(id);

      if (!map.has(key)) {
        map.set(key, {
          id: key,
          name: a.user?.name || a.user?.email || `User ${key}`,
          email: a.user?.email || "",
          total: 0,
          count: 0,
          highestActivity: null,
          latestActivity: null
        });
      }

      const item = map.get(key);
      item.total += emission(a);
      item.count++;

      if (
        !item.highestActivity ||
        emission(a) > emission(item.highestActivity)
      ) {
        item.highestActivity = a;
      }

      if (
        !item.latestActivity ||
        String(a.logDate || "") >
          String(item.latestActivity.logDate || "")
      ) {
        item.latestActivity = a;
      }
    });

    const sorted = [...map.values()].sort(
      (a, b) => b.total - a.total || a.name.localeCompare(b.name)
    );

    return {
      highest: sorted[0] || null,
      lowest: sorted.length ? sorted[sorted.length - 1] : null,
      unmatched
    };
  }, [users, activities]);

  const recentUsers = useMemo(
    () => [...users].reverse().slice(0, 5),
    [users]
  );

  const recentActivities = useMemo(
    () => [...activities]
      .sort((a, b) =>
        String(b.logDate || "").localeCompare(String(a.logDate || ""))
      )
      .slice(0, 5),
    [activities]
  );

  const links = [
    {
      title: "User Management",
      description: "View, edit and manage registered users.",
      icon: Users,
      page: "admin-users",
      color: "mint"
    },
    {
      title: "Activity Management",
      description: "Review and manage carbon activity records.",
      icon: ClipboardList,
      page: "admin-activities",
      color: "blue"
    },
    {
      title: "Emission Factors",
      description: "Maintain factors used for emission calculations.",
      icon: Settings,
      page: "admin-factors",
      color: "peach"
    },
    {
      title: "Admin Analytics",
      description: "Explore charts, trends and user comparisons.",
      icon: BarChart3,
      page: "admin-analytics",
      color: "purple"
    }
  ];

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setPage("login");
  };

  const UserEmissionCard = ({ person, highest }) => {
    const a = person?.highestActivity;

    return (
      <article className={`ad-emitter-card ${highest ? "high" : "low"}`}>
        <div className="ad-emitter-top">
          <div className="ad-emitter-symbol">
            {highest ? <TrendingUp size={23} /> : <TrendingDown size={23} />}
          </div>
          <span>{highest ? "HIGHEST TOTAL EMISSIONS" : "LOWEST TOTAL EMISSIONS"}</span>
        </div>

        {person ? (
          <>
            <div className="ad-emitter-person">
              <div className="ad-avatar">
                {person.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3>{person.name}</h3>
                <p>{person.email || `User ID: ${person.id}`}</p>
              </div>
            </div>

            <div className="ad-emitter-number">
              <strong>{kg(person.total)}</strong>
              <span>kg CO₂e total</span>
            </div>

            <div className="ad-emitter-meta">
              <span><Activity size={15} /> {person.count} activity logs</span>
              <span>
                {total > 0 ? ((person.total / total) * 100).toFixed(1) : "0.0"}%
                {" "}of platform emissions
              </span>
            </div>

            <div className="ad-emitter-activity">
              <span className="ad-mini-label">
                HIGHEST-EMISSION ACTIVITY
              </span>

              {a ? (
                <>
                  <div className="ad-activity-line">
                    <strong>{pretty(a.activityType)}</strong>
                    <b>{kg(emission(a))} kg</b>
                  </div>

                  <p>
                    {pretty(a.category)} · {a.quantity ?? "—"}
                    {a.unit ? ` ${a.unit}` : ""}
                  </p>

                  <small>
                    <CalendarDays size={13} />
                    {dateText(a.logDate)}
                  </small>
                </>
              ) : (
                <p>No activities recorded by this user.</p>
              )}
            </div>
          </>
        ) : (
          <div className="ad-empty">No users available.</div>
        )}
      </article>
    );
  };

  if (loading) {
    return (
      <div className="ad-page ad-center">
        <div className="ad-spinner" />
        <p>Loading CarbonDown Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <main className="ad-page">
      <header className="ad-header">
        <div>
          <span className="ad-eyebrow">CARBONDOWN / ADMINISTRATION</span>
          <h1>Admin Dashboard<span>.</span></h1>
          <p>Monitor users, activities and environmental impact.</p>
        </div>

        <div className="ad-header-actions">
          <button onClick={() => load()} disabled={refreshing}>
            <RefreshCw size={16} className={refreshing ? "ad-spin" : ""} />
            {refreshing ? "Refreshing" : "Refresh"}
          </button>
          <button className="ad-logout" onClick={logout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {error && (
        <div className="ad-warning">
          <AlertTriangle size={18} />
          {error}
          <button onClick={() => load()}>Retry</button>
        </div>
      )}

      <section className="ad-hero">
        <div className="ad-hero-copy">
          <span className="ad-hero-label">
            <span className="ad-live-dot" /> CARBONDOWN COMMAND CENTER
          </span>
          <h2>Every insight drives<br /><em>a greener future.</em></h2>
          <p>
            Understand your community's footprint, discover the biggest
            emission contributors and manage your climate platform.
          </p>
          <button onClick={() => setPage("admin-analytics")}>
            Explore Analytics <ArrowUpRight size={18} />
          </button>
          <div className="ad-hero-bottom">SYSTEM ACTIVE / CLIMATE INTELLIGENCE</div>
        </div>

        <div className="ad-hero-art" aria-hidden="true">
          <div className="ad-orbit ad-orbit-one" />
          <div className="ad-orbit ad-orbit-two" />
          <div className="ad-orbit ad-orbit-three" />
          <div className="ad-earth"><Leaf size={70} strokeWidth={1.2} /></div>
          <div className="ad-floating-tag">LIVE IMPACT DATA</div>
        </div>
      </section>

      <section className="ad-stat-grid">
        {[
          { label: "Total Users", value: users.length, sub: "Registered accounts", icon: Users, color: "mint" },
          { label: "Total Activities", value: activities.length, sub: "Activity records", icon: ClipboardList, color: "blue" },
          { label: "Total Emissions", value: kg(total), sub: "kg CO₂e recorded", icon: Leaf, color: "peach" },
          { label: "Emission Factors", value: factors.length, sub: "Calculation factors", icon: Settings, color: "purple" }
        ].map((s) => {
          const Icon = s.icon;
          return (
            <article className={`ad-stat ${s.color}`} key={s.label}>
              <div className="ad-stat-icon"><Icon size={22} /></div>
              <span>{s.label}</span>
              <strong>{s.value}</strong>
              <small>{s.sub}</small>
            </article>
          );
        })}
      </section>

      <div className="ad-section-title">
        <div>
          <span className="ad-eyebrow">COMMUNITY EMISSION INSIGHTS</span>
          <h2>Emission Extremes</h2>
          <p>Users ranked by their total recorded carbon emissions.</p>
        </div>
        <button onClick={() => setPage("admin-analytics")}>
          View Detailed Analytics <ArrowRight size={16} />
        </button>
      </div>

      {ranking.unmatched > 0 && (
        <div className="ad-warning">
          <AlertTriangle size={18} />
          {ranking.unmatched} activities have no user ID. Rankings may be incomplete.
        </div>
      )}

      <div className="ad-emitter-grid">
        <UserEmissionCard person={ranking.highest} highest />
        <UserEmissionCard person={ranking.lowest} highest={false} />
      </div>

      <div className="ad-section-title">
        <div>
          <span className="ad-eyebrow">PLATFORM CONTROLS</span>
          <h2>Admin Management</h2>
          <p>Direct access to all administrative features.</p>
        </div>
      </div>

      <section className="ad-management-grid">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.page}
              className="ad-management-card"
              onClick={() => setPage(item.page)}
            >
              <div className={`ad-management-icon ${item.color}`}>
                <Icon size={24} />
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <span>Open Section <ArrowRight size={16} /></span>
            </button>
          );
        })}
      </section>

      <div className="ad-overview-grid">
        <section className="ad-panel">
          <div className="ad-panel-heading">
            <div>
              <span className="ad-eyebrow">COMMUNITY</span>
              <h2>Recent Users</h2>
            </div>
            <button onClick={() => setPage("admin-users")}>
              View All <ArrowRight size={15} />
            </button>
          </div>

          {recentUsers.length === 0 ? (
            <p className="ad-empty">No users found.</p>
          ) : recentUsers.map((u) => (
            <div className="ad-list-row" key={u.id}>
              <div className="ad-avatar">
                {(u.name || "U").charAt(0).toUpperCase()}
              </div>
              <div className="ad-row-info">
                <strong>{u.name || "Unnamed User"}</strong>
                <small>{u.email}</small>
              </div>
              <span className="ad-role">{u.role || "USER"}</span>
            </div>
          ))}
        </section>

        <section className="ad-panel">
          <div className="ad-panel-heading">
            <div>
              <span className="ad-eyebrow">LATEST RECORDS</span>
              <h2>Recent Activities</h2>
            </div>
            <button onClick={() => setPage("admin-activities")}>
              View All <ArrowRight size={15} />
            </button>
          </div>

          {recentActivities.length === 0 ? (
            <p className="ad-empty">No activities found.</p>
          ) : recentActivities.map((a, i) => (
            <div className="ad-list-row" key={a.id ?? i}>
              <div className="ad-list-icon"><Flame size={19} /></div>
              <div className="ad-row-info">
                <strong>{pretty(a.activityType)}</strong>
                <small>{pretty(a.category)} · {dateText(a.logDate)}</small>
              </div>
              <div className="ad-row-emission">
                <strong>{kg(emission(a))}</strong>
                <small>kg CO₂e</small>
              </div>
            </div>
          ))}
        </section>
      </div>

      <section className="ad-panel ad-factor-panel">
        <div className="ad-panel-heading">
          <div>
            <span className="ad-eyebrow">EMISSION DATABASE</span>
            <h2>Emission Factors</h2>
          </div>
          <button onClick={() => setPage("admin-factors")}>
            Manage Factors <ArrowRight size={15} />
          </button>
        </div>

        <div className="ad-factor-grid">
          {factors.length === 0 ? (
            <p className="ad-empty">No emission factors found.</p>
          ) : factors.slice(0, 8).map((f, i) => (
            <div className="ad-factor-item" key={f.id ?? i}>
              <div>
                <strong>{pretty(f.activityType)}</strong>
                <small>Per {f.unit || "unit"}</small>
              </div>
              <b>
                {Number(
                  f.factor ?? f.emissionFactor ?? f.factorValue ?? 0
                ).toFixed(4)}
              </b>
            </div>
          ))}
        </div>
      </section>

      <footer className="ad-footer">
        CARBONDOWN ADMIN <span>Measured in kg CO₂ equivalent</span>
      </footer>
    </main>
  );
}
