
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  Leaf,
  Zap,
  Layers,
  TrendingUp,
  Target,
  Lightbulb,
  Award,
  UserRound,
  BarChart3,
  ArrowUpRight,
  Flame,
  PlusCircle,
  AlertTriangle,
  ArrowRight,
  Calendar,
  Gauge
} from "lucide-react";

import ClimatePoster from "./ClimatePoster";
import "./Dashboard.css";

const API_URL = "http://localhost:8080/api";

const COLORS = {
  transport: "#60a5fa",
  electricity: "#f5bb65",
  food: "#a78bfa",
  shopping: "#4dd4a0"
};

const fmt = value => Number(value || 0).toFixed(2);

const title = value =>
  String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, c => c.toUpperCase());

const dateKey = date => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function Dashboard({
  token,
  refreshKey,
  setPage,
  onNavigate
}) {
  const [data, setData] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // NAVIGATION
  // ==========================================

  const navigate = page => {
    const navigateFn =
      typeof setPage === "function"
        ? setPage
        : onNavigate;

    if (typeof navigateFn !== "function") {
      console.error(
        "Dashboard navigation is not connected. Pass setPage={setPage} from App.jsx."
      );
      return;
    }

    navigateFn(page);
  };

  // ==========================================
  // FETCH DASHBOARD DATA
  // ==========================================

  useEffect(() => {
    if (!token) {
      setError("Please sign in to view your dashboard.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const headers = {
          Authorization: `Bearer ${token}`
        };

        const [dashboardResponse, activityResponse] =
          await Promise.all([
            fetch(`${API_URL}/dashboard`, {
              headers,
              signal: controller.signal
            }),
            fetch(`${API_URL}/activities`, {
              headers,
              signal: controller.signal
            })
          ]);

        if (!dashboardResponse.ok || !activityResponse.ok) {
          throw new Error("Unable to load dashboard data.");
        }

        const dashboardData = await dashboardResponse.json();
        const activityData = await activityResponse.json();

        if (!Array.isArray(activityData)) {
          throw new Error("Invalid activities response.");
        }

        setData(dashboardData);
        setActivities(activityData);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => controller.abort();
  }, [token, refreshKey]);

  // ==========================================
  // RECENT ACTIVITIES
  // ==========================================

  const recentActivities = useMemo(() => {
    return [...activities]
      .sort((a, b) =>
        String(b.logDate || "").localeCompare(
          String(a.logDate || "")
        )
      )
      .slice(0, 5);
  }, [activities]);

  // ==========================================
  // ACTIVITY STREAK
  // ==========================================

  const streak = useMemo(() => {
    const loggedDays = new Set(
      activities.map(item =>
        String(item.logDate || "").slice(0, 10)
      )
    );

    const current = new Date();

    if (!loggedDays.has(dateKey(current))) {
      current.setDate(current.getDate() - 1);
    }

    let count = 0;

    while (loggedDays.has(dateKey(current))) {
      count++;
      current.setDate(current.getDate() - 1);
    }

    return count;
  }, [activities]);

  // ==========================================
  // NEW: MAXIMUM EMISSION DETAILS
  // ==========================================

  const emissionInsights = useMemo(() => {
    if (activities.length === 0) {
      return {
        maxActivity: null,
        topCategory: null,
        totalEmission: 0,
        percentage: 0,
        categoryPercentage: 0
      };
    }

    const totalEmission = activities.reduce(
      (sum, item) =>
        sum + Number(item.emission || 0),
      0
    );

    const maxActivity = activities.reduce(
      (max, item) =>
        Number(item.emission || 0) >
        Number(max.emission || 0)
          ? item
          : max,
      activities[0]
    );

    const categoryTotals = {};

    activities.forEach(item => {
      const category = String(
        item.category || "other"
      ).toLowerCase();

      categoryTotals[category] =
        (categoryTotals[category] || 0) +
        Number(item.emission || 0);
    });

    const sortedCategories = Object.entries(
      categoryTotals
    ).sort((a, b) => b[1] - a[1]);

    const topCategory = sortedCategories.length
      ? {
          name: sortedCategories[0][0],
          emission: sortedCategories[0][1]
        }
      : null;

    const percentage =
      totalEmission > 0
        ? (
            Number(maxActivity.emission || 0) /
            totalEmission
          ) * 100
        : 0;

    const categoryPercentage =
      totalEmission > 0 && topCategory
        ? (topCategory.emission / totalEmission) * 100
        : 0;

    return {
      maxActivity,
      topCategory,
      totalEmission,
      percentage,
      categoryPercentage
    };
  }, [activities]);

  const {
    maxActivity,
    topCategory,
    percentage,
    categoryPercentage
  } = emissionInsights;

  // ==========================================
  // STATISTICS
  // ==========================================

  const stats = [
    {
      label: "Total emissions",
      value: fmt(data?.totalEmission),
      unit: "kg CO₂e",
      icon: <Layers size={19} />,
      note: "Lifetime footprint"
    },
    {
      label: "Today's emissions",
      value: fmt(data?.todayEmission),
      unit: "kg CO₂e",
      icon: <Zap size={19} />,
      note: "Current day"
    },
    {
      label: "This month",
      value: fmt(data?.monthEmission),
      unit: "kg CO₂e",
      icon: <TrendingUp size={19} />,
      note: "Monthly footprint"
    },
    {
      label: "Activities logged",
      value: data?.activityCount ?? activities.length,
      unit: "total logs",
      icon: <Activity size={19} />,
      note: "Your contributions"
    }
  ];

  // ==========================================
  // SIDEBAR SHORTCUTS
  // ==========================================

  const shortcuts = [
    {
      name: "Analytics",
      page: "analytics",
      icon: BarChart3,
      description: "Explore trends and detailed reports"
    },
    {
      name: "Activities",
      page: "activities",
      icon: PlusCircle,
      description: "Log and manage your activities"
    },
    {
      name: "My Goals",
      page: "goals",
      icon: Target,
      description: "Track your reduction targets"
    },
    {
      name: "Recommendations",
      page: "recommendations",
      icon: Lightbulb,
      description: "Discover ways to reduce emissions"
    },
    {
      name: "Badges",
      page: "badges",
      icon: Award,
      description: "View your achievements"
    },
    {
      name: "My Profile",
      page: "profile",
      icon: UserRound,
      description: "Manage your personal details"
    }
  ];

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="dashboard-page dash-loading">
        <div className="dash-loader">
          <Leaf size={28} />
        </div>

        <p>Preparing your impact dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page dash-error">
        {error}
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <div className="dash-topline">
        <div>
          <span className="dash-eyebrow">
            YOUR PERSONAL IMPACT SPACE
          </span>

          <h1>
            Overview
            <span className="dash-dot">.</span>
          </h1>

          <p>Small actions. Measurable change.</p>
        </div>

        <div className="dash-date-pill">
          <CalendarDays size={15} />

          {new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
          })}
        </div>
      </div>

      {/* ======================================
          ORIGINAL ANIMATED POSTER
      ====================================== */}

      <ClimatePoster
        totalEmission={data?.totalEmission}
      />

      {/* ======================================
          IMPORTANT KPI CARDS
      ====================================== */}

      <section className="dash-stats">
        {stats.map((stat, index) => (
          <article
            className="dash-stat-card"
            key={stat.label}
          >
            <div className="stat-card-top">
              <span>{stat.label}</span>

              <div className="stat-icon">
                {stat.icon}
              </div>
            </div>

            <div className="stat-card-value">
              <strong>{stat.value}</strong>
              <small>{stat.unit}</small>
            </div>

            <div className="stat-card-foot">
              <span className="stat-indicator" />
              {stat.note}
            </div>

            <span className="stat-card-number">
              0{index + 1}
            </span>
          </article>
        ))}
      </section>

      {/* ======================================
          NEW: MAXIMUM EMISSION SECTION
      ====================================== */}

      <div className="dash-section-heading max-emission-heading">
        <div>
          <span className="dash-eyebrow">
            EMISSION HIGHLIGHTS
          </span>

          <h2>Maximum emission insights</h2>

          <p>
            Identify your biggest emission contributors
            and understand where to improve.
          </p>
        </div>

        <button
          type="button"
          className="max-emission-view-btn"
          onClick={() => navigate("analytics")}
        >
          Detailed analytics
          <ArrowUpRight size={17} />
        </button>
      </div>

      <div className="max-emission-grid">

        {/* HIGHEST EMISSION ACTIVITY */}
        <section className="dash-panel max-emission-card">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">
                HIGHEST SINGLE ACTIVITY
              </span>

              <h3>Maximum emission recorded</h3>

              <p>
                Your highest-emission activity log.
              </p>
            </div>

            <div className="max-emission-icon">
              <Flame size={21} />
            </div>
          </div>

          {maxActivity ? (
            <>
              <div className="max-emission-value">
                <strong>
                  {fmt(maxActivity.emission)}
                </strong>

                <span>kg CO₂e</span>
              </div>

              <div className="max-emission-activity">
                <div className="max-emission-activity-icon">
                  <AlertTriangle size={20} />
                </div>

                <div>
                  <span>Activity responsible</span>

                  <strong>
                    {title(maxActivity.activityType)}
                  </strong>
                </div>
              </div>

              <div className="max-emission-details">
                <div>
                  <span>Category</span>

                  <strong>
                    {title(maxActivity.category)}
                  </strong>
                </div>

                <div>
                  <span>Date logged</span>

                  <strong>
                    <Calendar size={14} />
                    {maxActivity.logDate || "—"}
                  </strong>
                </div>

                <div>
                  <span>Quantity</span>

                  <strong>
                    {maxActivity.quantity ?? "—"}
                    {maxActivity.unit
                      ? ` ${maxActivity.unit}`
                      : ""}
                  </strong>
                </div>
              </div>

              <div className="max-emission-progress">
                <div className="max-emission-progress-label">
                  <span>
                    Share of total emissions
                  </span>

                  <strong>
                    {percentage.toFixed(1)}%
                  </strong>
                </div>

                <div className="max-emission-progress-track">
                  <div
                    className="max-emission-progress-fill"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, percentage)
                      )}%`
                    }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="max-emission-empty">
              <Leaf size={32} />

              <strong>No emissions recorded</strong>

              <p>
                Log an activity to discover your
                highest emission.
              </p>
            </div>
          )}
        </section>

        {/* HIGHEST EMISSION CATEGORY */}
        <section className="dash-panel max-category-card">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">
                TOP CONTRIBUTING CATEGORY
              </span>

              <h3>Largest emission source</h3>

              <p>
                The category producing the most emissions.
              </p>
            </div>

            <div className="max-category-icon">
              <Gauge size={21} />
            </div>
          </div>

          {topCategory ? (
            <>
              <div className="max-category-name">
                <span
                  className="max-category-dot"
                  style={{
                    background:
                      COLORS[topCategory.name] ||
                      "#159b70"
                  }}
                />

                <strong>
                  {title(topCategory.name)}
                </strong>
              </div>

              <div className="max-category-value">
                <strong>
                  {fmt(topCategory.emission)}
                </strong>

                <span>kg CO₂e</span>
              </div>

              <div className="max-category-percentage">
                <span>
                  Contribution to your total footprint
                </span>

                <strong>
                  {categoryPercentage.toFixed(1)}%
                </strong>
              </div>

              <div className="max-category-progress-track">
                <div
                  className="max-category-progress-fill"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(0, categoryPercentage)
                    )}%`,
                    background:
                      COLORS[topCategory.name] ||
                      "#159b70"
                  }}
                />
              </div>

              <div className="max-category-message">
                <Leaf size={19} />

                <p>
                  Focus on reducing emissions from
                  <strong>
                    {" "}
                    {title(topCategory.name)}
                  </strong>
                  {" "}to make a meaningful difference
                  in your carbon footprint.
                </p>
              </div>

              <button
                type="button"
                className="max-category-action"
                onClick={() =>
                  navigate("recommendations")
                }
              >
                Explore recommendations
                <ArrowRight size={17} />
              </button>
            </>
          ) : (
            <div className="max-emission-empty">
              <Leaf size={32} />

              <strong>No category data yet</strong>

              <p>
                Start logging activities to view
                your emission sources.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* ======================================
          QUICK ACCESS
      ====================================== */}

      <div className="dash-section-heading">
        <div>
          <span className="dash-eyebrow">
            YOUR WORKSPACE
          </span>

          <h2>Quick access</h2>

          <p>
            Everything you need, just one click away.
          </p>
        </div>
      </div>

      <div className="overview-shortcuts">
        {shortcuts.map(shortcut => {
          const Icon = shortcut.icon;

          return (
            <button
              key={shortcut.page}
              type="button"
              className="overview-shortcut"
              onClick={() =>
                navigate(shortcut.page)
              }
            >
              <span className="overview-shortcut-icon">
                <Icon size={23} />
              </span>

              <span className="overview-shortcut-text">
                <strong>
                  {shortcut.name}
                </strong>

                <small>
                  {shortcut.description}
                </small>
              </span>

              <ArrowUpRight
                size={19}
                className="overview-arrow"
              />
            </button>
          );
        })}
      </div>

      {/* ======================================
          GOALS AND STREAK
      ====================================== */}

      <div className="overview-highlights">

        {/* GOALS */}
        <section className="dash-panel overview-goal">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">
                YOUR COMMITMENT
              </span>

              <h3>Reduction goals</h3>

              <p>
                Keep moving towards a greener future.
              </p>
            </div>

            <div className="panel-icon">
              <Target size={19} />
            </div>
          </div>

          <div className="overview-goal-content">
            <Target size={34} />

            <strong>
              Your climate goals
            </strong>

            <p>
              View your actual reduction targets,
              weekly progress and goal status in My Goals.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("goals")
              }
            >
              View my goals
              <ArrowUpRight size={16} />
            </button>
          </div>
        </section>

        {/* STREAK */}
        <section className="dash-panel overview-streak">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">
                YOUR CONSISTENCY
              </span>

              <h3>Logging streak</h3>

              <p>
                Every day of action matters.
              </p>
            </div>

            <div className="panel-icon">
              <Flame size={19} />
            </div>
          </div>

          <div className="overview-streak-value">
            <Flame size={37} />

            <strong>{streak}</strong>

            <span>consecutive days</span>
          </div>

          <p>
            Keep logging activities to build your streak.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("activities")
            }
          >
            Log an activity
            <ArrowUpRight size={16} />
          </button>
        </section>
      </div>

      {/* ======================================
          RECENT ACTIVITIES
      ====================================== */}

      <section className="dash-panel dash-recent-panel">
        <div className="panel-heading">
          <div>
            <span className="panel-kicker">
              LATEST UPDATES
            </span>

            <h3>
              Recent activity highlights
            </h3>

            <p>
              Your latest recorded environmental activities.
            </p>
          </div>

          <button
            type="button"
            className="overview-text-link"
            onClick={() =>
              navigate("activities")
            }
          >
            View all
            <ArrowUpRight size={16} />
          </button>
        </div>

        <div className="dash-activity-list">
          {recentActivities.length > 0 ? (
            recentActivities.map((item, index) => {
              const category = String(
                item.category || ""
              ).toLowerCase();

              const color =
                COLORS[category] || "#159b70";

              return (
                <div
                  className="dash-activity-row"
                  key={item.id ?? index}
                >
                  <div
                    className="activity-category-icon"
                    style={{
                      background: `${color}20`,
                      color
                    }}
                  >
                    <Leaf size={18} />
                  </div>

                  <div className="activity-info">
                    <strong>
                      {title(item.activityType)}
                    </strong>

                    <span>
                      {title(item.category)}
                      {" · "}
                      {item.logDate}
                    </span>
                  </div>

                  <div className="activity-emission">
                    <strong>
                      {fmt(item.emission)}
                    </strong>

                    <span>kg CO₂e</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="dash-empty">
              <Leaf size={28} />

              <strong>
                No activities yet
              </strong>

              <p>
                Start by logging your first activity.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ======================================
          FOOTER
      ====================================== */}

      <footer className="dash-footer">
        <span>
          CARBONDOWN
          <span className="dash-dot">
            {" "}✳{" "}
          </span>
          YOUR IMPACT MATTERS
        </span>

        <span>
          Measured in kg CO₂ equivalent
        </span>
      </footer>
    </div>
  );
}
