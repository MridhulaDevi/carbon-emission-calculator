import { useState } from "react";
import "./App.css";

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

function App() {

  const [token, setToken] = useState(
    localStorage.getItem("token") || ""
  );

  const [page, setPage] = useState(
    localStorage.getItem("token") ? "dashboard" : "login"
  );

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    age: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(loginData)
      });

      const data = await response.text();

      if (!response.ok) {
        setMessage(data || "Invalid email or password.");
        return;
      }

      localStorage.setItem("token", data);

      setToken(data);

      setPage("dashboard");

      setLoginData({
        email: "",
        password: ""
      });

    } catch (error) {

      setMessage("Cannot connect to server.");

    } finally {

      setLoading(false);

    }
  };


  // =========================
  // REGISTER
  // =========================

  const handleRegister = async (e) => {

    e.preventDefault();

    setMessage("");

    if (
      registerData.password !==
      registerData.confirmPassword
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
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: registerData.name,
            email: registerData.email,
            password: registerData.password,
            gender: registerData.gender,
            age: Number(registerData.age)
          })
        }
      );

      const data = await response.text();

      if (!response.ok) {
        setMessage(data || "Registration failed.");
        return;
      }

      setMessage(
        "Registration successful. Please sign in."
      );

      setRegisterData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        gender: "",
        age: ""
      });

      setTimeout(() => {

        setPage("login");
        setMessage("");

      }, 1200);

    } catch (error) {

      setMessage("Cannot connect to server.");

    } finally {

      setLoading(false);

    }
  };


  // =========================
  // LOGOUT
  // =========================

  const logout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken("");

    setPage("login");

    setMessage("");
  };


  // =========================
  // ACTIVITY LOGGER
  // =========================

  const [activity, setActivity] = useState({

    category: "transport",

    activityType: "car",

    quantity: "",

    unit: "km",

    logDate:
      new Date()
        .toISOString()
        .split("T")[0]
  });


  const handleCategoryChange = (category) => {

    const defaults = {

      transport: {
        activityType: "car",
        unit: "km"
      },

      electricity: {
        activityType: "electricity",
        unit: "kWh"
      },

      food: {
        activityType: "vegetarian_meal",
        unit: "servings"
      },

      shopping: {
        activityType: "clothing",
        unit: "items"
      }

    };

    setActivity({

      ...activity,

      category,

      ...defaults[category]

    });
  };


  const addActivity = async (e) => {

    e.preventDefault();

    setMessage("");

    try {

      const response = await fetch(
        `${API}/api/activities`,
        {
          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`

          },

          body: JSON.stringify({

            ...activity,

            quantity:
              Number(activity.quantity)

          })
        }
      );

      if (!response.ok) {

        throw new Error(
          await response.text()
        );

      }

      setActivity({

        category: "transport",

        activityType: "car",

        quantity: "",

        unit: "km",

        logDate:
          new Date()
            .toISOString()
            .split("T")[0]

      });

      setMessage(
        "Activity added successfully!"
      );

      setRefreshKey(
        value => value + 1
      );

    } catch (err) {

      setMessage(
        err.message ||
        "Unable to add activity."
      );

    }
  };


  // =========================
  // LOGIN PAGE
  // =========================

  if (page === "login") {

    return (

      <div className="auth-page">

        <div className="auth-visual">

          <div className="logo">

            <span className="logo-mark">
              ↗
            </span>

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
              Track everyday choices, understand
              your carbon footprint and take
              meaningful steps toward a lighter future.
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

            <span>
              Small choices. Real impact.
            </span>

            <span>
              CarbonDown © 2026
            </span>

          </div>

        </div>


        <div className="auth-card-area">

          <div className="auth-card">

            <div className="mobile-logo">

              <span className="logo-mark">
                ↗
              </span>

              CarbonDown

            </div>

            <span className="form-label">
              WELCOME BACK
            </span>

            <h2>
              Sign in to your journey.
            </h2>

            <p className="form-description">
              Continue tracking the choices that matter.
            </p>


            <form onSubmit={handleLogin}>

              <label>
                Email address
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                value={loginData.email}
                onChange={(e) =>
                  setLoginData({
                    ...loginData,
                    email: e.target.value
                  })
                }
                required
              />


              <div className="password-label">

                <label>
                  Password
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>

              </div>


              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter your password"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({
                    ...loginData,
                    password: e.target.value
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

                {!loading && (
                  <span>→</span>
                )}

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
              className="outline-button"
              onClick={() => {

                setPage("register");

                setMessage("");

              }}
            >

              Create an account

              <span>→</span>

            </button>

          </div>

        </div>

      </div>

    );
  }


  // =========================
  // REGISTER PAGE
  // =========================

  if (page === "register") {

    return (

      <div className="register-page">

        <div className="register-visual">

          <div className="logo">

            <span className="logo-mark">
              ↗
            </span>

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

              Create your personal CarbonDown
              account and start understanding
              your everyday environmental impact.

            </p>

          </div>

        </div>


        <div className="register-form-area">

          <button
            className="back-link"
            onClick={() => {

              setPage("login");

              setMessage("");

            }}
          >

            ← Back to sign in

          </button>


          <div className="register-form">

            <span className="form-label">
              CREATE YOUR SPACE
            </span>

            <h2>
              Let's make an impact.
            </h2>

            <p className="form-description">
              Your personal sustainability
              workspace starts here.
            </p>


            <form onSubmit={handleRegister}>

              <label>
                Full name
              </label>

              <input
                type="text"
                placeholder="Your full name"
                value={registerData.name}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    name: e.target.value
                  })
                }
                required
              />


              <label>
                Email address
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                value={registerData.email}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    email: e.target.value
                  })
                }
                required
              />


              <label>
                Password
              </label>

              <input
                type="password"
                placeholder="At least 6 characters"
                value={registerData.password}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    password: e.target.value
                  })
                }
                minLength="6"
                required
              />


              <label>
                Confirm password
              </label>

              <input
                type="password"
                placeholder="Re-enter your password"
                value={registerData.confirmPassword}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    confirmPassword: e.target.value
                  })
                }
                required
              />


              <div className="two-column">

                <div>

                  <label>
                    Gender
                  </label>

                  <select
                    value={registerData.gender}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        gender: e.target.value
                      })
                    }
                    required
                  >

                    <option value="">
                      Select
                    </option>

                    <option value="Female">
                      Female
                    </option>

                    <option value="Male">
                      Male
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                </div>


                <div>

                  <label>
                    Age
                  </label>

                  <input
                    type="number"
                    min="1"
                    max="120"
                    placeholder="Age"
                    value={registerData.age}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        age: e.target.value
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

                {!loading && (
                  <span>→</span>
                )}

              </button>

            </form>


            {message && (
              <div className="auth-message">
                {message}
              </div>
            )}

          </div>

        </div>

      </div>

    );
  }


  // =========================
  // APPLICATION PAGES
  // =========================

  return (

    <div className="app-layout">

      <Sidebar

        currentPage={page}

        setCurrentPage={(nextPage) => {

          setPage(nextPage);

          setMessage("");

        }}

        onLogout={logout}

      />


      <main className="app-content">


        {/* =========================
            NORMAL USER DASHBOARD
           ========================= */}

        {page === "dashboard" && (

          <>

            <Dashboard
              key={refreshKey}
              token={token}
            />


            <section className="activity-entry-panel">

              <h2>
                Log a New Activity
              </h2>

              <p>
                Record an activity to calculate
                its carbon emissions.
              </p>


              {message && (
                <div className="profile-message">
                  {message}
                </div>
              )}


              <form onSubmit={addActivity}>

                <label>
                  Category
                </label>

                <select
                  value={activity.category}
                  onChange={(e) =>
                    handleCategoryChange(
                      e.target.value
                    )
                  }
                >

                  <option value="transport">
                    Transport
                  </option>

                  <option value="electricity">
                    Electricity
                  </option>

                  <option value="food">
                    Food
                  </option>

                  <option value="shopping">
                    Shopping
                  </option>

                </select>


                <label>
                  Activity type
                </label>

                <select
                  value={activity.activityType}
                  onChange={(e) =>
                    setActivity({
                      ...activity,
                      activityType:
                        e.target.value
                    })
                  }
                >

                  {activity.category ===
                    "transport" && (
                    <>
                      <option value="car">
                        Car
                      </option>

                      <option value="flight">
                        Flight
                      </option>

                      <option value="public_transport">
                        Public transport
                      </option>
                    </>
                  )}


                  {activity.category ===
                    "electricity" && (

                    <option value="electricity">
                      Electricity
                    </option>

                  )}


                  {activity.category ===
                    "food" && (
                    <>
                      <option value="vegetarian_meal">
                        Vegetarian meal
                      </option>

                      <option value="non_vegetarian_meal">
                        Non-vegetarian meal
                      </option>
                    </>
                  )}


                  {activity.category ===
                    "shopping" && (
                    <>
                      <option value="clothing">
                        Clothing
                      </option>

                      <option value="electronics">
                        Electronics
                      </option>
                    </>
                  )}

                </select>


                <label>
                  Quantity ({activity.unit})
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={activity.quantity}
                  onChange={(e) =>
                    setActivity({
                      ...activity,
                      quantity:
                        e.target.value
                    })
                  }
                  required
                />


                <label>
                  Date
                </label>

                <input
                  type="date"
                  value={activity.logDate}
                  onChange={(e) =>
                    setActivity({
                      ...activity,
                      logDate:
                        e.target.value
                    })
                  }
                  required
                />


                <button
                  type="submit"
                  className="main-button"
                >
                  Calculate & Log Activity →
                </button>

              </form>

            </section>

          </>

        )}


        {/* =========================
            NORMAL USER PAGES
           ========================= */}

        {page === "activities" && (
          <Activities token={token} />
        )}

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
            onBack={() =>
              setPage("dashboard")
            }
          />
        )}


        {/* =========================
            ADMIN PAGES
           ========================= */}

        {page === "admin" && (
          <AdminDashboard
            setPage={setPage}
          />
        )}

        {page === "admin-users" && (
          <AdminUsers
            setPage={setPage}
          />
        )}

        {page === "admin-activities" && (
          <AdminActivities
            setPage={setPage}
          />
        )}

        {page === "admin-factors" && (
          <AdminEmissionFactors
            setPage={setPage}
          />
        )}

      </main>

    </div>

  );
}

export default App;