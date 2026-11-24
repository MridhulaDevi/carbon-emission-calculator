
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Flame,
  Leaf,
  TrendingUp,
  BarChart3
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";

import ClimatePoster from "./ClimatePoster";
import CommunityAnalytics from "./CommunityAnalytics";
import "./Dashboard.css";
import "./Analytics.css";

const API = "http://localhost:8080/api";

const COLORS = {
  transport: "#60a5fa",
  electricity: "#f5bb65",
  food: "#a78bfa",
  shopping: "#4dd4a0"
};

const CATEGORIES = Object.keys(COLORS);

const fmt = value => Number(value || 0).toFixed(2);

const title = value =>
  String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, c => c.toUpperCase());

function dateKey(date) {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function Analytics({ token, refreshKey }) {
  const today = dateKey(new Date());

  const [data, setData] = useState(null);
  const [activities, setActivities] = useState([]);

  const [filter, setFilter] = useState("month");
  const [category, setCategory] = useState("all");

  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedMonth, setSelectedMonth] = useState(today.slice(0, 7));

  const [heatYear, setHeatYear] = useState(
    new Date().getFullYear()
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH DATA
  // ==========================================

  useEffect(() => {
    if (!token) {
      setError("Please sign in to view analytics.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError("");

      try {
        const headers = {
          Authorization: `Bearer ${token}`
        };

        const [dashboardResponse, activityResponse] =
          await Promise.all([
            fetch(`${API}/dashboard`, {
              headers,
              signal: controller.signal
            }),
            fetch(`${API}/activities`, {
              headers,
              signal: controller.signal
            })
          ]);

        if (!dashboardResponse.ok || !activityResponse.ok) {
          throw new Error("Unable to load analytics.");
        }

        const dashboardData = await dashboardResponse.json();
        const activityData = await activityResponse.json();

        if (!Array.isArray(activityData)) {
          throw new Error("Invalid activity data.");
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

    load();

    return () => controller.abort();
  }, [token, refreshKey]);

  // ==========================================
  // SORT ACTIVITIES
  // ==========================================

  const sorted = useMemo(() => {
    return [...activities].sort((a, b) =>
      String(b.logDate || "").localeCompare(
        String(a.logDate || "")
      )
    );
  }, [activities]);

  // ==========================================
  // DATE + CATEGORY FILTER
  // ==========================================

  const filtered = useMemo(() => {
    return sorted.filter(item => {
      const date = String(item.logDate || "").slice(0, 10);

      const matchDate =
        filter === "day"
          ? date === selectedDate
          : filter === "month"
          ? date.startsWith(selectedMonth)
          : true;

      const matchCategory =
        category === "all" ||
        String(item.category || "").toLowerCase() === category;

      return matchDate && matchCategory;
    });
  }, [
    sorted,
    filter,
    category,
    selectedDate,
    selectedMonth
  ]);

  // ==========================================
  // EMISSION CALCULATIONS
  // ==========================================

  const total = filtered.reduce(
    (sum, item) => sum + Number(item.emission || 0),
    0
  );

  const categoryData = CATEGORIES.map(currentCategory => {
    const items = filtered.filter(
      item =>
        String(item.category || "").toLowerCase() ===
        currentCategory
    );

    return {
      name: title(currentCategory),
      category: currentCategory,
      value: items.reduce(
        (sum, item) => sum + Number(item.emission || 0),
        0
      ),
      count: items.length
    };
  });

  const activeCategories = categoryData.filter(
    item => item.value > 0
  );

  const topCategory = [...categoryData].sort(
    (a, b) => b.value - a.value
  )[0];

  // ==========================================
  // NEW: ACTIVITY COUNT BY CATEGORY
  // ==========================================

  const activityCategoryData = categoryData.filter(
    item => item.count > 0
  );

  const totalActivities = filtered.length;

  // ==========================================
  // DAILY ACTIVITY COUNTS
  // ==========================================

  const dailyCounts = useMemo(() => {
    const counts = {};

    activities.forEach(item => {
      const key = String(item.logDate || "").slice(0, 10);

      if (key) {
        counts[key] = (counts[key] || 0) + 1;
      }
    });

    return counts;
  }, [activities]);

  const activeDays = new Set(
    filtered.map(item =>
      String(item.logDate || "").slice(0, 10)
    )
  ).size;

  const average = activeDays ? total / activeDays : 0;

  // ==========================================
  // STREAK
  // ==========================================

  const streak = useMemo(() => {
    const date = new Date();

    if (!dailyCounts[dateKey(date)]) {
      date.setDate(date.getDate() - 1);
    }

    let count = 0;

    while (dailyCounts[dateKey(date)]) {
      count++;
      date.setDate(date.getDate() - 1);
    }

    return count;
  }, [dailyCounts]);

  // ==========================================
  // EMISSION TREND DATA
  // ==========================================

  const chartData = useMemo(() => {
    const map = {};

    filtered.forEach(item => {
      const date = String(item.logDate || "").slice(0, 10);

      if (!date) return;

      const key =
        filter === "all" ? date.slice(0, 7) : date;

      map[key] =
        (map[key] || 0) + Number(item.emission || 0);
    });

    if (filter === "month") {
      const [year, month] = selectedMonth
        .split("-")
        .map(Number);

      const days = new Date(year, month, 0).getDate();

      return Array.from({ length: days }, (_, index) => {
        const key = `${selectedMonth}-${String(
          index + 1
        ).padStart(2, "0")}`;

        return {
          date: String(index + 1),
          fullDate: key,
          emission: map[key] || 0
        };
      });
    }

    if (filter === "day") {
      return [
        {
          date: selectedDate.slice(8),
          fullDate: selectedDate,
          emission: map[selectedDate] || 0
        }
      ];
    }

    return Object.keys(map)
      .sort()
      .map(key => ({
        date: key,
        fullDate: key,
        emission: map[key]
      }));
  }, [
    filtered,
    filter,
    selectedDate,
    selectedMonth
  ]);

  // ==========================================
  // NEW: ACTIVITY LOGGING TREND DATA
  // ==========================================

  const activityChartData = useMemo(() => {
    const counts = {};

    filtered.forEach(item => {
      const date = String(item.logDate || "").slice(0, 10);

      if (!date) return;

      const key =
        filter === "all" ? date.slice(0, 7) : date;

      counts[key] = (counts[key] || 0) + 1;
    });

    if (filter === "month") {
      const [year, month] = selectedMonth
        .split("-")
        .map(Number);

      const days = new Date(year, month, 0).getDate();

      return Array.from({ length: days }, (_, index) => {
        const key = `${selectedMonth}-${String(
          index + 1
        ).padStart(2, "0")}`;

        return {
          date: String(index + 1),
          fullDate: key,
          count: counts[key] || 0
        };
      });
    }

    if (filter === "day") {
      return [
        {
          date: selectedDate.slice(8),
          fullDate: selectedDate,
          count: counts[selectedDate] || 0
        }
      ];
    }

    return Object.keys(counts)
      .sort()
      .map(key => ({
        date: key,
        fullDate: key,
        count: counts[key]
      }));
  }, [
    filtered,
    filter,
    selectedDate,
    selectedMonth
  ]);

  // ==========================================
  // HEATMAP
  // ==========================================

  const heatmap = useMemo(() => {
    const first = new Date(heatYear, 0, 1);
    const last = new Date(heatYear, 11, 31);

    const start = new Date(first);
    start.setDate(start.getDate() - start.getDay());

    const end = new Date(last);
    end.setDate(end.getDate() + 6 - end.getDay());

    const weeks = [];
    const current = new Date(start);

    while (current <= end) {
      const week = [];

      for (let i = 0; i < 7; i++) {
        const key = dateKey(current);

        week.push({
          key,
          count: dailyCounts[key] || 0,
          valid: current.getFullYear() === heatYear,
          month: current.getMonth()
        });

        current.setDate(current.getDate() + 1);
      }

      weeks.push(week);
    }

    return weeks;
  }, [heatYear, dailyCounts]);

  const heatTotal = activities.filter(
    item =>
      String(item.logDate || "").startsWith(
        String(heatYear)
      )
  ).length;

  // ==========================================
  // LOADING / ERROR
  // ==========================================

  if (loading) {
    return (
      <div className="dashboard-page dash-loading">
        <div className="dash-loader">
          <Leaf size={28} />
        </div>
        <p>Preparing your analytics...</p>
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
    <div className="dashboard-page analytics-page">

      {/* HEADER */}
      <div className="dash-topline">
        <div>
          <span className="dash-eyebrow">
            YOUR ENVIRONMENTAL INTELLIGENCE
          </span>

          <h1>
            Analytics<span className="dash-dot">.</span>
          </h1>

          <p>
            Understand every detail of your carbon footprint.
          </p>
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

      {/* ANIMATED POSTER */}
      <ClimatePoster
        totalEmission={data?.totalEmission}
        analytics
      />

      {/* FILTER HEADER */}
      <div className="dash-section-heading">
        <div>
          <span className="dash-eyebrow">
            EXPLORE YOUR DATA
          </span>

          <h2>Emission & Activity Analysis</h2>

          <p>
            Filter your footprint and activity logs by
            time and category.
          </p>
        </div>

        <div className="dash-filter-group">
          {[
            ["day", "Day"],
            ["month", "Month"],
            ["all", "All time"]
          ].map(([value, label]) => (
            <button
              type="button"
              key={value}
              className={filter === value ? "active" : ""}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* DATE + CATEGORY FILTERS */}
      <div className="dash-date-filter analytics-filters">

        {filter !== "all" && (
          <>
            <CalendarDays size={16} />

            <span>
              {filter === "day" ? "Date" : "Month"}
            </span>

            <input
              type={filter === "day" ? "date" : "month"}
              value={
                filter === "day"
                  ? selectedDate
                  : selectedMonth
              }
              onChange={event => {
                if (filter === "day") {
                  setSelectedDate(event.target.value);
                } else {
                  setSelectedMonth(event.target.value);
                }
              }}
            />
          </>
        )}

        <label htmlFor="analytics-category">
          Category
        </label>

        <select
          id="analytics-category"
          value={category}
          onChange={event =>
            setCategory(event.target.value)
          }
        >
          <option value="all">
            All categories
          </option>

          {CATEGORIES.map(item => (
            <option key={item} value={item}>
              {title(item)}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="analytics-reset"
          onClick={() => {
            setFilter("month");
            setCategory("all");
            setSelectedDate(today);
            setSelectedMonth(today.slice(0, 7));
          }}
        >
          Reset filters
        </button>

        <span className="filter-count">
          {filtered.length} activities found
        </span>
      </div>

      {/* SUMMARY CARDS */}
      <div className="analytics-summary">

        <div className="dash-insight">
          <div className="insight-icon mint">
            <Leaf size={20} />
          </div>

          <span>Selected emissions</span>

          <strong>
            {fmt(total)} <em>kg</em>
          </strong>

          <small>CO₂ equivalent</small>
        </div>

        <div className="dash-insight">
          <div className="insight-icon amber">
            <Activity size={20} />
          </div>

          <span>Activities logged</span>

          <strong>{totalActivities}</strong>

          <small>Matching your filters</small>
        </div>

        <div className="dash-insight">
          <div className="insight-icon violet">
            <BarChart3 size={20} />
          </div>

          <span>Average per active day</span>

          <strong>
            {fmt(average)} <em>kg</em>
          </strong>

          <small>Selected period</small>
        </div>

        <div className="dash-insight">
          <div className="insight-icon blue">
            <TrendingUp size={20} />
          </div>

          <span>Top emission source</span>

          <strong className="insight-category">
            {topCategory?.value
              ? topCategory.name
              : "—"}
          </strong>

          <small>Highest in selected period</small>
        </div>
      </div>

      {/* ======================================
          EXISTING EMISSION CHARTS
      ====================================== */}

      <div className="dash-charts-grid">

        {/* EMISSION LINE / AREA CHART */}
        <section className="dash-panel dash-line-panel">

          <div className="panel-heading">
            <div>
              <span className="panel-kicker">
                EMISSION ANALYSIS
              </span>

              <h3>Carbon footprint trend</h3>

              <p>
                Track how your emissions evolve over time.
              </p>
            </div>

            <div className="panel-icon">
              <TrendingUp size={19} />
            </div>
          </div>

          <div className="chart-total">
            <strong>{fmt(total)}</strong>
            <span>kg CO₂e</span>

            <div className="chart-total-label">
              Selected period
            </div>
          </div>

          <div className="dash-line-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{
                  top: 15,
                  right: 12,
                  left: -18,
                  bottom: 0
                }}
              >
                <defs>
                  <linearGradient
                    id="carbonArea"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#2fbf89"
                      stopOpacity={0.28}
                    />

                    <stop
                      offset="95%"
                      stopColor="#2fbf89"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="#e8efeb"
                  strokeDasharray="4 5"
                  vertical={false}
                />

                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: "#91a09a",
                    fontSize: 11
                  }}
                  minTickGap={22}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: "#91a09a",
                    fontSize: 11
                  }}
                  width={45}
                />

                <Tooltip
                  formatter={value => [
                    `${fmt(value)} kg CO₂e`,
                    "Emissions"
                  ]}
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.fullDate || ""
                  }
                />

                <Area
                  type="monotone"
                  dataKey="emission"
                  stroke="#159b70"
                  strokeWidth={3}
                  fill="url(#carbonArea)"
                  dot={chartData.length === 1}
                  activeDot={{
                    r: 6,
                    fill: "#159b70"
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* EMISSION PIE CHART */}
        <section className="dash-panel dash-pie-panel">

          <div className="panel-heading">
            <div>
              <span className="panel-kicker">
                EMISSION BREAKDOWN
              </span>

              <h3>Emission sources</h3>

              <p>
                Where your carbon footprint comes from.
              </p>
            </div>

            <div className="panel-icon">
              <CircleDot size={19} />
            </div>
          </div>

          <div className="dash-donut-wrap">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={activeCategories}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={91}
                  paddingAngle={3}
                  stroke="none"
                >
                  {activeCategories.map(item => (
                    <Cell
                      key={item.category}
                      fill={COLORS[item.category]}
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={value =>
                    `${fmt(value)} kg CO₂e`
                  }
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="donut-center">
              <span>TOTAL</span>
              <strong>{fmt(total)}</strong>
              <small>kg CO₂e</small>
            </div>
          </div>

          <div className="dash-category-list">
            {categoryData.map(item => (
              <div
                className="category-row"
                key={item.category}
              >
                <div className="category-name">
                  <span
                    style={{
                      background: COLORS[item.category]
                    }}
                  />
                  {item.name}
                </div>

                <div className="category-amount">
                  <strong>
                    {total
                      ? (
                          (item.value / total) *
                          100
                        ).toFixed(1)
                      : "0.0"}%
                  </strong>

                  <small>
                    {fmt(item.value)} kg
                  </small>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ======================================
          NEW ACTIVITY LOGGING CHARTS
      ====================================== */}

      <div className="dash-section-heading analytics-activity-heading">
        <div>
          <span className="dash-eyebrow">
            ACTIVITY INSIGHTS
          </span>

          <h2>Activity logging analysis</h2>

          <p>
            Understand how frequently you log activities
            and which categories you use most.
          </p>
        </div>
      </div>

      <div className="dash-charts-grid">

        {/* NEW ACTIVITY LINE CHART */}
        <section className="dash-panel analytics-activity-line-panel">

          <div className="panel-heading">
            <div>
              <span className="panel-kicker">
                LOGGING FREQUENCY
              </span>

              <h3>Activities logged over time</h3>

              <p>
                Number of activities recorded during
                the selected period.
              </p>
            </div>

            <div className="panel-icon">
              <Activity size={19} />
            </div>
          </div>

          <div className="chart-total">
            <strong>{totalActivities}</strong>
            <span>activities</span>

            <div className="chart-total-label">
              Total logged in selected period
            </div>
          </div>

          <div className="dash-line-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={activityChartData}
                margin={{
                  top: 15,
                  right: 12,
                  left: -18,
                  bottom: 0
                }}
              >
                <CartesianGrid
                  stroke="#e8efeb"
                  strokeDasharray="4 5"
                  vertical={false}
                />

                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: "#91a09a",
                    fontSize: 11
                  }}
                  minTickGap={22}
                />

                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: "#91a09a",
                    fontSize: 11
                  }}
                  width={45}
                />

                <Tooltip
                  formatter={value => [
                    value,
                    "Activities logged"
                  ]}
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.fullDate || ""
                  }
                />

                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#438fe0"
                  strokeWidth={3}
                  dot={activityChartData.length === 1
                    ? { r: 5 }
                    : false}
                  activeDot={{
                    r: 6,
                    fill: "#438fe0"
                  }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* NEW CATEGORY-WISE ACTIVITY PIE CHART */}
        <section className="dash-panel analytics-activity-pie-panel">

          <div className="panel-heading">
            <div>
              <span className="panel-kicker">
                ACTIVITY DISTRIBUTION
              </span>

              <h3>Activities by category</h3>

              <p>
                Percentage of logged activities
                in each category.
              </p>
            </div>

            <div className="panel-icon">
              <CircleDot size={19} />
            </div>
          </div>

          <div className="dash-donut-wrap">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={activityCategoryData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={91}
                  paddingAngle={3}
                  stroke="none"
                >
                  {activityCategoryData.map(item => (
                    <Cell
                      key={item.category}
                      fill={COLORS[item.category]}
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={value => [
                    value,
                    "Activities"
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="donut-center">
              <span>LOGGED</span>
              <strong>{totalActivities}</strong>
              <small>activities</small>
            </div>
          </div>

          <div className="dash-category-list">
            {categoryData.map(item => (
              <div
                className="category-row"
                key={item.category}
              >
                <div className="category-name">
                  <span
                    style={{
                      background: COLORS[item.category]
                    }}
                  />
                  {item.name}
                </div>

                <div className="category-amount">
                  <strong>
                    {totalActivities
                      ? (
                          (item.count / totalActivities) *
                          100
                        ).toFixed(1)
                      : "0.0"}%
                  </strong>

                  <small>
                    {item.count} activities
                  </small>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ======================================
          EXISTING ACTIVITY HEATMAP
      ====================================== */}

      <section className="dash-panel dash-heatmap-panel">

        <div className="panel-heading">
          <div>
            <span className="panel-kicker">
              YOUR CONSISTENCY
            </span>

            <h3>Activity calendar</h3>

            <p>
              Every green square represents a day you showed up.
            </p>
          </div>

          <div className="heatmap-year-nav">
            <button
              type="button"
              onClick={() =>
                setHeatYear(year => year - 1)
              }
            >
              <ChevronLeft size={17} />
            </button>

            <strong>{heatYear}</strong>

            <button
              type="button"
              disabled={
                heatYear >= new Date().getFullYear()
              }
              onClick={() =>
                setHeatYear(year => year + 1)
              }
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>

        <div className="heatmap-summary">
          <strong>{heatTotal}</strong>

          <span>
            activities logged in {heatYear}
          </span>

          <div className="heatmap-summary-line" />

          <Flame size={16} />

          <strong>{streak}</strong>

          <span>day streak</span>
        </div>

        <div className="heatmap-scroll">
          <div className="heatmap-layout">

            <div className="heatmap-days">
              <span />
              <span>Mon</span>
              <span />
              <span>Wed</span>
              <span />
              <span>Fri</span>
              <span />
            </div>

            <div className="heatmap-content">

              <div className="heatmap-months">
                {heatmap.map((week, index) => {
                  const first = week.find(
                    day => day.valid
                  );

                  const previous = heatmap[
                    index - 1
                  ]?.find(day => day.valid);

                  const show =
                    first &&
                    (
                      index === 0 ||
                      !previous ||
                      first.month !== previous.month
                    );

                  return (
                    <span key={index}>
                      {show
                        ? new Date(
                            heatYear,
                            first.month,
                            1
                          ).toLocaleString("en", {
                            month: "short"
                          })
                        : ""}
                    </span>
                  );
                })}
              </div>

              <div className="heatmap-weeks">
                {heatmap.map((week, index) => (
                  <div
                    className="heatmap-week"
                    key={index}
                  >
                    {week.map(day => {
                      const level =
                        day.count === 0
                          ? 0
                          : day.count === 1
                          ? 1
                          : day.count <= 3
                          ? 2
                          : day.count <= 5
                          ? 3
                          : 4;

                      return (
                        <button
                          type="button"
                          key={day.key}
                          disabled={!day.valid}
                          className={`heat-cell level-${level} ${
                            !day.valid ? "invalid" : ""
                          }`}
                          title={`${day.key}: ${day.count} activities`}
                          onClick={() => {
                            setSelectedDate(day.key);
                            setFilter("day");
                          }}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="heatmap-footer">
          <span>
            Click a square to view that day's analytics
          </span>

          <div className="heatmap-legend">
            Less

            {[0, 1, 2, 3, 4].map(level => (
              <span
                key={level}
                className={`heat-cell level-${level}`}
              />
            ))}

            More
          </div>
        </div>
      </section>

      {/* ======================================
          EXISTING ACTIVITY DETAILS
      ====================================== */}

      <section className="dash-panel dash-recent-panel">

        <div className="panel-heading">
          <div>
            <span className="panel-kicker">
              FILTERED ACTIVITY LOG
            </span>

            <h3>Activity details</h3>

            <p>
              Activities matching your selected filters.
            </p>
          </div>

          <div className="panel-icon">
            <Activity size={19} />
          </div>
        </div>

        <div className="dash-activity-list">
          {filtered.length > 0 ? (
            filtered.map((item, index) => {
              const currentCategory = String(
                item.category || ""
              ).toLowerCase();

              const color =
                COLORS[currentCategory] || "#4dd4a0";

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

              <strong>No activities found</strong>

              <p>
                Try another date or category.
              </p>
            </div>
          )}
        </div>
      </section>
      {/* COMMUNITY LEADERBOARD AND PEER BENCHMARKING */}

    <CommunityAnalytics
      token={token}
      refreshKey={refreshKey}
      filter={filter}
      category={category}
      selectedDate={selectedDate}
      selectedMonth={selectedMonth}
      />

      {/* FOOTER */}
      <footer className="dash-footer">
        <span>
          CARBONDOWN ✳ YOUR IMPACT MATTERS
        </span>

        <span>
          Measured in kg CO₂ equivalent
        </span>
      </footer>
    </div>
  );
}
