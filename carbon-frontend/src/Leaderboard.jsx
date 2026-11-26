import { useEffect, useState } from "react";

import {
  Trophy,
  Crown,
  Leaf,
  Sparkles,
  CalendarDays,
  RefreshCw,
  Globe2,
  Target,
  Medal,
  PartyPopper
} from "lucide-react";

import CommunityAnalytics from "./CommunityAnalytics";

import "./Dashboard.css";
import "./Analytics.css";
import "./Leaderboard.css";

const CATEGORIES = [
  ["all", "All categories"],
  ["transport", "Transport"],
  ["electricity", "Electricity"],
  ["food", "Food"],
  ["shopping", "Shopping"]
];

const CONFETTI_COLORS = [
  "#159b70",
  "#4dd4a0",
  "#f5bb65",
  "#60a5fa",
  "#a78bfa",
  "#f3d77b",
  "#ffffff"
];

function dateKey(date) {

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

}

function Celebration({ celebrationKey }) {

  return (

    <div
      className="lb-confetti-container"
      key={celebrationKey}
      aria-hidden="true"
    >

      {Array.from({ length: 65 }, (_, index) => (

        <span
          key={index}
          className={`lb-confetti lb-confetti-${index % 3}`}
          style={{
            "--left": `${(index * 37.7) % 100}%`,
            "--delay": `${(index % 12) * 0.12}s`,
            "--duration": `${3 + (index % 5) * 0.4}s`,
            "--rotation": `${index * 67}deg`,
            "--drift": `${(index % 2 ? 1 : -1) * (30 + index % 90)}px`,
            "--piece-color":
              CONFETTI_COLORS[index % CONFETTI_COLORS.length]
          }}
        />

      ))}

    </div>
  );
}

export default function Leaderboard({
  token,
  refreshKey
}) {

  const today = dateKey(new Date());

  const [filter, setFilter] = useState("month");

  const [category, setCategory] = useState("all");

  const [selectedDate, setSelectedDate] = useState(today);

  const [selectedMonth, setSelectedMonth] = useState(
    today.slice(0, 7)
  );

  const [localRefresh, setLocalRefresh] = useState(0);

  const [celebrationKey, setCelebrationKey] = useState(0);

  const [celebrate, setCelebrate] = useState(true);

  useEffect(() => {

    if (!celebrate) return;

    const timer = setTimeout(() => {
      setCelebrate(false);
    }, 6500);

    return () => clearTimeout(timer);

  }, [celebrationKey, celebrate]);

  function replayCelebration() {

    setCelebrationKey(previous => previous + 1);
    setCelebrate(true);

  }

  function resetFilters() {

    setFilter("month");
    setCategory("all");
    setSelectedDate(today);
    setSelectedMonth(today.slice(0, 7));

  }

  function refreshRankings() {

    setLocalRefresh(previous => previous + 1);

  }

  const periodLabel =
    filter === "all"
      ? "All time"
      : filter === "day"
      ? selectedDate
      : new Date(
          `${selectedMonth}-01T00:00:00`
        ).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric"
        });

  return (

    <div className="dashboard-page lb-page">

      {celebrate && (
        <Celebration celebrationKey={celebrationKey} />
      )}

      {/* PAGE HEADER */}

      <div className="lb-page-header">

        <div>

          <span className="lb-eyebrow">
            <Globe2 size={14} />
            THE CARBONDOWN COMMUNITY
          </span>

          <h1>
            Leaderboard<span>.</span>
          </h1>

          <p>
            Small individual actions.
            Extraordinary collective impact.
          </p>

        </div>

        <button
          type="button"
          className="lb-celebrate-button"
          onClick={replayCelebration}
        >
          <PartyPopper size={18} />
          Celebrate
        </button>

      </div>

      {/* HERO BANNER */}

      <section className="lb-hero">

        <div className="lb-hero-orbit lb-orbit-one" />

        <div className="lb-hero-orbit lb-orbit-two" />

        <div className="lb-hero-orbit lb-orbit-three" />

        <div className="lb-hero-content">

          <div className="lb-hero-label">
            <Sparkles size={15} />
            EVERY ACTION COUNTS
          </div>

          <h2>
            A greener world.
            <br />
            <span>One champion at a time.</span>
          </h2>

          <p>
            Discover our community's sustainability champions,
            compare your recorded environmental impact and
            turn everyday choices into meaningful progress.
          </p>

          <div className="lb-hero-tags">

            <span>
              <Leaf size={15} />
              Lower emissions
            </span>

            <span>
              <Medal size={15} />
              Community rankings
            </span>

            <span>
              <Target size={15} />
              Personal progress
            </span>

          </div>

        </div>

        <div className="lb-trophy-stage">

          <div className="lb-trophy-halo" />

          <Sparkles
            size={24}
            className="lb-sparkle lb-sparkle-one"
          />

          <Sparkles
            size={17}
            className="lb-sparkle lb-sparkle-two"
          />

          <Sparkles
            size={20}
            className="lb-sparkle lb-sparkle-three"
          />

          <Crown
            size={32}
            className="lb-floating-crown"
          />

          <div className="lb-trophy-circle">

            <Trophy
              size={88}
              strokeWidth={1.4}
            />

          </div>

          <div className="lb-trophy-platform" />

          <span className="lb-trophy-caption">
            CLIMATE CHAMPIONS
          </span>

        </div>

      </section>

      {/* INFORMATION CARDS */}

      <div className="lb-information-grid">

        <div className="lb-information-card">

          <div className="lb-information-icon lb-green">
            <Trophy size={23} />
          </div>

          <div>

            <span>Ranking principle</span>

            <strong>Lowest emissions first</strong>

            <small>
              Lower recorded footprint, higher rank
            </small>

          </div>

        </div>

        <div className="lb-information-card">

          <div className="lb-information-icon lb-purple">
            <Target size={23} />
          </div>

          <div>

            <span>Activity insights</span>

            <strong>Category-wise rankings</strong>

            <small>
              Explore individual emission sources
            </small>

          </div>

        </div>

        <div className="lb-information-card">

          <div className="lb-information-icon lb-gold">
            <CalendarDays size={23} />
          </div>

          <div>

            <span>Ranking period</span>

            <strong>{periodLabel}</strong>

            <small>Based on your selected filters</small>

          </div>

        </div>

      </div>

      {/* FILTER SECTION */}

      <section className="lb-filter-panel">

        <div className="lb-filter-heading">

          <div>

            <span className="lb-eyebrow">
              EXPLORE THE RANKINGS
            </span>

            <h2>Community performance</h2>

            <p>
              Compare sustainability performance across
              different periods and activity categories.
            </p>

          </div>

          <button
            type="button"
            className="lb-refresh-button"
            onClick={refreshRankings}
          >

            <RefreshCw
              size={16}
              key={localRefresh}
              className={localRefresh ? "lb-refresh-spin" : ""}
            />

            Refresh

          </button>

        </div>

        <div className="lb-filter-controls">

          <div className="lb-period-switch">

            {[
              ["day", "Day"],
              ["month", "Month"],
              ["all", "All time"]
            ].map(([value, label]) => (

              <button
                key={value}
                type="button"
                className={filter === value ? "active" : ""}
                onClick={() => setFilter(value)}
                aria-pressed={filter === value}
              >
                {label}
              </button>

            ))}

          </div>

          {filter !== "all" && (

            <div className="lb-input-wrap">

              <CalendarDays size={16} />

              <input
                aria-label={
                  filter === "day"
                    ? "Ranking date"
                    : "Ranking month"
                }
                type={filter === "day" ? "date" : "month"}
                max={
                  filter === "day"
                    ? today
                    : today.slice(0, 7)
                }
                value={
                  filter === "day"
                    ? selectedDate
                    : selectedMonth
                }
                onChange={event => {

                  if (!event.target.value) return;

                  if (filter === "day") {
                    setSelectedDate(event.target.value);
                  } else {
                    setSelectedMonth(event.target.value);
                  }

                }}
              />

            </div>

          )}

          <div className="lb-input-wrap">

            <Leaf size={16} />

            <select
              aria-label="Activity category"
              value={category}
              onChange={event =>
                setCategory(event.target.value)
              }
            >

              {CATEGORIES.map(([value, label]) => (

                <option value={value} key={value}>
                  {label}
                </option>

              ))}

            </select>

          </div>

          <button
            type="button"
            className="lb-reset-button"
            onClick={resetFilters}
          >
            Reset filters
          </button>

        </div>

      </section>

      {/* LEADERBOARD ONLY */}

      <div className="lb-community-content">

        <CommunityAnalytics
          token={token}
          refreshKey={`${refreshKey ?? 0}-${localRefresh}`}
          filter={filter}
          category={category}
          selectedDate={selectedDate}
          selectedMonth={selectedMonth}
          view="leaderboard"
        />

      </div>

      {/* MOTIVATIONAL BANNER */}

      <section className="lb-motivation">

        <div className="lb-motivation-icon">
          <Leaf size={28} />
        </div>

        <div>

          <h3>
            Progress matters more than perfection.
          </h3>

          <p>
            Keep tracking your activities, make mindful
            choices and inspire others to live greener.
          </p>

        </div>

        <Sparkles
          size={28}
          className="lb-motivation-sparkle"
        />

      </section>

      <footer className="dash-footer">

        <span>
          CARBONDOWN ✳ TOGETHER FOR A GREENER FUTURE
        </span>

        <span>
          Measured in kg CO₂ equivalent
        </span>

      </footer>

    </div>
  );
}