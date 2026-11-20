
import { useEffect, useState } from "react";
import "./App.css";

import LandingPage from "./LandingPage";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import Activities from "./Activities";
import Goals from "./Goals";
import Recommendations from "./Recommendations";
import Badges from "./Badges";
import Profile from "./Profile";

import AdminDashboard from "./AdminDashboard";
import AdminUsers from "./AdminUsers";
import AdminActivities from "./AdminActivities";
import AdminEmissionFactors from "./AdminEmissionFactors";

const API = "http://localhost:8080";

const emptyLogin = {
  email: "",
  password: "",
};

const emptyRegister = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  gender: "",
  age: "",
};

function App() {
  const [token, setToken] = useState(
    localStorage.getItem("token") || ""
  );

  const [page, setPage] = useState(
    localStorage.getItem("token") ? "dashboard" : "landing"
  );

  const [loginData, setLoginData] = useState(emptyLogin);
  const [registerData, setRegisterData] = useState(emptyRegister);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // ==============================
  // PAGE NAVIGATION
  // ==============================

  const navigate = (nextPage) => {
    setPage(nextPage);
    setMessage("");
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  // ==============================
  // LOGIN
  // ==============================

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.text();

      if (!response.ok) {
        setMessage(data || "Invalid email or password.");
        return;
      }

      const receivedToken = data.trim();

      if (!receivedToken) {
        setMessage("Login failed: no token received.");
        return;
      }

      localStorage.setItem("token", receivedToken);

      setToken(receivedToken);
      setLoginData(emptyLogin);
      navigate("dashboard");
    } catch (error) {
      setMessage("Cannot connect to server.");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // REGISTER
  // ==============================

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    if (
      registerData.password !== registerData.confirmPassword
    ) {
      setMessage("Passwords do not match.");
      return;
    }

    if (registerData.password.length < 6) {
      setMessage(
        "Password must contain at least 6 characters."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: registerData.name,
            email: registerData.email,
            password: registerData.password,
            gender: registerData.gender,
            age: Number(registerData.age),
          }),
        }
      );

      const data = await response.text();

      if (!response.ok) {
        setMessage(data || "Registration failed.");
        return;
      }

      setRegisterData(emptyRegister);
      navigate("login");
      setMessage(
        "Registration successful. Please sign in."
      );
    } catch (error) {
      setMessage("Cannot connect to server.");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // LOGOUT
  // ==============================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken("");
    setLoginData(emptyLogin);
    setMessage("");
    navigate("landing");
  };

  // ==============================
  // LANDING PAGE
  // ==============================

  if (page === "landing" && !token) {
    return (
      <LandingPage
        onRegister={() => navigate("register")}
        onSignIn={() => navigate("login")}
      />
    );
  }

  // ==============================
  // LOGIN PAGE
  // ==============================

  if (page === "login" && !token) {
    return (
      <div className="auth-page">
        <div className="auth-visual">
          <div className="logo">
            <span className="logo-mark">↗</span>
            CarbonDown
          </div>

          <div className="visual-content">
            <span className="tag">
              PERSONAL CLIMATE TRACKER
            </span>

            <h1>
              Know your
              <br />
              <span>impact.</span>
            </h1>

            <p>
              Track everyday choices, understand your
              carbon footprint and take meaningful
              steps toward a lighter future.
            </p>

            <div className="visual-stats">
              <div>
                <strong>01</strong>
                <span>Track</span>
              </div>

              <div>
                <strong>02</strong>
                <span>Understand</span>
              </div>

              <div>
                <strong>03</strong>
                <span>Reduce</span>
              </div>
            </div>
          </div>

          <div className="visual-bottom">
            <span>Small choices. Real impact.</span>
            <span>CarbonDown © 2026</span>
          </div>
        </div>

        <div className="auth-card-area">
          <div className="auth-card">
            <button
              type="button"
              className="back-link"
              onClick={() => navigate("landing")}
            >
              ← Back to Home
            </button>

            <div className="mobile-logo">
              <span className="logo-mark">↗</span>
              CarbonDown
            </div>

            <span className="form-label">
              WELCOME BACK
            </span>

            <h2>Sign in to your journey.</h2>

            <p className="form-description">
              Continue tracking the choices that matter.
            </p>

            <form onSubmit={handleLogin}>
              <label htmlFor="login-email">
                Email address
              </label>

              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={loginData.email}
                onChange={(e) =>
                  setLoginData({
                    ...loginData,
                    email: e.target.value,
                  })
                }
                required
              />

              <div className="password-label">
                <label htmlFor="login-password">
                  Password
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <input
                id="login-password"
                type={
                  showPassword ? "text" : "password"
                }
                placeholder="Enter your password"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({
                    ...loginData,
                    password: e.target.value,
                  })
                }
                required
              />

              <button
                className="main-button"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Signing in..."
                  : "Sign in"}

                {!loading && <span>→</span>}
              </button>
            </form>

            {message && (
              <div className="auth-message">
                {message}
              </div>
            )}

            <div className="auth-divider">
              <span>NEW HERE?</span>
            </div>

            <button
              type="button"
              className="outline-button"
              onClick={() => navigate("register")}
            >
              Create an account
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==============================
  // REGISTER PAGE
  // ==============================

  if (page === "register" && !token) {
    return (
      <div className="register-page">
        <div className="register-visual">
          <div className="logo">
            <span className="logo-mark">↗</span>
            CarbonDown
          </div>

          <div>
            <span className="tag">
              START YOUR JOURNEY
            </span>

            <h1>
              A cleaner
              <br />
              way to <span>think.</span>
            </h1>

            <p>
              Create your personal CarbonDown account
              and start understanding your everyday
              environmental impact.
            </p>
          </div>
        </div>

        <div className="register-form-area">
          <button
            type="button"
            className="back-link"
            onClick={() => navigate("landing")}
          >
            ← Back to Home
          </button>

          <div className="register-form">
            <span className="form-label">
              CREATE YOUR SPACE
            </span>

            <h2>Let's make an impact.</h2>

            <p className="form-description">
              Your personal sustainability workspace
              starts here.
            </p>

            <form onSubmit={handleRegister}>
              <label htmlFor="register-name">
                Full name
              </label>

              <input
                id="register-name"
                type="text"
                placeholder="Your full name"
                value={registerData.name}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    name: e.target.value,
                  })
                }
                required
              />

              <label htmlFor="register-email">
                Email address
              </label>

              <input
                id="register-email"
                type="email"
                placeholder="you@example.com"
                value={registerData.email}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    email: e.target.value,
                  })
                }
                required
              />

              <label htmlFor="register-password">
                Password
              </label>

              <input
                id="register-password"
                type="password"
                placeholder="At least 6 characters"
                value={registerData.password}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    password: e.target.value,
                  })
                }
                minLength={6}
                required
              />

              <label htmlFor="register-confirm">
                Confirm password
              </label>

              <input
                id="register-confirm"
                type="password"
                placeholder="Re-enter your password"
                value={registerData.confirmPassword}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    confirmPassword: e.target.value,
                  })
                }
                required
              />

              <div className="two-column">
                <div>
                  <label htmlFor="register-gender">
                    Gender
                  </label>

                  <select
                    id="register-gender"
                    value={registerData.gender}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        gender: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="register-age">
                    Age
                  </label>

                  <input
                    id="register-age"
                    type="number"
                    min="1"
                    max="120"
                    placeholder="Age"
                    value={registerData.age}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        age: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <button
                className="main-button"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Creating..."
                  : "Create account"}

                {!loading && <span>→</span>}
              </button>
            </form>

            {message && (
              <div className="auth-message">
                {message}
              </div>
            )}

            <p className="form-description">
              Already have an account?{" "}
              <button
                type="button"
                className="back-link"
                onClick={() => navigate("login")}
              >
                Sign in →
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==============================
  // PROTECT APPLICATION PAGES
  // ==============================

  if (!token) {
    return (
      <LandingPage
        onRegister={() => navigate("register")}
        onSignIn={() => navigate("login")}
      />
    );
  }

  // ==============================
  // MAIN APPLICATION
  // ==============================

  return (
    <div className="app-layout">
      <Sidebar
        currentPage={page}
        setCurrentPage={navigate}
        onLogout={logout}
      />

      <main className="app-content">
        {/* DASHBOARD - SUMMARY ONLY */}

        {page === "dashboard" && (
          <Dashboard
            key={refreshKey}
            token={token}
          />
        )}

        {/* ACTIVITIES - LOGGING + CRUD */}

        {page === "activities" && (
          <Activities
            token={token}
            onActivityChanged={() =>
              setRefreshKey((value) => value + 1)
            }
          />
        )}

        {/* USER PAGES */}

        {page === "goals" && (
          <Goals token={token} />
        )}

        {page === "recommendations" && (
          <Recommendations token={token} />
        )}

        {page === "badges" && (
          <Badges token={token} />
        )}

        {page === "profile" && (
          <Profile
            token={token}
            onBack={() => navigate("dashboard")}
          />
        )}

        {/* ADMIN PAGES */}

        {page === "admin" && (
          <AdminDashboard setPage={navigate} />
        )}

        {page === "admin-users" && (
          <AdminUsers setPage={navigate} />
        )}

        {page === "admin-activities" && (
          <AdminActivities setPage={navigate} />
        )}

        {page === "admin-factors" && (
          <AdminEmissionFactors setPage={navigate} />
        )}
      </main>
    </div>
  );
}

export default App;
