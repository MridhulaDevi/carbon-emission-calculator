import "./Sidebar.css";

function Sidebar({ currentPage, setCurrentPage, onLogout }) {

  // ==========================================
  // GET ROLE FROM JWT
  // ==========================================

  const getUserRole = () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return "USER";
      }

      const parts = token.split(".");

      if (parts.length !== 3) {
        return "USER";
      }

      const payload = JSON.parse(
        atob(
          parts[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/")
        )
      );

      let role = payload.role || payload.authorities || "USER";

      // If authorities is an array
      if (Array.isArray(role)) {
        role = role[0];
      }

      role = String(role).toUpperCase();

      // Handle ROLE_ADMIN or ROLE_USER
      if (role.startsWith("ROLE_")) {
        role = role.substring(5);
      }

      return role;

    } catch (error) {
      console.error("Unable to read JWT role:", error);
      return "USER";
    }
  };


  const userRole = getUserRole();

  const isAdmin = userRole === "ADMIN";


  // ==========================================
  // NORMAL USER MENU
  // ==========================================

  const menu = [
    {
      id: "dashboard",
      icon: "⌂",
      label: "Dashboard"
    },
    {
      id: "activities",
      icon: "◷",
      label: "Activities"
    },
    {
      id: "goals",
      icon: "◎",
      label: "My Goals"
    },
    {
      id: "recommendations",
      icon: "✳",
      label: "Recommendations"
    },
    {
      id: "badges",
      icon: "♕",
      label: "Badges"
    },
    {
      id: "profile",
      icon: "♙",
      label: "My Profile"
    }
  ];


  // ==========================================
  // ADMIN MENU
  // ==========================================

  const adminMenu = [
    {
      id: "admin",
      icon: "▣",
      label: "Admin Dashboard"
    },
    {
      id: "admin-users",
      icon: "♙",
      label: "Manage Users"
    },
    {
      id: "admin-activities",
      icon: "◷",
      label: "Manage Activities"
    },
    {
      id: "admin-factors",
      icon: "⚙",
      label: "Emission Factors"
    }
  ];


  return (
    <aside className="app-sidebar">

      {/* =====================================
          BRAND
      ===================================== */}

      <div className="sidebar-brand">

        <span className="brand-icon">
          🌱
        </span>

        <div>
          <h2>CarbonDown</h2>
          <small>LIVE GREENER</small>
        </div>

      </div>


      {/* =====================================
          NORMAL USER MENU
      ===================================== */}

      <p className="sidebar-label">
        WORKSPACE
      </p>

      <nav className="sidebar-menu">

        {menu.map((item) => (

          <button
            key={item.id}
            className={
              currentPage === item.id
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() => setCurrentPage(item.id)}
          >

            <span>
              {item.icon}
            </span>

            {item.label}

          </button>

        ))}

      </nav>


      {/* =====================================
          ADMIN MENU
      ===================================== */}

      {isAdmin && (
        <>
          <p className="sidebar-label admin-section-label">
            ADMIN PANEL
          </p>

          <nav className="sidebar-menu">

            {adminMenu.map((item) => (

              <button
                key={item.id}
                className={
                  currentPage === item.id
                    ? "sidebar-item active"
                    : "sidebar-item"
                }
                onClick={() => setCurrentPage(item.id)}
              >

                <span>
                  {item.icon}
                </span>

                {item.label}

              </button>

            ))}

          </nav>
        </>
      )}


      {/* =====================================
          BOTTOM
      ===================================== */}

      <div className="sidebar-bottom">

        <div className="sidebar-tip">

          <span>🌍</span>

          <p>
            Small steps today.
            A greener tomorrow.
          </p>

        </div>

        <button
          className="logout-btn"
          onClick={onLogout}
        >
          ↪ Log Out
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;