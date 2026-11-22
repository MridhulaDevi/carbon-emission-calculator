
import { useTranslation } from "react-i18next";
import "./Sidebar.css";

function Sidebar({ currentPage, setCurrentPage, onLogout }) {

  const { t } = useTranslation();

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

      let role =
        payload.role ||
        payload.authorities ||
        "USER";

      if (Array.isArray(role)) {
        role = role[0];
      }

      role = String(role).toUpperCase();

      if (role.startsWith("ROLE_")) {
        role = role.substring(5);
      }

      return role;

    } catch (error) {
      console.error(
        "Unable to read JWT role:",
        error
      );

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
      label: t("dashboard")
    },
    {
      id: "activities",
      icon: "◷",
      label: t("activities")
    },
    {
      id: "goals",
      icon: "◎",
      label: t("goals")
    },
    {
      id: "recommendations",
      icon: "✳",
      label: t("recommendations")
    },
    {
      id: "badges",
      icon: "♕",
      label: t("badges")
    },
    {
      id: "profile",
      icon: "♙",
      label: t("profile")
    }
  ];

  // ==========================================
  // ADMIN MENU
  // ==========================================

  const adminMenu = [
    {
      id: "admin",
      icon: "▣",
      label: t("adminDashboard")
    },
    {
      id: "admin-users",
      icon: "♙",
      label: t("manageUsers")
    },
    {
      id: "admin-activities",
      icon: "◷",
      label: t("manageActivities")
    },
    {
      id: "adminBadges",
      icon: "♧",
      label: t("badgeManagement")
    },
    {
      id: "admin-factors",
      icon: "⚙",
      label: t("emissionFactors")
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

          <small>
            {t("liveGreener")}
          </small>
        </div>

      </div>

      {/* =====================================
          NORMAL USER MENU
      ===================================== */}

      <p className="sidebar-label">
        {t("workspace")}
      </p>

      <nav className="sidebar-menu">

        {menu.map((item) => (

          <button
            key={item.id}
            type="button"
            className={
              currentPage === item.id
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() =>
              setCurrentPage(item.id)
            }
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
            {t("adminPanel")}
          </p>

          <nav className="sidebar-menu">

            {adminMenu.map((item) => (

              <button
                key={item.id}
                type="button"
                className={
                  currentPage === item.id
                    ? "sidebar-item active"
                    : "sidebar-item"
                }
                onClick={() =>
                  setCurrentPage(item.id)
                }
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
            {t("tip")}
          </p>

        </div>

        <button
          type="button"
          className="logout-btn"
          onClick={onLogout}
        >
          ↪ {t("logout")}
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;
