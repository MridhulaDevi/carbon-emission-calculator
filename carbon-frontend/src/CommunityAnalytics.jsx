import { useEffect, useState } from "react";
import {
  Trophy,
  Users,
  Medal,
  Leaf,
  Activity,
  BarChart3,
  ArrowDownRight,
  ArrowUpRight,
  Crown,
  Globe,
  ShieldCheck,
  RefreshCw,
  CalendarDays
} from "lucide-react";

const API = "http://localhost:8080/api";

const fmt = value => Number(value || 0).toFixed(2);

const categories = [
  "transport",
  "electricity",
  "food",
  "shopping"
];

const colors = {
  transport: "#60a5fa",
  electricity: "#f5bb65",
  food: "#a78bfa",
  shopping: "#4dd4a0"
};

const title = value =>
  String(value || "")
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\b\w/g, c => c.toUpperCase());

const initials = name =>
  String(name || "User")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word[0] || "")
    .join("")
    .toUpperCase();

const displayName = user =>
  user?.name || user?.userName || "Community Member";

const validNumber = value =>
  value !== null &&
  value !== undefined &&
  Number.isFinite(Number(value));

export default function CommunityAnalytics({
  token,
  refreshKey,
  filter = "month",
  category = "all",
  selectedDate,
  selectedMonth,
  view = "benchmark"
}) {

  const [data, setData] = useState(null);
  const [mode, setMode] = useState("emission");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [search, setSearch] = useState("");

  const showLeaderboard = view === "leaderboard";
  const showBenchmark = view === "benchmark";

  useEffect(() => {

    if (!token) {
      setData(null);
      setError("Please sign in to view community analytics.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadCommunity() {

      setLoading(true);
      setError("");
      setData(null);

      try {

        const params = new URLSearchParams({
          filter: filter || "month",
          category: category || "all"
        });

        if (selectedDate) {
          params.set("date", selectedDate);
        }

        if (selectedMonth) {
          params.set("month", selectedMonth);
        }

        const response = await fetch(
          `${API}/analytics/community?${params.toString()}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`
            },
            signal: controller.signal
          }
        );

        if (!response.ok) {

          const result = await response.json()
            .catch(() => null);

          throw new Error(
            result?.message ||
            `Unable to load community analytics (${response.status}).`
          );
        }

        const result = await response.json();

        if (!result || typeof result !== "object") {
          throw new Error("Invalid community analytics response.");
        }

        if (!controller.signal.aborted) {
          setData(result);
        }

      } catch (err) {

        if (
          err.name !== "AbortError" &&
          !controller.signal.aborted
        ) {
          setError(err.message);
        }

      } finally {

        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadCommunity();

    return () => controller.abort();

  }, [
    token,
    refreshKey,
    filter,
    category,
    selectedDate,
    selectedMonth,
    reload
  ]);

  // ==========================================
  // LOWEST EMISSION RANKING
  // ==========================================

  const emissionLeaderboard =
    Array.isArray(data?.leaderboard)
      ? [...data.leaderboard]
          .sort((a, b) =>
            Number(a.totalEmission || 0) -
            Number(b.totalEmission || 0)
          )
          .map((user, index) => ({
            ...user,
            rank: index + 1
          }))
      : [];

  // ==========================================
  // MOST ACTIVE USERS RANKING
  // ==========================================

  const activityLeaderboard = [
    ...(Array.isArray(data?.activityLeaderboard)
      ? data.activityLeaderboard
      : emissionLeaderboard)
  ]
    .sort((a, b) => {

      const countDifference =
        Number(b.activityCount || 0) -
        Number(a.activityCount || 0);

      if (countDifference !== 0) {
        return countDifference;
      }

      return (
        Number(a.totalEmission || 0) -
        Number(b.totalEmission || 0)
      );
    })
    .map((user, index) => ({
      ...user,
      rank: index + 1
    }));

  const rankedUsers =
    showLeaderboard && mode === "activity"
      ? activityLeaderboard
      : emissionLeaderboard;

  const getRank = user => user.rank;

  const currentUser = rankedUsers.find(
    user => user.isCurrentUser
  );

  const myRank = currentUser
    ? getRank(currentUser)
    : null;

  const visibleUsers = rankedUsers.filter(user =>
    displayName(user)
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  // ==========================================
  // PEER BENCHMARKING
  // ==========================================

  const benchmark = data?.benchmark;

  const peerCount = Number(
    benchmark?.peerCount || 0
  );

  const peerAverage =
    validNumber(benchmark?.peerAverage)
      ? Number(benchmark.peerAverage)
      : null;

  const myEmission = Number(
    benchmark?.myEmission || 0
  );

  const benchmarkAvailable =
    benchmark?.available ??
    benchmark?.benchmarkAvailable ??
    (peerAverage !== null);

  const canCompare =
    Boolean(benchmarkAvailable) &&
    peerAverage !== null;

  const difference =
    validNumber(benchmark?.percentageDifference)
      ? Number(benchmark.percentageDifference)
      : peerAverage !== null && peerAverage > 0
      ? (
          (myEmission - peerAverage) /
          peerAverage
        ) * 100
      : null;

  const comparisonStatus =
    benchmark?.comparisonStatus ||
    (
      peerAverage === null
        ? "unavailable"
        : myEmission < peerAverage
        ? "lower"
        : myEmission > peerAverage
        ? "higher"
        : "equal"
    );

  const comparisonMax = Math.max(
    myEmission,
    peerAverage || 0,
    1
  );

  const percentile =
    validNumber(benchmark?.percentile)
      ? Number(benchmark.percentile)
      : null;

  const posts = Array.isArray(data?.posts)
    ? data.posts
    : [];

  return (

    <section className="ca-community">

      <div className="ca-section-header">

        <div>

          <span className="ca-eyebrow">
            {showLeaderboard
              ? "CLIMATE CHAMPIONS"
              : "BETTER TOGETHER"}
          </span>

          <h2>
            {showLeaderboard
              ? "Community Rankings"
              : "Community & Peer Insights"}
          </h2>

          <p>
            {showLeaderboard
              ? "Celebrate the sustainability champions of CarbonDown."
              : "Discover your position in the CarbonDown community and compare your environmental impact."}
          </p>

        </div>

        <button
          type="button"
          className="ca-refresh"
          disabled={loading}
          onClick={() =>
            setReload(value => value + 1)
          }
        >
          <RefreshCw
            size={15}
            className={loading ? "ca-spinning" : ""}
          />
          Refresh
        </button>

      </div>

      {loading ? (

        <div className="ca-state">
          <RefreshCw
            size={25}
            className="ca-spinning"
          />
          <p>Preparing community insights...</p>
        </div>

      ) : error ? (

        <div className="ca-state">

          <Globe size={28} />

          <strong>
            Community insights unavailable
          </strong>

          <p>{error}</p>

          <button
            type="button"
            className="ca-refresh"
            onClick={() =>
              setReload(value => value + 1)
            }
          >
            Try again
          </button>

        </div>

      ) : (

        <>

          {/* COMMUNITY SUMMARY */}

          <div className="ca-summary-grid">

            <article className="ca-summary-card">

              <div className="ca-icon ca-green">
                <Users size={21} />
              </div>

              <span>Active community</span>

              <strong>
                {data?.activeUsers ?? 0}
              </strong>

              <small>
                Users in selected period
              </small>

            </article>

            <article className="ca-summary-card">

              <div className="ca-icon ca-gold">
                <Trophy size={21} />
              </div>

              <span>Your position</span>

              <strong>
                {myRank ? `#${myRank}` : "—"}
              </strong>

              <small>
                {showLeaderboard && mode === "activity"
                  ? "Activity logging rank"
                  : "Lowest recorded emissions"}
              </small>

            </article>

            <article className="ca-summary-card">

              <div className="ca-icon ca-purple">
                <BarChart3 size={21} />
              </div>

              <span>Your relative standing</span>

              <strong>
                {percentile !== null
                  ? `${fmt(percentile)}%`
                  : "—"}
              </strong>

              <small>
                Peers with higher recorded emissions
              </small>

            </article>

            <article className="ca-summary-card">

              <div className="ca-icon ca-blue">
                <Leaf size={21} />
              </div>

              <span>Peer average</span>

              <strong>
                {peerAverage !== null
                  ? fmt(peerAverage)
                  : "—"}

                {peerAverage !== null && (
                  <em> kg</em>
                )}
              </strong>

              <small>
                Average of {peerCount} eligible{" "}
                {peerCount === 1 ? "peer" : "peers"}
              </small>

            </article>

          </div>

          {/* =====================================
              LEADERBOARD PAGE ONLY
          ====================================== */}

          {showLeaderboard && (

            <section className="ca-panel">

              <div className="ca-panel-header">

                <div>

                  <span className="ca-eyebrow">
                    COMMUNITY RANKINGS
                  </span>

                  <h3>
                    <Trophy size={22} />
                    Green Leaderboard
                  </h3>

                  <p>
                    Celebrate consistent tracking and
                    lower recorded carbon footprints.
                  </p>

                </div>

                <div className="ca-tabs">

                  <button
                    type="button"
                    className={
                      mode === "emission" ? "active" : ""
                    }
                    onClick={() => {
                      setMode("emission");
                      setSearch("");
                    }}
                  >
                    <Leaf size={15} />
                    Lowest emissions
                  </button>

                  <button
                    type="button"
                    className={
                      mode === "activity" ? "active" : ""
                    }
                    onClick={() => {
                      setMode("activity");
                      setSearch("");
                    }}
                  >
                    <Activity size={15} />
                    Most active
                  </button>

                </div>

              </div>

              {rankedUsers.length > 0 ? (

                <>

                  {/* TOP THREE USERS */}

                  <div className="ca-podium">

                    {[1, 0, 2].map(index => {

                      const user = rankedUsers[index];

                      if (!user) return null;

                      const rank = getRank(user);

                      return (

                        <div
                          key={user.userId}
                          className={
                            `ca-podium-card ca-place-${index + 1}`
                          }
                        >

                          {index === 0 && (
                            <Crown
                              size={27}
                              className="ca-crown"
                            />
                          )}

                          <div className="ca-podium-avatar">
                            {initials(displayName(user))}
                          </div>

                          <span className="ca-podium-rank">
                            #{rank}
                          </span>

                          <strong>
                            {displayName(user)}
                          </strong>

                          {user.isCurrentUser && (
                            <span className="ca-you">
                              YOU
                            </span>
                          )}

                          <b>
                            {mode === "emission"
                              ? fmt(user.totalEmission)
                              : user.activityCount ?? 0}
                          </b>

                          <small>
                            {mode === "emission"
                              ? "kg CO₂e"
                              : "activities logged"}
                          </small>

                        </div>
                      );
                    })}

                  </div>

                  {/* SEARCH COMMUNITY MEMBERS */}

                  <div className="lb-search-bar">

                    <input
                      type="search"
                      placeholder="Search community members..."
                      aria-label="Search community members"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />

                    <span>
                      {visibleUsers.length} of{" "}
                      {rankedUsers.length} members
                    </span>

                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                      >
                        Clear
                      </button>
                    )}

                  </div>

                  {/* COMPLETE RANKING TABLE */}

                  <div className="ca-table-scroll">

                    <table className="ca-table">

                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Community member</th>
                          <th>Activities</th>
                          <th>Emissions</th>
                        </tr>
                      </thead>

                      <tbody>

                        {visibleUsers.map(user => {

                          const rank = getRank(user);

                          return (

                            <tr
                              key={user.userId}
                              className={
                                user.isCurrentUser
                                  ? "ca-current-user"
                                  : ""
                              }
                            >

                              <td>

                                <span
                                  className={
                                    `ca-rank ca-rank-${rank}`
                                  }
                                >

                                  {rank <= 3 && (
                                    <Medal size={16} />
                                  )}

                                  #{rank}

                                </span>

                              </td>

                              <td>

                                <div className="ca-member">

                                  <div className="ca-avatar">
                                    {initials(displayName(user))}
                                  </div>

                                  <strong>
                                    {displayName(user)}
                                  </strong>

                                  {user.isCurrentUser && (
                                    <span className="ca-you">
                                      YOU
                                    </span>
                                  )}

                                </div>

                              </td>

                              <td>
                                {user.activityCount ?? 0}
                              </td>

                              <td>
                                <strong>
                                  {fmt(user.totalEmission)}
                                </strong>

                                <small> kg CO₂e</small>
                              </td>

                            </tr>
                          );
                        })}

                        {visibleUsers.length === 0 && (
                          <tr>
                            <td colSpan={4}>
                              <div className="ca-state">
                                No matching members found.
                              </div>
                            </td>
                          </tr>
                        )}

                      </tbody>

                    </table>

                  </div>

                </>

              ) : (

                <div className="ca-state">

                  <Trophy size={27} />

                  <strong>No eligible users</strong>

                  <p>
                    No activities match the selected
                    period and category. Try selecting
                    All Time and All Categories.
                  </p>

                </div>

              )}

              <div className="ca-note">

                <ShieldCheck size={16} />

                Rankings reflect recorded activities only.
                Lower recorded emissions do not necessarily
                mean a lower complete carbon footprint.

              </div>

            </section>

          )}

          {/* =====================================
              PEER BENCHMARKING - ANALYTICS ONLY
          ====================================== */}

          {showBenchmark && (

            <section className="ca-panel">

              <div className="ca-panel-header">

                <div>

                  <span className="ca-eyebrow">
                    COMMUNITY COMPARISON
                  </span>

                  <h3>
                    <BarChart3 size={22} />
                    Peer Benchmarking
                  </h3>

                  <p>
                    Compare your footprint with the
                    CarbonDown user community.
                  </p>

                </div>

                <span className="ca-privacy">

                  <Users size={15} />

                  {peerCount} eligible{" "}
                  {peerCount === 1 ? "peer" : "peers"}

                </span>

              </div>

              {canCompare ? (

                <>

                  <div className="ca-benchmark-hero">

                    <div>

                      <span>
                        YOUR RECORDED FOOTPRINT
                      </span>

                      <h4>
                        {fmt(myEmission)}
                        <small> kg CO₂e</small>
                      </h4>

                      {difference !== null ? (

                        <div
                          className={
                            `ca-performance ${
                              difference <= 0
                                ? "ca-positive"
                                : "ca-negative"
                            }`
                          }
                        >

                          {difference <= 0 ? (
                            <ArrowDownRight size={19} />
                          ) : (
                            <ArrowUpRight size={19} />
                          )}

                          {difference === 0
                            ? "Equal to peer average"
                            : `${Math.abs(difference).toFixed(1)}% ${
                                difference < 0
                                  ? "below"
                                  : "above"
                              } peer average`}

                        </div>

                      ) : comparisonStatus === "equal" ? (

                        <div className="ca-performance ca-positive">
                          <Leaf size={19} />
                          Equal to peer average
                        </div>

                      ) : (

                        <div className="ca-performance ca-negative">
                          <ArrowUpRight size={19} />

                          {fmt(myEmission - peerAverage)} kg
                          above peer average
                        </div>

                      )}

                    </div>

                    <div className="ca-percentile">

                      <strong>
                        {percentile !== null
                          ? `${fmt(percentile)}%`
                          : "—"}
                      </strong>

                      <span>Relative standing</span>

                      <small>
                        Percentage of eligible peers
                        with higher emissions
                      </small>

                    </div>

                  </div>

                  {/* EMISSION COMPARISON BARS */}

                  <div className="ca-comparison">

                    <div className="ca-bar-label">

                      <span>Your emissions</span>

                      <strong>
                        {fmt(myEmission)} kg
                      </strong>

                    </div>

                    <div className="ca-bar-track">

                      <div
                        className="ca-bar-you"
                        style={{
                          width:
                            `${myEmission / comparisonMax * 100}%`
                        }}
                      />

                    </div>

                    <div className="ca-bar-label">

                      <span>Community average</span>

                      <strong>
                        {fmt(peerAverage)} kg
                      </strong>

                    </div>

                    <div className="ca-bar-track">

                      <div
                        className="ca-bar-peer"
                        style={{
                          width:
                            `${peerAverage / comparisonMax * 100}%`
                        }}
                      />

                    </div>

                  </div>

                  <div className="ca-benchmark-legend">

                    <span>
                      <i className="ca-dot-you" />
                      Your emissions
                    </span>

                    <span>
                      <i className="ca-dot-peer" />
                      Peer average
                    </span>

                  </div>

                  {/* CATEGORY-WISE BENCHMARKING */}

                  <h4 className="ca-category-heading">
                    Category-wise comparison
                  </h4>

                  <div className="ca-category-grid">

                    {categories
                      .filter(item =>
                        category === "all" ||
                        category === item
                      )
                      .map(item => {

                        const info =
                          benchmark?.categories?.[item];

                        const mine = Number(
                          info?.myEmission || 0
                        );

                        const peer =
                          validNumber(info?.peerAverage)
                            ? Number(info.peerAverage)
                            : null;

                        const max = Math.max(
                          mine,
                          peer || 0,
                          1
                        );

                        return (

                          <article
                            key={item}
                            className="ca-category-card"
                          >

                            <div className="ca-category-name">

                              <span
                                style={{
                                  background: colors[item]
                                }}
                              />

                              <strong>
                                {title(item)}
                              </strong>

                            </div>

                            <div className="ca-bar-label">

                              <span>You</span>

                              <strong>
                                {fmt(mine)} kg
                              </strong>

                            </div>

                            <div className="ca-bar-track">

                              <div
                                className="ca-bar-you"
                                style={{
                                  width:
                                    `${mine / max * 100}%`
                                }}
                              />

                            </div>

                            <div className="ca-bar-label">

                              <span>Peer average</span>

                              <strong>
                                {peer !== null
                                  ? `${fmt(peer)} kg`
                                  : "Unavailable"}
                              </strong>

                            </div>

                            <div className="ca-bar-track">

                              <div
                                className="ca-bar-peer"
                                style={{
                                  width:
                                    `${(peer || 0) / max * 100}%`
                                }}
                              />

                            </div>

                            <small
                              className={
                                peer === null
                                  ? "ca-neutral-text"
                                  : mine <= peer
                                  ? "ca-positive-text"
                                  : "ca-negative-text"
                              }
                            >

                              {peer === null
                                ? "Insufficient peer data"
                                : mine === peer
                                ? "Equal to peer average"
                                : mine < peer
                                ? `${fmt(peer - mine)} kg below average`
                                : `${fmt(mine - peer)} kg above average`}

                            </small>

                          </article>
                        );
                      })}

                  </div>

                </>

              ) : (

                <div className="ca-state">

                  <BarChart3 size={28} />

                  <strong>
                    Not enough comparison data
                  </strong>

                  <p>

                    {!currentUser
                      ? "Log an activity within the selected period and category to compare your emissions."
                      : peerCount === 0
                      ? "No other users have recorded matching activities. Try All Time and All Categories."
                      : "Peer comparison data is currently unavailable."}

                  </p>

                  <small>
                    Eligible peers: {peerCount}
                  </small>

                </div>

              )}

              <div className="ca-note">

                <ShieldCheck size={16} />

                Peer averages exclude your own data.
                Comparisons use the same selected period
                and category. Only recorded activities
                are considered.

              </div>

            </section>

          )}

          {/* =====================================
              COMMUNITY ACTIVITY FEED - ANALYTICS
          ====================================== */}

          {showBenchmark && (

            <section className="ca-panel">

              <div className="ca-panel-header">

                <div>

                  <span className="ca-eyebrow">
                    COMMUNITY IN ACTION
                  </span>

                  <h3>
                    <Activity size={22} />
                    Community Activity Feed
                  </h3>

                  <p>
                    Discover recent activities recorded by
                    other CarbonDown community members.
                  </p>

                </div>

                <span className="ca-privacy">

                  <Activity size={15} />

                  {posts.length}{" "}
                  {posts.length === 1
                    ? "activity"
                    : "activities"}

                </span>

              </div>

              <div className="ca-feed">

                {posts.length > 0 ? (

                  posts.map((post, index) => {

                    const postCategory = String(
                      post.category || ""
                    ).toLowerCase();

                    const color =
                      colors[postCategory] || "#4dd4a0";

                    const userName = displayName(post);

                    const activityName =
                      post.activityName ||
                      title(post.activityType) ||
                      "Activity";

                    const quantity =
                      post.quantity !== null &&
                      post.quantity !== undefined
                        ? `${post.quantity} ${post.unit || ""}`.trim()
                        : "";

                    const emission =
                      post.emission ??
                      post.totalEmission ??
                      0;

                    const activityDate =
                      post.logDate ||
                      post.date ||
                      "";

                    return (

                      <article
                        key={
                          post.id ??
                          post.activityId ??
                          `${post.userId}-${index}`
                        }
                        className="ca-post"
                      >

                        <div className="ca-post-header">

                          <div className="ca-avatar">
                            {initials(userName)}
                          </div>

                          <div className="ca-post-user">

                            <strong>{userName}</strong>

                            <span>
                              <CalendarDays size={12} />
                              {activityDate}
                            </span>

                          </div>

                          <span
                            className="ca-post-category"
                            style={{
                              color,
                              background: `${color}18`
                            }}
                          >
                            {title(postCategory)}
                          </span>

                        </div>

                        <div className="ca-post-content">

                          <div
                            className="ca-post-icon"
                            style={{
                              background: `${color}20`,
                              color
                            }}
                          >
                            <Leaf size={23} />
                          </div>

                          <div>

                            <span>
                              Logged an activity
                            </span>

                            <h4>{activityName}</h4>

                            {quantity && (
                              <p>Quantity: {quantity}</p>
                            )}

                            <p>
                              {post.description ||
                                post.message ||
                                "Contributing to a more carbon-aware community."}
                            </p>

                          </div>

                        </div>

                        <div className="ca-post-footer">

                          <span>
                            Recorded carbon impact
                          </span>

                          <strong>
                            {fmt(emission)} kg CO₂e
                          </strong>

                        </div>

                      </article>
                    );
                  })

                ) : (

                  <div className="ca-state">

                    <Activity size={27} />

                    <strong>
                      No community activities found
                    </strong>

                    <p>
                      Other users' recorded activities
                      matching your selected period
                      and category will appear here.
                    </p>

                    <small>
                      Try selecting All Time and
                      All Categories.
                    </small>

                  </div>

                )}

              </div>

            </section>

          )}

        </>

      )}

    </section>
  );
}