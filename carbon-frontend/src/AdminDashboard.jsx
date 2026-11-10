import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";

const API_URL = "http://localhost:8080";

function AdminDashboard({ setPage }) {
    const [users, setUsers] = useState([]);
    const [activities, setActivities] = useState([]);
    const [factors, setFactors] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ================================
    // FETCH ADMIN DATA
    // ================================

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const headers = {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            };

            const [usersResponse, activitiesResponse, factorsResponse] =
                await Promise.all([
                    fetch(`${API_URL}/api/admin/users`, {
                        headers
                    }),

                    fetch(`${API_URL}/api/admin/activities`, {
                        headers
                    }),

                    fetch(`${API_URL}/api/admin/emission-factors`, {
                        headers
                    })
                ]);

            if (!usersResponse.ok) {
                throw new Error("Failed to load users");
            }

            if (!activitiesResponse.ok) {
                throw new Error("Failed to load activities");
            }

            if (!factorsResponse.ok) {
                throw new Error("Failed to load emission factors");
            }

            const usersData = await usersResponse.json();
            const activitiesData = await activitiesResponse.json();
            const factorsData = await factorsResponse.json();

            setUsers(usersData);
            setActivities(activitiesData);
            setFactors(factorsData);

        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to load admin data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);


    // ================================
    // LOGOUT
    // ================================

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setPage("login");
    };


    // ================================
    // CALCULATIONS
    // ================================

    const totalEmissions = activities.reduce(
        (total, activity) =>
            total + Number(activity.emission || 0),
        0
    );


    // ================================
    // RECENT USERS
    // ================================

    const recentUsers = [...users]
        .slice(-5)
        .reverse();


    // ================================
    // RECENT ACTIVITIES
    // ================================

    const recentActivities = [...activities]
        .slice(-5)
        .reverse();


    // ================================
    // LOADING
    // ================================

    if (loading) {
        return (
            <div className="admin-dashboard">
                <div className="admin-loading">
                    <div className="admin-loader"></div>
                    <p>Loading admin dashboard...</p>
                </div>
            </div>
        );
    }


    // ================================
    // DASHBOARD
    // ================================

    return (
        <div className="admin-dashboard">

            {/* ================= HEADER ================= */}

            <header className="admin-header">

                <div className="admin-header-left">

                    <div className="admin-logo">
                        🌱
                    </div>

                    <div>
                        <h1>Admin Dashboard</h1>
                        <p>CarbonDown Management Panel</p>
                    </div>

                </div>


                <div className="admin-header-actions">

                    <button
                        className="admin-refresh-btn"
                        onClick={fetchData}
                    >
                        ↻ Refresh
                    </button>

                    <button
                        className="admin-logout-btn"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </header>


            {/* ================= ERROR ================= */}

            {error && (
                <div className="admin-error">
                    ⚠️ {error}
                </div>
            )}


            {/* ================= STATISTICS ================= */}

            <section className="admin-stats">

                <div className="admin-stat-card">

                    <div className="stat-icon">
                        👥
                    </div>

                    <div>
                        <p>Total Users</p>
                        <h2>{users.length}</h2>
                    </div>

                </div>


                <div className="admin-stat-card">

                    <div className="stat-icon">
                        📋
                    </div>

                    <div>
                        <p>Total Activities</p>
                        <h2>{activities.length}</h2>
                    </div>

                </div>


                <div className="admin-stat-card">

                    <div className="stat-icon">
                        🌍
                    </div>

                    <div>
                        <p>Total Emissions</p>
                        <h2>
                            {totalEmissions.toFixed(2)}
                        </h2>
                        <span>kg CO₂e</span>
                    </div>

                </div>


                <div className="admin-stat-card">

                    <div className="stat-icon">
                        ⚙️
                    </div>

                    <div>
                        <p>Emission Factors</p>
                        <h2>{factors.length}</h2>
                    </div>

                </div>

            </section>


            {/* ================= MANAGEMENT ================= */}

            <section className="management-section">

                <div className="section-title">
                    <h2>Management</h2>
                    <p>Manage users, activities and emission factors</p>
                </div>


                <div className="management-grid">

                    {/* USERS */}

                    <div className="management-card">

                        <div className="management-icon">
                            👥
                        </div>

                        <h3>User Management</h3>

                        <p>
                            View, add, edit and delete registered users.
                        </p>

                        <button
                            className="management-btn"
                            onClick={() =>
                                setPage("admin-users")
                            }
                        >
                            Manage Users →
                        </button>

                    </div>


                    {/* ACTIVITIES */}

                    <div className="management-card">

                        <div className="management-icon">
                            📋
                        </div>

                        <h3>Activity Management</h3>

                        <p>
                            View, edit and delete user carbon activities.
                        </p>

                        <button
                            className="management-btn"
                            onClick={() =>
                                setPage("admin-activities")
                            }
                        >
                            Manage Activities →
                        </button>

                    </div>


                    {/* EMISSION FACTORS */}

                    <div className="management-card">

                        <div className="management-icon">
                            ⚙️
                        </div>

                        <h3>Emission Factors</h3>

                        <p>
                            Add, edit and delete emission calculation factors.
                        </p>

                        <button
                            className="management-btn"
                            onClick={() =>
                                setPage("admin-factors")
                            }
                        >
                            Manage Factors →
                        </button>

                    </div>

                </div>

            </section>


            {/* ================= OVERVIEW ================= */}

            <section className="overview-grid">

                {/* ================= RECENT USERS ================= */}

                <div className="overview-card">

                    <div className="overview-header">

                        <div>
                            <h2>Recent Users</h2>
                            <p>Latest registered users</p>
                        </div>

                        <button
                            onClick={() =>
                                setPage("admin-users")
                            }
                        >
                            View All
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
                                        {user.name
                                            ? user.name
                                                .charAt(0)
                                                .toUpperCase()
                                            : "U"}
                                    </div>


                                    <div className="user-info">

                                        <h4>
                                            {user.name || "Unnamed User"}
                                        </h4>

                                        <p>
                                            {user.email}
                                        </p>

                                    </div>


                                    <span
                                        className={
                                            user.role === "ADMIN"
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


                {/* ================= RECENT ACTIVITIES ================= */}

                <div className="overview-card">

                    <div className="overview-header">

                        <div>
                            <h2>Recent Activities</h2>
                            <p>Latest carbon activity logs</p>
                        </div>

                        <button
                            onClick={() =>
                                setPage("admin-activities")
                            }
                        >
                            View All
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
                                        🌱
                                    </div>


                                    <div className="activity-info">

                                        <h4>
                                            {activity.activityType ||
                                                "Activity"}
                                        </h4>

                                        <p>
                                            {activity.category ||
                                                "Unknown category"}
                                        </p>

                                        <small>
                                            {activity.logDate || "-"}
                                        </small>

                                    </div>


                                    <div className="activity-emission">

                                        <strong>
                                            {Number(
                                                activity.emission || 0
                                            ).toFixed(2)}
                                        </strong>

                                        <span>
                                            kg CO₂e
                                        </span>

                                    </div>

                                </div>

                            ))

                        )}

                    </div>

                </div>

            </section>


            {/* ================= EMISSION FACTORS ================= */}

            <section className="factor-preview-card">

                <div className="overview-header">

                    <div>
                        <h2>Emission Factors</h2>
                        <p>
                            Current factors used for emission calculations
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            setPage("admin-factors")
                        }
                    >
                        Manage Factors
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
                                        {factor.activityType}
                                    </h4>

                                    <p>
                                        Per {factor.unit}
                                    </p>

                                </div>

                                <strong>
                                    {Number(
                                        factor.factor || 0
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