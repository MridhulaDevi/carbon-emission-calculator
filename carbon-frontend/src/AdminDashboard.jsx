
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import {
  Users, ClipboardList, Leaf, Settings, RefreshCw, LogOut,
  TrendingUp, CalendarDays, Activity, ArrowRight, BarChart3,
  Filter, Zap, Award
} from "lucide-react";
import "./AdminDashboard.css";

const API_URL = "http://localhost:8080";

const COLORS = [
  "#18a77b", "#71a9e8", "#f5ac72",
  "#a68be4", "#e6c26e", "#ec8ba0"
];

const getArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.users)) return data.users;
  if (Array.isArray(data?.activities)) return data.activities;
  if (Array.isArray(data?.factors)) return data.factors;
  return [];
};

const formatName = (value) =>
  String(value ?? "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const getLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getActivityUserId = (activity) =>
  activity.user?.id ??
  activity.userId ??
  activity.user_id ??
  null;

const getEmission = (activity) => {
  const value = Number(activity.emission);
  return Number.isFinite(value) ? value : 0;
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="admin-custom-tooltip">
      <strong>{label}</strong>
      {payload.map((entry, index) => (
        <div key={index}>
          <span
            className="admin-tooltip-dot"
            style={{ background: entry.color || entry.fill }}
          />
          {entry.name}:{" "}
          <b>
            {Number(entry.value).toFixed(
              entry.dataKey === "logs" ? 0 : 2
            )}
            {entry.dataKey === "emissions" ? " kg" : ""}
          </b>
        </div>
      ))}
    </div>
  );
};

function AdminDashboard({ setPage }) {
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [factors, setFactors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [selectedUser, setSelectedUser] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [selectedMetric, setSelectedMetric] = useState("logs");

  // FETCH ADMIN DATA
  const fetchData = useCallback(async (initial = false) => {
    try {
      if (initial) setLoading(true);
      else setRefreshing(true);

      setError("");

      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      };

      const endpoints = [
        "/api/admin/users",
        "/api/admin/activities",
        "/api/admin/emission-factors"
      ];

      const responses = await Promise.all(
        endpoints.map((path) =>
          fetch(`${API_URL}${path}`, { headers })
        )
      );

      for (let i = 0; i < responses.length; i++) {
        if (!responses[i].ok) {
          throw new Error(
            `Failed to load ${
              ["users", "activities", "emission factors"][i]
            } (HTTP ${responses[i].status})`
          );
        }
      }

      const [usersData, activitiesData, factorsData] =
        await Promise.all(responses.map((response) => response.json()));

      setUsers(getArray(usersData));
      setActivities(getArray(activitiesData));
      setFactors(getArray(factorsData));
    } catch (err) {
      console.error("Admin dashboard error:", err);
      setError(err.message || "Failed to load admin data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setPage("login");
  };

  // OVERALL STATISTICS
  const totalEmissions = useMemo(
    () => activities.reduce(
      (sum, item) => sum + getEmission(item), 0
    ),
    [activities]
  );

  const recentUsers = useMemo(
    () => [...users].slice(-5).reverse(),
    [users]
  );

  const recentActivities = useMemo(
    () => [...activities].slice(-5).reverse(),
    [activities]
  );

  // ANALYTICS CALCULATIONS
  const analytics = useMemo(() => {
    const now = new Date();
    const todayKey = getLocalDate(now);
    let startKey = null;

    if (selectedPeriod !== "all") {
      const start = new Date(now);
      start.setDate(
        start.getDate() - Number(selectedPeriod) + 1
      );
      startKey = getLocalDate(start);
    }

    const filtered = activities.filter((item) => {
      const date = String(item.logDate || "").slice(0, 10);

      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return false;
      }

      const matchesDate =
        !startKey || (date >= startKey && date <= todayKey);

      const matchesUser =
        selectedUser === "all" ||
        String(getActivityUserId(item)) === selectedUser;

      return matchesDate && matchesUser;
    });

    const dailyMap = {};
    const categoryMap = {};
    const userMap = {};

    if (startKey) {
      const cursor = new Date(`${startKey}T12:00:00`);
      const end = new Date(`${todayKey}T12:00:00`);

      while (cursor <= end) {
        const key = getLocalDate(cursor);
        dailyMap[key] = { date: key, logs: 0, emissions: 0 };
        cursor.setDate(cursor.getDate() + 1);
      }
    }

    filtered.forEach((item) => {
      const date = String(item.logDate).slice(0, 10);
      const emission = getEmission(item);
      const category = item.category || "Other";
      const userId = getActivityUserId(item);

      const userKey =
        userId === null ? "unknown" : String(userId);

      if (!dailyMap[date]) {
        dailyMap[date] = {
          date, logs: 0, emissions: 0
        };
      }

      dailyMap[date].logs += 1;
      dailyMap[date].emissions += emission;

      if (!categoryMap[category]) {
        categoryMap[category] = {
          name: formatName(category),
          logs: 0,
          emissions: 0
        };
      }

      categoryMap[category].logs += 1;
      categoryMap[category].emissions += emission;

      if (!userMap[userKey]) {
        const matchedUser = users.find(
          (user) => String(user.id) === userKey
        );

        const embeddedUser = item.user || {};

        userMap[userKey] = {
          id: userKey,
          name:
            matchedUser?.name ||
            embeddedUser.name ||
            matchedUser?.email ||
            embeddedUser.email ||
            (userKey === "unknown"
              ? "Unassigned"
              : `User ${userKey}`),
          logs: 0,
          emissions: 0
        };
      }

      userMap[userKey].logs += 1;
      userMap[userKey].emissions += emission;
    });

    const daily = Object.values(dailyMap).sort(
      (a, b) => a.date.localeCompare(b.date)
    );

    const categories = Object.values(categoryMap).sort(
      (a, b) => b.emissions - a.emissions
    );

    const userStats = Object.values(userMap).sort(
      (a, b) => b.emissions - a.emissions
    );

    const total = filtered.reduce(
      (sum, item) => sum + getEmission(item), 0
    );

    const activeDays = daily.filter(
      (day) => day.logs > 0
    ).length;

    const identifiableUsers = userStats.filter(
      (user) => user.id !== "unknown"
    );

    const mostActiveUser = [...identifiableUsers].sort(
      (a, b) => b.logs - a.logs
    )[0];

    return {
      daily,
      categories,
      userStats,
      total,
      logCount: filtered.length,
      activeDays,
      activeUsers: identifiableUsers.length,

      averageEmission:
        filtered.length ? total / filtered.length : 0,

      averageDailyLogs:
        activeDays ? filtered.length / activeDays : 0,

      highestCategory:
        categories[0]?.name || "—",

      mostActiveUser:
        mostActiveUser?.name || "—",

      topEmitter:
        identifiableUsers[0]?.name || "—"
    };
  }, [activities, users, selectedUser, selectedPeriod]);

  const userMappingAvailable = useMemo(
    () =>
      activities.length === 0 ||
      activities.every(
        (item) => getActivityUserId(item) !== null
      ),
    [activities]
  );

  const managementItems = [
    {
      icon: Users,
      title: "User Management",
      description: "View, add, edit and delete registered users.",
      page: "admin-users",
      button: "Manage Users",
      color: "mint"
    },
    {
      icon: ClipboardList,
      title: "Activity Management",
      description: "View, edit and delete user carbon activities.",
      page: "admin-activities",
      button: "Manage Activities",
      color: "blue"
    },
    {
      icon: Settings,
      title: "Emission Factors",
      description: "Add, edit and delete emission calculation factors.",
      page: "admin-factors",
      button: "Manage Factors",
      color: "peach"
    }
  ];

  // LOADING SCREEN
  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-loading">
          <div className="admin-loader" />
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">

      {/* HEADER */}
      <header className="admin-header">
        <div className="admin-header-left">
          <div className="admin-logo">
            <Leaf size={27} />
          </div>

          <div>
            <span className="admin-eyebrow">
              CARBONDOWN / ADMINISTRATION
            </span>
            <h1>Admin Dashboard</h1>
            <p>
              Monitor your community's carbon footprint and activity.
            </p>
          </div>
        </div>

        <div className="admin-header-actions">
          <button
            className="admin-refresh-btn"
            onClick={() => fetchData()}
            disabled={refreshing}
          >
            <RefreshCw
              size={16}
              className={refreshing ? "admin-spinning" : ""}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          <button
            className="admin-logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      {/* ERROR */}
      {error && (
        <div className="admin-error">
          <span>⚠️ {error}</span>
          <button onClick={() => fetchData()}>
            Retry
          </button>
        </div>
      )}

      {/* NEW ANIMATED HERO POSTER */}
      <section className="admin-hero">
        <div className="admin-hero-content">
          <div className="admin-hero-label">
            <span className="admin-live-dot" />
            CARBONDOWN / COMMAND CENTER
          </div>

          <h2>
            Every insight
            <br />
            <span>drives a greener future.</span>
          </h2>

          <p>
            One intelligent space to understand your community,
            monitor carbon emissions, and turn environmental data
            into meaningful action.
          </p>

          <div className="admin-hero-footer">
            <span>
              <span className="admin-live-dot" />
              SYSTEM ACTIVE
            </span>
            <span>01 / CARBONDOWN ADMIN</span>
          </div>
        </div>

        <div className="admin-hero-visual" aria-hidden="true">
          <div className="admin-orbit admin-orbit-one">
            <span className="admin-orbit-particle" />
          </div>

          <div className="admin-orbit admin-orbit-two">
            <span className="admin-orbit-particle" />
          </div>

          <div className="admin-orbit admin-orbit-three">
            <span className="admin-orbit-particle" />
          </div>

          <div className="admin-orbit-core">
            <Leaf size={64} strokeWidth={1.25} />
          </div>

          <div className="admin-orbit-tag admin-tag-top">
            <span>PLATFORM STATUS</span>
            <strong>ONLINE</strong>
          </div>

          <div className="admin-orbit-tag admin-tag-bottom">
            <span>CLIMATE INTELLIGENCE</span>
            <strong>LIVE DATA</strong>
          </div>
        </div>

        <span className="admin-hero-coordinate">
          EARTH / CARBONDOWN
        </span>
      </section>

      {/* OVERALL STATISTICS */}
      <section className="admin-stats">
        <div className="admin-stat-card mint">
          <div className="stat-icon">
            <Users size={23} />
          </div>
          <div>
            <p>Total Users</p>
            <h2>{users.length}</h2>
            <span>Registered accounts</span>
          </div>
        </div>

        <div className="admin-stat-card blue">
          <div className="stat-icon">
            <ClipboardList size={23} />
          </div>
          <div>
            <p>Total Activities</p>
            <h2>{activities.length}</h2>
            <span>Activities recorded</span>
          </div>
        </div>

        <div className="admin-stat-card peach">
          <div className="stat-icon">
            <Leaf size={23} />
          </div>
          <div>
            <p>Total Emissions</p>
            <h2>{totalEmissions.toFixed(2)}</h2>
            <span>kg CO₂e</span>
          </div>
        </div>

        <div className="admin-stat-card lavender">
          <div className="stat-icon">
            <Settings size={23} />
          </div>
          <div>
            <p>Emission Factors</p>
            <h2>{factors.length}</h2>
            <span>Calculation factors</span>
          </div>
        </div>
      </section>

      {/* ANALYTICS */}
      <section className="admin-analytics">
        <div className="analytics-heading">
          <div>
            <span className="admin-eyebrow">
              PERFORMANCE / DATA INTELLIGENCE
            </span>
            <h2>Carbon Analytics</h2>
            <p>
              Explore activity trends, user engagement and emissions.
            </p>
          </div>

          <div className="analytics-filters">
            <div className="analytics-filter">
              <Users size={15} />
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                disabled={!userMappingAvailable}
                aria-label="Filter by user"
              >
                <option value="all">All Users</option>
                {users.map((user) => (
                  <option
                    key={user.id}
                    value={String(user.id)}
                  >
                    {user.name || user.email || `User ${user.id}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="analytics-filter">
              <CalendarDays size={15} />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                aria-label="Filter by period"
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </div>

        {!userMappingAvailable && (
          <div className="analytics-warning">
            <Filter size={17} />
            Some activities do not contain a user ID.
            User-wise analytics may be incomplete.
            Ensure the admin activities API returns
            activity.user.id or activity.userId.
          </div>
        )}

        {/* ANALYTICS KPI CARDS */}
        <div className="analytics-kpis">
          <div className="analytics-kpi kpi-mint">
            <div className="analytics-kpi-icon">
              <Leaf size={19} />
            </div>
            <span>Filtered Emissions</span>
            <strong>{analytics.total.toFixed(2)}</strong>
            <small>kg CO₂e</small>
          </div>

          <div className="analytics-kpi kpi-blue">
            <div className="analytics-kpi-icon">
              <Activity size={19} />
            </div>
            <span>Activity Logs</span>
            <strong>{analytics.logCount}</strong>
            <small>Logs in selected period</small>
          </div>

          <div className="analytics-kpi kpi-peach">
            <div className="analytics-kpi-icon">
              <Users size={19} />
            </div>
            <span>Active Users</span>
            <strong>{analytics.activeUsers}</strong>
            <small>Users who logged activities</small>
          </div>

          <div className="analytics-kpi kpi-purple">
            <div className="analytics-kpi-icon">
              <TrendingUp size={19} />
            </div>
            <span>Average Per Log</span>
            <strong>
              {analytics.averageEmission.toFixed(2)}
            </strong>
            <small>kg CO₂e / activity</small>
          </div>
        </div>

        {/* CHARTS */}
        <div className="analytics-chart-grid">

          {/* DAILY ACTIVITY CHART */}
          <div className="analytics-chart-card analytics-wide">
            <div className="analytics-chart-header">
              <div>
                <span className="chart-eyebrow">
                  ACTIVITY OVER TIME
                </span>
                <h3>Daily Activity Trends</h3>
                <p>
                  Track how frequently users log activities each day.
                </p>
              </div>

              <div className="analytics-metric-switch">
                <button
                  className={selectedMetric === "logs" ? "active" : ""}
                  onClick={() => setSelectedMetric("logs")}
                >
                  Activity Logs
                </button>
                <button
                  className={
                    selectedMetric === "emissions" ? "active" : ""
                  }
                  onClick={() => setSelectedMetric("emissions")}
                >
                  Emissions
                </button>
              </div>
            </div>

            {analytics.daily.length > 0 ? (
              <div className="analytics-chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={analytics.daily}
                    margin={{
                      top: 10,
                      right: 15,
                      left: -10,
                      bottom: 0
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="adminGreenArea"
                        x1="0" y1="0" x2="0" y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#1bab7d"
                          stopOpacity={0.27}
                        />
                        <stop
                          offset="100%"
                          stopColor="#1bab7d"
                          stopOpacity={0.01}
                        />
                      </linearGradient>

                      <linearGradient
                        id="adminBlueArea"
                        x1="0" y1="0" x2="0" y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#659ee7"
                          stopOpacity={0.28}
                        />
                        <stop
                          offset="100%"
                          stopColor="#659ee7"
                          stopOpacity={0.01}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="4 5"
                      vertical={false}
                      stroke="#e8eee9"
                    />

                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => value.slice(5)}
                      tick={{ fontSize: 11, fill: "#84968b" }}
                      tickLine={false}
                      axisLine={false}
                      minTickGap={25}
                    />

                    <YAxis
                      allowDecimals={selectedMetric !== "logs"}
                      tick={{ fontSize: 11, fill: "#84968b" }}
                      tickLine={false}
                      axisLine={false}
                    />

                    <Tooltip content={<CustomTooltip />} />

                    <Area
                      type="monotone"
                      name={
                        selectedMetric === "logs"
                          ? "Activity Logs"
                          : "Emissions"
                      }
                      dataKey={selectedMetric}
                      stroke={
                        selectedMetric === "logs"
                          ? "#17a678"
                          : "#659ee7"
                      }
                      strokeWidth={3}
                      fill={
                        selectedMetric === "logs"
                          ? "url(#adminGreenArea)"
                          : "url(#adminBlueArea)"
                      }
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="analytics-empty">
                No activities available for this period.
              </div>
            )}
          </div>

          {/* CATEGORY PIE CHART */}
          <div className="analytics-chart-card">
            <div className="analytics-chart-header">
              <div>
                <span className="chart-eyebrow">
                  EMISSION BREAKDOWN
                </span>
                <h3>Emissions by Category</h3>
                <p>Which activities contribute the most?</p>
              </div>
              <div className="chart-header-icon">
                <BarChart3 size={19} />
              </div>
            </div>

            {analytics.categories.length > 0 &&
            analytics.total > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={analytics.categories}
                    dataKey="emissions"
                    nameKey="name"
                    cx="50%"
                    cy="46%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    stroke="none"
                  >
                    {analytics.categories.map((item, index) => (
                      <Cell
                        key={item.name}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(value) =>
                      `${Number(value).toFixed(2)} kg CO₂e`
                    }
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={9}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="analytics-empty">
                No emission data available.
              </div>
            )}
          </div>

          {/* USER-WISE EMISSIONS */}
          <div className="analytics-chart-card">
            <div className="analytics-chart-header">
              <div>
                <span className="chart-eyebrow">
                  COMMUNITY COMPARISON
                </span>
                <h3>User-wise Emissions</h3>
                <p>
                  Emissions recorded by individual users.
                </p>
              </div>
              <div className="chart-header-icon">
                <Users size={19} />
              </div>
            </div>

            {analytics.userStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={analytics.userStats.slice(0, 8)}
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: 15,
                    left: 5,
                    bottom: 5
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="4 5"
                    horizontal={false}
                    stroke="#e8eee9"
                  />

                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "#84968b" }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={95}
                    tick={{ fontSize: 11, fill: "#60796a" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) =>
                      String(value).length > 13
                        ? `${String(value).slice(0, 12)}…`
                        : value
                    }
                  />

                  <Tooltip
                    formatter={(value) =>
                      `${Number(value).toFixed(2)} kg CO₂e`
                    }
                  />

                  <Bar
                    dataKey="emissions"
                    name="Emissions"
                    fill="#70a8e7"
                    radius={[0, 7, 7, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="analytics-empty">
                No user activity data available.
              </div>
            )}
          </div>

          {/* CATEGORY FREQUENCY */}
          <div className="analytics-chart-card">
            <div className="analytics-chart-header">
              <div>
                <span className="chart-eyebrow">
                  LOGGING BEHAVIOUR
                </span>
                <h3>Activity Frequency</h3>
                <p>Number of logs in each category.</p>
              </div>
              <div className="chart-header-icon">
                <ClipboardList size={19} />
              </div>
            </div>

            {analytics.categories.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={analytics.categories}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -20,
                    bottom: 5
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="4 5"
                    vertical={false}
                    stroke="#e8eee9"
                  />

                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#84968b" }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "#84968b" }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="logs"
                    name="Activity Logs"
                    radius={[7, 7, 0, 0]}
                    maxBarSize={52}
                  >
                    {analytics.categories.map((item, index) => (
                      <Cell
                        key={item.name}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="analytics-empty">
                No activity data available.
              </div>
            )}
          </div>

          {/* TOP ACTIVE USERS */}
          <div className="analytics-chart-card">
            <div className="analytics-chart-header">
              <div>
                <span className="chart-eyebrow">
                  USER ENGAGEMENT
                </span>
                <h3>Most Active Users</h3>
                <p>
                  Users ranked by number of activity logs.
                </p>
              </div>
              <div className="chart-header-icon">
                <Award size={19} />
              </div>
            </div>

            {analytics.userStats.filter(
              (item) => item.id !== "unknown"
            ).length > 0 ? (
              <div className="analytics-leaderboard">
                {[...analytics.userStats]
                  .filter((item) => item.id !== "unknown")
                  .sort((a, b) => b.logs - a.logs)
                  .slice(0, 5)
                  .map((item, index) => {
                    const maxLogs = Math.max(
                      1,
                      ...analytics.userStats.map(
                        (user) => user.logs
                      )
                    );

                    return (
                      <div
                        className="leaderboard-item"
                        key={item.id}
                      >
                        <div className="leaderboard-rank">
                          {index + 1}
                        </div>

                        <div className="leaderboard-main">
                          <div className="leaderboard-top">
                            <strong>{item.name}</strong>
                            <span>{item.logs} logs</span>
                          </div>

                          <div className="leaderboard-track">
                            <div
                              className="leaderboard-progress"
                              style={{
                                width: `${
                                  (item.logs / maxLogs) * 100
                                }%`
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="analytics-empty">
                No identifiable user activity available.
              </div>
            )}
          </div>
        </div>

        {/* ANALYTICS INSIGHTS */}
        <div className="analytics-insights">
          <div className="analytics-insight">
            <div className="insight-icon mint">
              <CalendarDays size={19} />
            </div>
            <div>
              <span>Days With Activity</span>
              <strong>{analytics.activeDays}</strong>
              <small>Days containing at least one log</small>
            </div>
          </div>

          <div className="analytics-insight">
            <div className="insight-icon blue">
              <Zap size={19} />
            </div>
            <div>
              <span>Top Emission Category</span>
              <strong>{analytics.highestCategory}</strong>
              <small>Largest contribution to emissions</small>
            </div>
          </div>

          <div className="analytics-insight">
            <div className="insight-icon peach">
              <Award size={19} />
            </div>
            <div>
              <span>Most Active User</span>
              <strong>{analytics.mostActiveUser}</strong>
              <small>Highest number of logged activities</small>
            </div>
          </div>

          <div className="analytics-insight">
            <div className="insight-icon lavender">
              <TrendingUp size={19} />
            </div>
            <div>
              <span>Average Logs Per Active Day</span>
              <strong>
                {analytics.averageDailyLogs.toFixed(1)}
              </strong>
              <small>Logging frequency on active days</small>
            </div>
          </div>
        </div>
      </section>

      {/* MANAGEMENT */}
      <section className="management-section">
        <div className="section-title">
          <span className="admin-eyebrow">
            PLATFORM CONTROLS
          </span>
          <h2>Management</h2>
          <p>
            Manage users, activities and emission factors.
          </p>
        </div>

        <div className="management-grid">
          {managementItems.map((item) => {
            const Icon = item.icon;

            return (
              <div
                className="management-card"
                key={item.page}
              >
                <div
                  className={`management-icon ${item.color}`}
                >
                  <Icon size={25} />
                </div>

                <h3>{item.title}</h3>
                <p>{item.description}</p>

                <button
                  className="management-btn"
                  onClick={() => setPage(item.page)}
                >
                  {item.button}
                  <ArrowRight size={16} />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* RECENT USERS AND ACTIVITIES */}
      <section className="overview-grid">

        {/* RECENT USERS */}
        <div className="overview-card">
          <div className="overview-header">
            <div>
              <span className="admin-eyebrow">
                COMMUNITY
              </span>
              <h2>Recent Users</h2>
              <p>Latest registered users</p>
            </div>

            <button
              onClick={() => setPage("admin-users")}
            >
              View All
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="user-summary">
            {recentUsers.length === 0 ? (
              <p className="empty-message">
                No users found.
              </p>
            ) : (
              recentUsers.map((user) => (
                <div
                  className="recent-user"
                  key={user.id}
                >
                  <div className="user-avatar">
                    {(user.name || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="user-info">
                    <h4>{user.name || "Unnamed User"}</h4>
                    <p>{user.email}</p>
                  </div>

                  <span
                    className={
                      String(user.role || "")
                        .toUpperCase()
                        .includes("ADMIN")
                        ? "role-admin"
                        : "role-user"
                    }
                  >
                    {user.role || "USER"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RECENT ACTIVITIES */}
        <div className="overview-card">
          <div className="overview-header">
            <div>
              <span className="admin-eyebrow">
                LATEST RECORDS
              </span>
              <h2>Recent Activities</h2>
              <p>Latest carbon activity logs</p>
            </div>

            <button
              onClick={() => setPage("admin-activities")}
            >
              View All
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="recent-activity">
            {recentActivities.length === 0 ? (
              <p className="empty-message">
                No activities found.
              </p>
            ) : (
              recentActivities.map((activity) => (
                <div
                  className="recent-activity-item"
                  key={activity.id}
                >
                  <div className="activity-circle">
                    <Leaf size={19} />
                  </div>

                  <div className="activity-info">
                    <h4>
                      {formatName(
                        activity.activityType || "Activity"
                      )}
                    </h4>
                    <p>
                      {formatName(
                        activity.category || "Unknown"
                      )}
                    </p>
                    <small>
                      {formatDate(activity.logDate)}
                    </small>
                  </div>

                  <div className="activity-emission">
                    <strong>
                      {getEmission(activity).toFixed(2)}
                    </strong>
                    <span>kg CO₂e</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* EMISSION FACTORS */}
      <section className="factor-preview-card">
        <div className="overview-header">
          <div>
            <span className="admin-eyebrow">
              EMISSION DATABASE
            </span>
            <h2>Emission Factors</h2>
            <p>
              Current factors used for emission calculations.
            </p>
          </div>

          <button
            onClick={() => setPage("admin-factors")}
          >
            Manage Factors
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="factor-preview-grid">
          {factors.length === 0 ? (
            <p className="empty-message">
              No emission factors found.
            </p>
          ) : (
            factors.slice(0, 8).map((factor) => (
              <div
                className="factor-preview-item"
                key={factor.id}
              >
                <div>
                  <h4>
                    {formatName(factor.activityType)}
                  </h4>
                  <p>Per {factor.unit}</p>
                </div>

                <strong>
                  {Number(
                    factor.factor ??
                    factor.emissionFactor ??
                    factor.factorValue ??
                    0
                  ).toFixed(4)}
                </strong>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
