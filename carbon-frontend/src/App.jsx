
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import "./App.css";
import "./i18n";

import LandingPage from "./LandingPage";
import Sidebar from "./Sidebar";
import LanguageSwitcher from "./LanguageSwitcher";

import Dashboard from "./Dashboard";
import Activities from "./Activities";
import Goals from "./Goals";
import Recommendations from "./Recommendations";
import Badges from "./Badges";
import AdminBadges from "./AdminBadges";
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
  const { t } = useTranslation();

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

  // ==========================================
  // PAGE NAVIGATION
  // ==========================================

  const navigate = (nextPage) => {
    setPage(nextPage);
    setMessage("");
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  // ==========================================
  // LOGIN
  // ==========================================

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
      console.error("Login error:", error);
      setMessage("Cannot connect to server.");

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // REGISTER
  // ==========================================

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
      console.error("Registration error:", error);
      setMessage("Cannot connect to server.");

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken("");
    setLoginData(emptyLogin);
    setMessage("");

    navigate("landing");
  };

  // ==========================================
  // LANDING PAGE
  // ==========================================

  if (page === "landing" && !token) {
    return (
      <div className="public-page-wrapper">
        <div className="public-language-switcher">
          
        </div>

        <LandingPage
          onRegister={() => navigate("register")}
          onSignIn={() => navigate("login")}
          languageSelector={<LanguageSwitcher />}
        />
      </div>
    );
  }

  // ==========================================
  // LOGIN PAGE
  // ==========================================

  if (page === "login" && !token) {
    return (
      <div className="auth-page">

        {/* LEFT VISUAL */}

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

        {/* RIGHT LOGIN FORM */}

        <div className="auth-card-area">

          <div className="auth-language-bar">
            <LanguageSwitcher />
          </div>

          <div className="auth-card">

            <button
              type="button"
              className="back-link"
              onClick={() => navigate("landing")}
            >
              ← {t("backHome")}
            </button>

            <div className="mobile-logo">
              <span className="logo-mark">↗</span>
              CarbonDown
            </div>

            <span className="form-label">
              {t("welcomeBack")}
            </span>

            <h2>{t("loginTitle")}</h2>

            <p className="form-description">
              {t("loginDescription")}
            </p>

            <form onSubmit={handleLogin}>

              <label htmlFor="login-email">
                {t("email")}
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
                  {t("password")}
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? t("hide") : t("show")}
                </button>

              </div>

              <input
                id="login-password"
                type={
                  showPassword ? "text" : "password"
                }
                placeholder={t("password")}
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
                  ? t("signingIn")
                  : t("signIn")}

                {!loading && <span>→</span>}
              </button>

            </form>

            {message && (
              <div className="auth-message">
                {message}
              </div>
            )}

            <div className="auth-divider">
              <span>{t("newHere")}</span>
            </div>

            <button
              type="button"
              className="outline-button"
              onClick={() => navigate("register")}
            >
              {t("register")}
              <span>→</span>
            </button>

          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // REGISTER PAGE
  // ==========================================

  if (page === "register" && !token) {
    return (
      <div className="register-page">

        {/* LEFT VISUAL */}

        <div className="register-visual">

          <div className="logo">
            <span className="logo-mark">↗</span>
            CarbonDown
          </div>

          <div>
            <span className="tag">
              {t("startJourney")}
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

        {/* RIGHT REGISTER FORM */}

        <div className="register-form-area">

          <div className="auth-language-bar">
            <LanguageSwitcher />
          </div>

          <button
            type="button"
            className="back-link"
            onClick={() => navigate("landing")}
          >
            ← {t("backHome")}
          </button>

          <div className="register-form">

            <span className="form-label">
              {t("createSpace")}
            </span>

            <h2>{t("registerTitle")}</h2>

            <p className="form-description">
              {t("registerDescription")}
            </p>

            <form onSubmit={handleRegister}>

              <label htmlFor="register-name">
                {t("fullName")}
              </label>

              <input
                id="register-name"
                type="text"
                placeholder={t("fullName")}
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
                {t("email")}
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
                {t("password")}
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
                {t("confirmPassword")}
              </label>

              <input
                id="register-confirm"
                type="password"
                placeholder={t("confirmPassword")}
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
                    {t("gender")}
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
                    <option value="">
                      {t("select")}
                    </option>

                    <option value="Female">
                      {t("female")}
                    </option>

                    <option value="Male">
                      {t("male")}
                    </option>

                    <option value="Other">
                      {t("other")}
                    </option>
                  </select>
                </div>

                <div>
                  <label htmlFor="register-age">
                    {t("age")}
                  </label>

                  <input
                    id="register-age"
                    type="number"
                    min="1"
                    max="120"
                    placeholder={t("age")}
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
                  ? t("creating")
                  : t("register")}

                {!loading && <span>→</span>}
              </button>

            </form>

            {message && (
              <div className="auth-message">
                {message}
              </div>
            )}

            <p className="form-description">
              {t("alreadyAccount")}{" "}

              <button
                type="button"
                className="back-link"
                onClick={() => navigate("login")}
              >
                {t("signIn")} →
              </button>
            </p>

          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // PROTECT APPLICATION PAGES
  // ==========================================

  if (!token) {
    return (
      <div className="public-page-wrapper">

        <div className="public-language-switcher">
          <LanguageSwitcher />
        </div>

        <LandingPage
          onRegister={() => navigate("register")}
          onSignIn={() => navigate("login")}
        />

      </div>
    );
  }

  // ==========================================
  // MAIN APPLICATION
  // ==========================================

  return (
    <div className="app-layout">

      <Sidebar
        currentPage={page}
        setCurrentPage={navigate}
        onLogout={logout}
      />

      <main className="app-content">

        {/* GLOBAL LANGUAGE SELECTOR */}

        <div className="app-language-bar">
          <LanguageSwitcher />
        </div>

        {/* DASHBOARD */}

        {page === "dashboard" && (
          <Dashboard
            key={refreshKey}
            token={token}
          />
        )}

        {/* ACTIVITIES */}

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

        {page === "adminBadges" && (
          <AdminBadges setPage={navigate} />
        )}

        {page === "admin-factors" && (
          <AdminEmissionFactors setPage={navigate} />
        )}

      </main>
    </div>
  );
}

export default App;
