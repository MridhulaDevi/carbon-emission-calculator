
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from "recharts";
import {
  BarChart3, Users, Activity, Leaf, TrendingUp,
  CalendarDays, Award, Zap, ClipboardList, RefreshCw,
  ArrowLeft, AlertTriangle, Filter, TrendingDown
} from "lucide-react";
import "./AdminAnalytics.css";

const API = "http://localhost:8080";

const COLORS = [
  "#18a77b", "#71a9e8", "#f5ac72",
  "#a68be4", "#e6c26e", "#ec8ba0"
];

const toArray = (data) => {
  if (Array.isArray(data)) return data;
  for (const key of ["content", "data", "users", "activities"]) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  return [];
};

const getId = (a) =>
  a?.user?.id ?? a?.userId ?? a?.user_id ?? null;

const getEmission = (a) => {
  const value = Number(a?.emission ?? 0);
  return Number.isFinite(value) ? value : 0;
};

const pretty = (value) =>
  String(value ?? "Unknown")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const dateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const kg = (value) => Number(value || 0).toFixed(2);

export default function AdminAnalytics({ setPage }) {
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [selectedUser, setSelectedUser] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [selectedMetric, setSelectedMetric] = useState("logs");

  const load = useCallback(async (initial = false) => {
    initial ? setLoading(true) : setRefreshing(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please log in again.");

      const headers = { Authorization: `Bearer ${token}` };

      const responses = await Promise.all([
        fetch(`${API}/api/admin/users`, { headers }),
        fetch(`${API}/api/admin/activities`, { headers })
      ]);

      if (!responses[0].ok || !responses[1].ok) {
        throw new Error("Unable to fetch admin analytics data.");
      }

      const [userData, activityData] =
        await Promise.all(responses.map((r) => r.json()));

      setUsers(toArray(userData));
      setActivities(toArray(activityData));
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

  const missingUserIds = useMemo(
    () => activities.filter((a) => getId(a) == null).length,
    [activities]
  );

  const analytics = useMemo(() => {
    const today = new Date();
    const todayString = dateKey(today);
    let start = null;

    if (selectedPeriod !== "all") {
      const d = new Date(today);
      d.setDate(d.getDate() - Number(selectedPeriod) + 1);
      start = dateKey(d);
    }

    const filtered = activities.filter((a) => {
      const date = String(a.logDate || "").slice(0, 10);
      const valid = /^\d{4}-\d{2}-\d{2}$/.test(date);
      const matchesPeriod =
        valid && (!start || (date >= start && date <= todayString));
      const matchesUser =
        selectedUser === "all" ||
        String(getId(a)) === selectedUser;

      return matchesPeriod && matchesUser;
    });

    const dailyMap = {};
    const categoryMap = {};
    const userMap = new Map();

    // Prepopulate dates for 7/30/90 day charts.
    if (start) {
      const d = new Date(`${start}T12:00:00`);
      const end = new Date(`${todayString}T12:00:00`);

      while (d <= end) {
        const key = dateKey(d);
        dailyMap[key] = { date: key, logs: 0, emissions: 0 };
        d.setDate(d.getDate() + 1);
      }
    }

    filtered.forEach((a) => {
      const date = String(a.logDate).slice(0, 10);
      const value = getEmission(a);
      const category = String(a.category || "Other").toLowerCase();
      const id = getId(a);
      const key = id == null ? "unknown" : String(id);

      if (!dailyMap[date]) {
        dailyMap[date] = { date, logs: 0, emissions: 0 };
      }

      dailyMap[date].logs++;
      dailyMap[date].emissions += value;

      if (!categoryMap[category]) {
        categoryMap[category] = {
          name: pretty(category), logs: 0, emissions: 0
        };
      }

      categoryMap[category].logs++;
      categoryMap[category].emissions += value;

      if (!userMap.has(key)) {
        const u = users.find((item) => String(item.id) === key);
        userMap.set(key, {
          id: key,
          name:
            u?.name || a.user?.name ||
            u?.email || a.user?.email ||
            (key === "unknown" ? "Unassigned" : `User ${key}`),
          logs: 0,
          emissions: 0
        });
      }

      const person = userMap.get(key);
      person.logs++;
      person.emissions += value;
    });

    const daily = Object.values(dailyMap).sort(
      (a, b) => a.date.localeCompare(b.date)
    );

    const categories = Object.values(categoryMap).sort(
      (a, b) => b.emissions - a.emissions
    );

    const userStats = [...userMap.values()]
      .filter((u) => u.id !== "unknown")
      .sort((a, b) => b.emissions - a.emissions);

    const total = filtered.reduce(
      (sum, a) => sum + getEmission(a), 0
    );

    const activeDays = daily.filter((d) => d.logs > 0).length;
    const activeUsers = userStats.length;
    const mostActive = [...userStats].sort(
      (a, b) => b.logs - a.logs
    )[0];

    return {
      daily,
      categories,
      userStats,
      total,
      logCount: filtered.length,
      activeDays,
      activeUsers,
      averageEmission: filtered.length ? total / filtered.length : 0,
      averageDailyLogs: activeDays ? filtered.length / activeDays : 0,
      highestCategory: categories[0]?.name || "—",
      mostActiveUser: mostActive?.name || "—",
      highestUser: userStats[0] || null,
      lowestUser: userStats.length
        ? userStats[userStats.length - 1]
        : null
    };
  }, [activities, users, selectedPeriod, selectedUser]);

  const hasLogs = analytics.logCount > 0;
  const hasEmissions = analytics.total > 0;

  if (loading) {
    return (
      <main className="aa-page aa-center">
        <div className="aa-spinner" />
        <p>Preparing carbon analytics...</p>
      </main>
    );
  }

  return (
    <main className="aa-page">
      <header className="aa-header">
        <div>
          <span className="aa-eyebrow">CARBONDOWN / DATA INTELLIGENCE</span>
          <h1>Admin Analytics<span>.</span></h1>
          <p>Understand community emissions, engagement and trends.</p>
        </div>

        <div className="aa-actions">
          <button onClick={() => setPage("admin")}>
            <ArrowLeft size={16} /> Dashboard
          </button>
          <button onClick={() => load()} disabled={refreshing}>
            <RefreshCw size={16} className={refreshing ? "aa-spin" : ""} />
            {refreshing ? "Refreshing" : "Refresh"}
          </button>
        </div>
      </header>

      {error && (
        <div className="aa-warning">
          <AlertTriangle size={17} />
          {error}
          <button onClick={() => load()}>Retry</button>
        </div>
      )}

      <section className="aa-banner">
        <div>
          <span>LIVE DATA / CARBON INTELLIGENCE</span>
          <h2>Understand the numbers.<br />Shape the future.</h2>
          <p>
            Interactive insights into emission patterns and platform activity.
          </p>
        </div>
        <div className="aa-banner-icon"><BarChart3 size={65} /></div>
      </section>

      <div className="aa-toolbar">
        <div>
          <span className="aa-eyebrow">PERFORMANCE OVERVIEW</span>
          <h2>Carbon Analytics</h2>
          <p>Apply filters to explore your platform's data.</p>
        </div>

        <div className="aa-filters">
          <label>
            <Users size={16} />
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="all">All Users</option>
              {users.map((u) => (
                <option value={String(u.id)} key={u.id}>
                  {u.name || u.email || `User ${u.id}`}
                </option>
              ))}
            </select>
          </label>

          <label>
            <CalendarDays size={16} />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>
          </label>
        </div>
      </div>

      {missingUserIds > 0 && (
        <div className="aa-warning">
          <Filter size={17} />
          {missingUserIds} activity records have no user ID.
          User-wise charts and comparisons may be incomplete.
        </div>
      )}

      <section className="aa-kpis">
        {[
          { label: "Filtered Emissions", value: kg(analytics.total), unit: "kg CO₂e", icon: Leaf, color: "mint" },
          { label: "Activity Logs", value: analytics.logCount, unit: "Recorded logs", icon: Activity, color: "blue" },
          { label: "Active Users", value: analytics.activeUsers, unit: "Users with logs", icon: Users, color: "peach" },
          { label: "Average Per Log", value: kg(analytics.averageEmission), unit: "kg CO₂e / activity", icon: TrendingUp, color: "purple" }
        ].map((k) => {
          const Icon = k.icon;
          return (
            <div className={`aa-kpi ${k.color}`} key={k.label}>
              <div className="aa-kpi-icon"><Icon size={20} /></div>
              <span>{k.label}</span>
              <strong>{k.value}</strong>
              <small>{k.unit}</small>
            </div>
          );
        })}
      </section>

      <section className="aa-chart-grid">
        <article className="aa-chart-card aa-wide">
          <div className="aa-chart-heading">
            <div>
              <span className="aa-eyebrow">ACTIVITY OVER TIME</span>
              <h3>Daily Activity Trends</h3>
              <p>Activity frequency or carbon emissions by day.</p>
            </div>

            <div className="aa-switch">
              <button
                className={selectedMetric === "logs" ? "active" : ""}
                onClick={() => setSelectedMetric("logs")}
              >
                Activity Logs
              </button>
              <button
                className={selectedMetric === "emissions" ? "active" : ""}
                onClick={() => setSelectedMetric("emissions")}
              >
                Emissions
              </button>
            </div>
          </div>

          {hasLogs ? (
            <div className="aa-chart">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.daily}>
                  <defs>
                    <linearGradient id="aaArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#18a77b" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#18a77b" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 5" vertical={false} stroke="#e8eee9" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v) => v.slice(5)}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={20}
                  />
                  <YAxis
                    allowDecimals={selectedMetric !== "logs"}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(v) =>
                      selectedMetric === "emissions"
                        ? `${kg(v)} kg CO₂e`
                        : v
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey={selectedMetric}
                    name={selectedMetric === "logs" ? "Activity Logs" : "Emissions"}
                    stroke="#18a77b"
                    strokeWidth={3}
                    fill="url(#aaArea)"
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="aa-empty">No activity data for this period.</div>
          )}
        </article>

        <article className="aa-chart-card">
          <div className="aa-chart-heading">
            <div>
              <span className="aa-eyebrow">EMISSION BREAKDOWN</span>
              <h3>Emissions by Category</h3>
              <p>Categories contributing to total emissions.</p>
            </div>
          </div>

          {hasEmissions ? (
            <div className="aa-chart">
              <ResponsiveContainer width="100%" height={290}>
                <PieChart>
                  <Pie
                    data={analytics.categories}
                    dataKey="emissions"
                    nameKey="name"
                    cx="50%"
                    cy="44%"
                    innerRadius={62}
                    outerRadius={94}
                    paddingAngle={4}
                    stroke="none"
                  >
                    {analytics.categories.map((c, i) => (
                      <Cell key={c.name} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${kg(v)} kg CO₂e`} />
                  <Legend verticalAlign="bottom" iconType="circle" iconSize={9} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="aa-empty">No emission data available.</div>
          )}
        </article>

        <article className="aa-chart-card">
          <div className="aa-chart-heading">
            <div>
              <span className="aa-eyebrow">COMMUNITY COMPARISON</span>
              <h3>User-wise Emissions</h3>
              <p>Top users ranked by recorded emissions.</p>
            </div>
          </div>

          {analytics.userStats.length > 0 ? (
            <div className="aa-chart">
              <ResponsiveContainer width="100%" height={290}>
                <BarChart
                  data={analytics.userStats.slice(0, 8)}
                  layout="vertical"
                  margin={{ left: 5, right: 15 }}
                >
                  <CartesianGrid strokeDasharray="4 5" horizontal={false} stroke="#e8eee9" />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={90}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => String(v).length > 12 ? `${String(v).slice(0, 11)}…` : v}
                  />
                  <Tooltip formatter={(v) => `${kg(v)} kg CO₂e`} />
                  <Bar
                    dataKey="emissions"
                    name="Emissions"
                    fill="#71a9e8"
                    radius={[0, 7, 7, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="aa-empty">No identifiable user activity.</div>
          )}
        </article>

        <article className="aa-chart-card">
          <div className="aa-chart-heading">
            <div>
              <span className="aa-eyebrow">LOGGING BEHAVIOUR</span>
              <h3>Activity Frequency</h3>
              <p>Number of activity logs in each category.</p>
            </div>
          </div>

          {analytics.categories.length > 0 ? (
            <div className="aa-chart">
              <ResponsiveContainer width="100%" height={290}>
                <BarChart data={analytics.categories}>
                  <CartesianGrid strokeDasharray="4 5" vertical={false} stroke="#e8eee9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="logs" name="Activity Logs" radius={[7, 7, 0, 0]} maxBarSize={55}>
                    {analytics.categories.map((c, i) => (
                      <Cell key={c.name} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="aa-empty">No category activity data.</div>
          )}
        </article>

        <article className="aa-chart-card">
          <div className="aa-chart-heading">
            <div>
              <span className="aa-eyebrow">USER ENGAGEMENT</span>
              <h3>Most Active Users</h3>
              <p>Ranked by total number of logged activities.</p>
            </div>
          </div>

          {analytics.userStats.length > 0 ? (
            <div className="aa-leaderboard">
              {[...analytics.userStats]
                .sort((a, b) => b.logs - a.logs)
                .slice(0, 5)
                .map((u, i, arr) => (
                  <div className="aa-leader-row" key={u.id}>
                    <span className="aa-rank">{i + 1}</span>
                    <div className="aa-leader-main">
                      <div>
                        <strong>{u.name}</strong>
                        <small>{u.logs} logs</small>
                      </div>
                      <div className="aa-progress">
                        <div
                          style={{
                            width: `${(u.logs / Math.max(1, arr[0].logs)) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="aa-empty">No user activity data available.</div>
          )}
        </article>
      </section>

      <div className="aa-insights-title">
        <span className="aa-eyebrow">AUTOMATED SUMMARY</span>
        <h2>Analytics Insights</h2>
      </div>

      <section className="aa-insights">
        {[
          { label: "Days With Activity", value: analytics.activeDays, sub: "Days containing at least one log", icon: CalendarDays },
          { label: "Top Emission Category", value: analytics.highestCategory, sub: "Largest category contribution", icon: Zap },
          { label: "Most Active User", value: analytics.mostActiveUser, sub: "Highest number of activity logs", icon: Award },
          { label: "Average Logs / Active Day", value: analytics.averageDailyLogs.toFixed(1), sub: "Average logging frequency", icon: TrendingUp }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div className="aa-insight" key={item.label}>
              <div className="aa-insight-icon"><Icon size={20} /></div>
              <div>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <small>{item.sub}</small>
              </div>
            </div>
          );
        })}
      </section>

      <div className="aa-insights-title">
        <span className="aa-eyebrow">USER EMISSION COMPARISON</span>
        <h2>Highest & Lowest Emission Users</h2>
        <p>Based on the selected filters and recorded activities.</p>
      </div>

      <section className="aa-extremes">
        {[
          {
            label: "Highest Total Emissions",
            person: analytics.highestUser,
            icon: TrendingUp,
            color: "high"
          },
          {
            label: "Lowest Total Emissions",
            person: analytics.lowestUser,
            icon: TrendingDown,
            color: "low"
          }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div className={`aa-extreme ${item.color}`} key={item.label}>
              <div className="aa-extreme-heading">
                <Icon size={22} />
                <span>{item.label}</span>
              </div>
              <h3>{item.person?.name || "No data"}</h3>
              <strong>{kg(item.person?.emissions)} kg CO₂e</strong>
              <p>{item.person?.logs ?? 0} activity logs</p>
            </div>
          );
        })}
      </section>

      <footer className="aa-footer">
        CARBONDOWN / ADMIN ANALYTICS
        <span>All emissions in kg CO₂ equivalent</span>
      </footer>
    </main>
  );
}
