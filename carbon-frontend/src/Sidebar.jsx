import React from "react";
import { useTranslation } from "react-i18next";

import {
  LayoutDashboard,
  ChartNoAxesCombined,
  ClipboardList,
  Target,
  Lightbulb,
  Award,
  UserRound,
  UsersRound,
  ShieldCheck,
  Settings2,
  Leaf,
  Globe2,
  LogOut,
  Trophy
} from "lucide-react";

import "./Sidebar.css";

function Sidebar({
  currentPage,
  setCurrentPage,
  onLogout
}) {

  const { t } = useTranslation();

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

      if (typeof role === "object" && role !== null) {
        role = role.authority || role.role || "USER";
      }

      role = String(role).toUpperCase();

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

  // NORMAL USER MENU

  const menu = [

    {
      id: "dashboard",
      icon: LayoutDashboard,
      label: t("dashboard")
    },

    {
      id: "analytics",
      icon: ChartNoAxesCombined,
      label: t("analytics", {
        defaultValue: "Analytics"
      })
    },

    {
      id: "leaderboard",
      icon: Trophy,
      label: t("leaderboard", {
        defaultValue: "Leaderboard"
      })
    },

    {
      id: "activities",
      icon: ClipboardList,
      label: t("activities")
    },

    {
      id: "goals",
      icon: Target,
      label: t("goals")
    },

    {
      id: "recommendations",
      icon: Lightbulb,
      label: t("recommendations")
    },

    {
      id: "badges",
      icon: Award,
      label: t("badges")
    },

    {
      id: "profile",
      icon: UserRound,
      label: t("profile")
    }

  ];

  // ADMIN MENU

  const adminMenu = [

    {
      id: "admin",
      icon: LayoutDashboard,
      label: t("adminDashboard")
    },

    {
      id: "admin-analytics",
      icon: ChartNoAxesCombined,
      label: t("adminAnalytics", {
        defaultValue: "Admin Analytics"
      })
    },

    {
      id: "admin-users",
      icon: UsersRound,
      label: t("manageUsers")
    },

    {
      id: "admin-activities",
      icon: ClipboardList,
      label: t("manageActivities")
    },

    {
      id: "adminBadges",
      icon: ShieldCheck,
      label: t("badgeManagement")
    },

    {
      id: "admin-factors",
      icon: Settings2,
      label: t("emissionFactors")
    }

  ];

  const renderMenuItem = item => {

    const Icon = item.icon;

    return (

      <button
        key={item.id}
        type="button"
        className={
          currentPage === item.id
            ? "sidebar-item active"
            : "sidebar-item"
        }
        onClick={() => setCurrentPage(item.id)}
      >

        <span className="sidebar-item-icon">
          <Icon size={19} strokeWidth={1.9} />
        </span>

        <span className="sidebar-item-text">
          {item.label}
        </span>

      </button>
    );
  };

  return (

    <aside className="app-sidebar">

      {/* BRAND */}

      <div className="sidebar-brand">

        <span className="brand-icon">
          <Leaf size={23} strokeWidth={2} />
        </span>

        <div>

          <h2>CarbonDown</h2>

          <small>{t("liveGreener")}</small>

        </div>

      </div>

      {/* USER MENU */}

      <p className="sidebar-label">
        {t("workspace")}
      </p>

      <nav className="sidebar-menu">
        {menu.map(renderMenuItem)}
      </nav>

      {/* ADMIN MENU */}

      {isAdmin && (

        <>

          <p className="sidebar-label admin-section-label">
            {t("adminPanel")}
          </p>

          <nav className="sidebar-menu">
            {adminMenu.map(renderMenuItem)}
          </nav>

        </>

      )}

      {/* BOTTOM */}

      <div className="sidebar-bottom">

        <div className="sidebar-tip">

          <span className="sidebar-tip-icon">
            <Globe2 size={22} strokeWidth={1.8} />
          </span>

          <p>{t("tip")}</p>

        </div>

        <button
          type="button"
          className="logout-btn"
          onClick={onLogout}
        >

          <LogOut size={18} strokeWidth={1.9} />

          <span>{t("logout")}</span>

        </button>

      </div>

    </aside>
  );
}

export default Sidebar;