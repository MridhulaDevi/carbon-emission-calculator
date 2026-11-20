
import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowUpRight, CalendarDays,
  ChevronLeft, ChevronRight, CircleDot, Flame, Leaf,
  Sparkles, TrendingUp, Zap, Layers, BarChart3
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, PieChart, Pie, Cell
} from "recharts";
import "./Dashboard.css";

const API_URL = "http://localhost:8080/api";

const COLORS = {
  transport: "#60a5fa",
  electricity: "#f5bb65",
  food: "#a78bfa",
  shopping: "#4dd4a0"
};

const categories = ["transport", "electricity", "food", "shopping"];

const number = value => Number(value || 0);
const fmt = value => number(value).toFixed(2);
const title = value => String(value || "")
  .replaceAll("_", " ")
  .replace(/\b\w/g, c => c.toUpperCase());

const dateKey = date => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const today = dateKey(new Date());

function Dashboard({ token, refreshKey }) {
  const [data, setData] = useState(null);
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("month");
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedMonth, setSelectedMonth] = useState(today.slice(0, 7));
  const [heatYear, setHeatYear] = useState(new Date().getFullYear());

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const headers = { Authorization: `Bearer ${token}` };

        const [dashboardRes, activityRes] = await Promise.all([
          fetch(`${API_URL}/dashboard`, { headers }),
          fetch(`${API_URL}/activities`, { headers })
        ]);

        if (!dashboardRes.ok || !activityRes.ok) {
          throw new Error("Unable to load dashboard analytics.");
        }

        const dashboardData = await dashboardRes.json();
        const activityData = await activityRes.json();

        if (!Array.isArray(activityData)) {
          throw new Error("Activities API must return an array.");
        }

        if (active) {
          setData(dashboardData);
          setActivities(activityData);
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    if (token) load();
    else {
      setError("Please sign in to view your dashboard.");
      setLoading(false);
    }

    return () => { active = false; };
  }, [token, refreshKey]);

  const sorted = useMemo(() => [...activities].sort(
    (a, b) => String(b.logDate || "").localeCompare(String(a.logDate || ""))
  ), [activities]);

  const filtered = useMemo(() => sorted.filter(item => {
    const date = String(item.logDate || "").slice(0, 10);
    if (filter === "day") return date === selectedDate;
    if (filter === "month") return date.startsWith(selectedMonth);
    return true;
  }), [sorted, filter, selectedDate, selectedMonth]);

  const filteredEmission = filtered.reduce(
    (sum, a) => sum + number(a.emission), 0
  );

  const categoryData = categories.map(category => ({
    name: title(category),
    category,
    value: filtered
      .filter(a => String(a.category).toLowerCase() === category)
      .reduce((sum, a) => sum + number(a.emission), 0),
    count: filtered.filter(
      a => String(a.category).toLowerCase() === category
    ).length
  }));

  const activeCategories = categoryData.filter(a => a.value > 0);
  const topCategory = [...categoryData].sort(
    (a, b) => b.value - a.value
  )[0];

  const dailyCounts = useMemo(() => {
    const counts = {};
    activities.forEach(a => {
      const key = String(a.logDate || "").slice(0, 10);
      if (key) counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [activities]);

  const activeDays = Object.keys(dailyCounts).length;

  const streak = useMemo(() => {
    let count = 0;
    const d = new Date();
    if (!dailyCounts[dateKey(d)]) d.setDate(d.getDate() - 1);
    while (dailyCounts[dateKey(d)]) {
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  }, [dailyCounts]);

  const chartData = useMemo(() => {
    const map = {};

    filtered.forEach(a => {
      const date = String(a.logDate || "").slice(0, 10);
      if (!date) return;
      const key = filter === "all" ? date.slice(0, 7) : date;
      map[key] = (map[key] || 0) + number(a.emission);
    });

    if (filter === "month") {
      const [year, month] = selectedMonth.split("-").map(Number);
      const days = new Date(year, month, 0).getDate();
      return Array.from({ length: days }, (_, i) => {
        const key = `${selectedMonth}-${String(i + 1).padStart(2, "0")}`;
        return { date: String(i + 1), fullDate: key, emission: map[key] || 0 };
      });
    }

    if (filter === "day") {
      return [{
        date: selectedDate.slice(8),
        fullDate: selectedDate,
        emission: map[selectedDate] || 0
      }];
    }

    return Object.keys(map).sort().map(key => ({
      date: key,
      fullDate: key,
      emission: map[key]
    }));
  }, [filtered, filter, selectedMonth, selectedDate]);

  const heatmap = useMemo(() => {
    const first = new Date(heatYear, 0, 1);
    const last = new Date(heatYear, 11, 31);
    const start = new Date(first);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(last);
    end.setDate(end.getDate() + (6 - end.getDay()));

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
    a => String(a.logDate || "").startsWith(String(heatYear))
  ).length;

  const average = activeDays
    ? activities.reduce((s, a) => s + number(a.emission), 0) / activeDays
    : 0;

  if (loading) {
    return (
      <div className="dashboard-page dash-loading">
        <div className="dash-loader"><Leaf size={28}/></div>
        <p>Preparing your impact dashboard...</p>
      </div>
    );
  }

  if (error) return <div className="dashboard-page dash-error">{error}</div>;

  const stats = [
    {
      label: "Total emissions",
      value: fmt(data?.totalEmission),
      unit: "kg CO₂e",
      icon: <Layers size={19}/>,
      note: "Lifetime footprint"
    },
    {
      label: "Today's emissions",
      value: fmt(data?.todayEmission),
      unit: "kg CO₂e",
      icon: <Zap size={19}/>,
      note: "Current day"
    },
    {
      label: "This month",
      value: fmt(data?.monthEmission),
      unit: "kg CO₂e",
      icon: <TrendingUp size={19}/>,
      note: "Monthly footprint"
    },
    {
      label: "Activities logged",
      value: data?.activityCount || 0,
      unit: "total logs",
      icon: <Activity size={19}/>,
      note: "Your contributions"
    }
  ];

  return (
    <div className="dashboard-page">
      <div className="dash-topline">
        <div>
          <span className="dash-eyebrow">YOUR PERSONAL IMPACT SPACE</span>
          <h1>Overview<span className="dash-dot">.</span></h1>
          <p>Small actions. Measurable change.</p>
        </div>
        <div className="dash-date-pill">
          <CalendarDays size={15}/>
          {new Date().toLocaleDateString("en-US", {
            month: "long", day: "numeric", year: "numeric"
          })}
        </div>
      </div>

      {/* ANIMATED REACT POSTER */}
      <section className="dash-hero">
        <div className="hero-grid-pattern"/>
        <div className="hero-glow hero-glow-one"/>
        <div className="hero-glow hero-glow-two"/>

        <div className="hero-content">
          <div className="hero-tag">
            <span className="hero-pulse"/>
            YOUR CLIMATE JOURNEY
          </div>
          <h2>
            Every action<br/>
            <span>shapes tomorrow.</span>
          </h2>
          <p>
            Track your footprint, discover your patterns,
            and turn everyday decisions into meaningful impact.
          </p>
          <div className="hero-bottom">
            <div className="hero-live">
              <span className="hero-live-dot"/>
              IMPACT TRACKER ACTIVE
            </div>
            <span className="hero-index">01 / CARBONDOWN</span>
          </div>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one"/>
          <div className="orbit orbit-two"/>
          <div className="orbit orbit-three"/>
          <div className="orbit-path orbit-path-one">
            <span className="orbit-particle"/>
          </div>
          <div className="orbit-path orbit-path-two">
            <span className="orbit-particle particle-two"/>
          </div>
          <div className="hero-core">
            <div className="core-inner">
              <Leaf size={58} strokeWidth={1.15}/>
            </div>
          </div>
          <div className="hero-float float-one">
            <span>CO₂</span>
            <strong>{fmt(data?.totalEmission)}</strong>
            <small>KG TRACKED</small>
          </div>
          <div className="hero-float float-two">
            <Sparkles size={16}/>
            <span>MAKE AN IMPACT</span>
          </div>
          <span className="hero-coordinate coord-one">35° 41' N</span>
          <span className="hero-coordinate coord-two">EARTH / 001</span>
        </div>
      </section>

      {/* KPI CARDS */}
      <section className="dash-stats">
        {stats.map((stat, i) => (
          <article className="dash-stat-card" key={stat.label}>
            <div className="stat-card-top">
              <span>{stat.label}</span>
              <div className="stat-icon">{stat.icon}</div>
            </div>
            <div className="stat-card-value">
              <strong>{stat.value}</strong>
              <small>{stat.unit}</small>
            </div>
            <div className="stat-card-foot">
              <span className="stat-indicator"/>
              {stat.note}
            </div>
            <span className="stat-card-number">0{i + 1}</span>
          </article>
        ))}
      </section>

      {/* ANALYTICS HEADER + FILTER */}
      <div className="dash-section-heading">
        <div>
          <span className="dash-eyebrow">DATA & INSIGHTS</span>
          <h2>Your analytics</h2>
          <p>A closer look at your environmental footprint.</p>
        </div>
        <div className="dash-filter-group">
          {[
            ["day", "Day"],
            ["month", "Month"],
            ["all", "All time"]
          ].map(([value, label]) => (
            <button
              key={value}
              className={filter === value ? "active" : ""}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filter !== "all" && (
        <div className="dash-date-filter">
          <CalendarDays size={16}/>
          <span>Select {filter === "day" ? "date" : "month"}</span>
          <input
            type={filter === "day" ? "date" : "month"}
            value={filter === "day" ? selectedDate : selectedMonth}
            onChange={e => {
              if (filter === "day") setSelectedDate(e.target.value);
              else setSelectedMonth(e.target.value);
            }}
          />
          <span className="filter-count">
            {filtered.length} activities found
          </span>
        </div>
      )}

      {/* CHARTS */}
      <div className="dash-charts-grid">
        <section className="dash-panel dash-line-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">EMISSION ANALYSIS</span>
              <h3>Carbon footprint trend</h3>
              <p>Track how your emissions evolve over time.</p>
            </div>
            <div className="panel-icon"><TrendingUp size={19}/></div>
          </div>

          <div className="chart-total">
            <strong>{fmt(filteredEmission)}</strong>
            <span>kg CO₂e</span>
            <div className="chart-total-label">Selected period</div>
          </div>

          <div className="dash-line-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{
                top: 15, right: 12, left: -18, bottom: 0
              }}>
                <defs>
                  <linearGradient id="carbonArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2fbf89" stopOpacity={0.28}/>
                    <stop offset="95%" stopColor="#2fbf89" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="#e8efeb" strokeDasharray="4 5"
                  vertical={false}
                />
                <XAxis
                  dataKey="date" tickLine={false} axisLine={false}
                  tick={{ fill: "#91a09a", fontSize: 11 }}
                  minTickGap={22}
                />
                <YAxis
                  tickLine={false} axisLine={false}
                  tick={{ fill: "#91a09a", fontSize: 11 }}
                  width={45}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e5eee9",
                    boxShadow: "0 10px 30px #153c2814"
                  }}
                  formatter={v => [`${fmt(v)} kg CO₂e`, "Emissions"]}
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.fullDate || ""
                  }
                />
                <Area
                  type="monotone" dataKey="emission"
                  stroke="#159b70" strokeWidth={3}
                  fill="url(#carbonArea)"
                  dot={chartData.length === 1}
                  activeDot={{ r: 6, fill: "#159b70" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="dash-panel dash-pie-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">BREAKDOWN</span>
              <h3>Emission sources</h3>
              <p>Where your footprint comes from.</p>
            </div>
            <div className="panel-icon"><CircleDot size={19}/></div>
          </div>

          <div className="dash-donut-wrap">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={activeCategories}
                  dataKey="value"
                  nameKey="name"
                  cx="50%" cy="50%"
                  innerRadius={68}
                  outerRadius={91}
                  paddingAngle={3}
                  stroke="none"
                >
                  {activeCategories.map(a => (
                    <Cell
                      key={a.category}
                      fill={COLORS[a.category]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={v => `${fmt(v)} kg CO₂e`}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-center">
              <span>TOTAL</span>
              <strong>{fmt(filteredEmission)}</strong>
              <small>kg CO₂e</small>
            </div>
          </div>

          <div className="dash-category-list">
            {categoryData.map(a => (
              <div className="category-row" key={a.category}>
                <div className="category-name">
                  <span style={{ background: COLORS[a.category] }}/>
                  {a.name}
                </div>
                <div className="category-amount">
                  <strong>
                    {filteredEmission
                      ? ((a.value / filteredEmission) * 100).toFixed(1)
                      : "0.0"}%
                  </strong>
                  <small>{fmt(a.value)} kg</small>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* GITHUB STYLE HEATMAP */}
      <section className="dash-panel dash-heatmap-panel">
        <div className="panel-heading">
          <div>
            <span className="panel-kicker">YOUR CONSISTENCY</span>
            <h3>Activity calendar</h3>
            <p>Every green square represents a day you showed up.</p>
          </div>
          <div className="heatmap-year-nav">
            <button onClick={() => setHeatYear(y => y - 1)}>
              <ChevronLeft size={17}/>
            </button>
            <strong>{heatYear}</strong>
            <button
              disabled={heatYear >= new Date().getFullYear()}
              onClick={() => setHeatYear(y => y + 1)}
            >
              <ChevronRight size={17}/>
            </button>
          </div>
        </div>

        <div className="heatmap-summary">
          <strong>{heatTotal}</strong>
          <span>activities logged in {heatYear}</span>
          <div className="heatmap-summary-line"/>
          <Flame size={16}/>
          <strong>{streak}</strong>
          <span>day streak</span>
        </div>

        <div className="heatmap-scroll">
          <div className="heatmap-layout">
            <div className="heatmap-days">
              <span/>
              <span>Mon</span>
              <span/>
              <span>Wed</span>
              <span/>
              <span>Fri</span>
              <span/>
            </div>
            <div className="heatmap-content">
              <div className="heatmap-months">
                {heatmap.map((week, i) => {
                  const first = week.find(d => d.valid);
                  const previous = heatmap[i - 1]?.find(d => d.valid);
                  const show = first && (
                    i === 0 || !previous ||
                    first.month !== previous.month
                  );
                  return (
                    <span key={i}>
                      {show
                        ? new Date(heatYear, first.month, 1)
                          .toLocaleString("en", { month: "short" })
                        : ""}
                    </span>
                  );
                })}
              </div>
              <div className="heatmap-weeks">
                {heatmap.map((week, i) => (
                  <div className="heatmap-week" key={i}>
                    {week.map(day => {
                      const level = day.count === 0 ? 0
                        : day.count === 1 ? 1
                        : day.count <= 3 ? 2
                        : day.count <= 5 ? 3 : 4;
                      return (
                        <button
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
          <span>Click any square to view that day's analytics</span>
          <div className="heatmap-legend">
            Less
            {[0, 1, 2, 3, 4].map(level => (
              <span key={level} className={`heat-cell level-${level}`}/>
            ))}
            More
          </div>
        </div>
      </section>

      {/* ADDITIONAL INSIGHTS */}
      <div className="dash-insights-grid">
        <div className="dash-insight">
          <div className="insight-icon mint"><CalendarDays size={20}/></div>
          <span>Active days</span>
          <strong>{activeDays}</strong>
          <small>Days with at least one activity</small>
        </div>
        <div className="dash-insight">
          <div className="insight-icon amber"><Flame size={20}/></div>
          <span>Current streak</span>
          <strong>{streak} <em>days</em></strong>
          <small>Consecutive logging days</small>
        </div>
        <div className="dash-insight">
          <div className="insight-icon violet"><BarChart3 size={20}/></div>
          <span>Average per active day</span>
          <strong>{fmt(average)} <em>kg</em></strong>
          <small>Lifetime daily average</small>
        </div>
        <div className="dash-insight">
          <div className="insight-icon blue"><Leaf size={20}/></div>
          <span>Top emission source</span>
          <strong className="insight-category">
            {topCategory?.value ? topCategory.name : "—"}
          </strong>
          <small>Highest in selected period</small>
        </div>
      </div>

      {/* RECENT ACTIVITIES */}
      <section className="dash-panel dash-recent-panel">
        <div className="panel-heading">
          <div>
            <span className="panel-kicker">YOUR FOOTPRINT LOG</span>
            <h3>Recent activities</h3>
            <p>A record of your everyday impact.</p>
          </div>
          <div className="panel-icon"><Activity size={19}/></div>
        </div>

        <div className="dash-activity-list">
          {filtered.length ? filtered.slice(0, 6).map((item, i) => {
            const category = String(item.category || "").toLowerCase();
            return (
              <div className="dash-activity-row" key={item.id ?? i}>
                <div
                  className="activity-category-icon"
                  style={{
                    background: `${COLORS[category] || "#4dd4a0"}20`,
                    color: COLORS[category] || "#159b70"
                  }}
                >
                  <Leaf size={18}/>
                </div>
                <div className="activity-info">
                  <strong>{title(item.activityType)}</strong>
                  <span>
                    {title(item.category)} · {item.logDate}
                  </span>
                </div>
                <div className="activity-emission">
                  <strong>{fmt(item.emission)}</strong>
                  <span>kg CO₂e</span>
                </div>
              </div>
            );
          }) : (
            <div className="dash-empty">
              <Leaf size={28}/>
              <strong>No activities found</strong>
              <p>Try another date or log your first activity.</p>
            </div>
          )}
        </div>
      </section>

      <footer className="dash-footer">
        <span>CARBONDOWN <span className="dash-dot">✳</span> YOUR IMPACT MATTERS</span>
        <span>Measured in kg CO₂ equivalent</span>
      </footer>
    </div>
  );
}

export default Dashboard;
