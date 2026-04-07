import React, { useState, useRef, useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowUpDown,
  Lightbulb,
  User,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  TrendingUp,
  LogOut,
} from "lucide-react";
import { useStore } from "../store/useStore.jsx";
import { exportCSV } from "../utils/helpers";
import AddModal from "./AddModal";
import Toast from "./Toast";

// ── nav items ─────────────────────────────────────────────────────
const NAV = [
  { to: "/", label: "Dashboard", Icon: LayoutDashboard, end: true },
  { to: "/transactions", label: "Transactions", Icon: ArrowUpDown, end: false },
  { to: "/insights", label: "Insights", Icon: Lightbulb, end: false },
  { to: "/profile", label: "Profile", Icon: User, end: false },
];

const PAGE_META = {
  "/": ["Dashboard", "Your financial overview at a glance"],
  "/transactions": ["Transactions", "Browse and manage all transactions"],
  "/insights": ["Insights", "Patterns and observations from your data"],
  "/profile": ["Profile", "Account settings and preferences"],
};

// ── Tooltip for collapsed sidebar ─────────────────────────────────
function NavTooltip({ label, visible }) {
  if (!visible) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: "calc(100% + 12px)",
        top: "50%",
        transform: "translateY(-50%)",
        background: "var(--bg4)",
        border: "1px solid var(--border2)",
        color: "var(--text)",
        fontSize: 12,
        fontWeight: 500,
        padding: "5px 10px",
        borderRadius: 7,
        whiteSpace: "nowrap",
        pointerEvents: "none",
        zIndex: 200,
        boxShadow: "0 4px 12px rgba(0,0,0,.4)",
      }}
    >
      {label}
      {/* arrow */}
      <div
        style={{
          position: "absolute",
          right: "100%",
          top: "50%",
          transform: "translateY(-50%)",
          borderTop: "5px solid transparent",
          borderBottom: "5px solid transparent",
          borderRight: "6px solid var(--border2)",
        }}
      />
    </div>
  );
}

export default function AppShell() {
  const { transactions, isAdmin, role, setRole } = useStore();

  // sidebar state
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState(null);

  // modal / toast
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);

  const sidebarRef = useRef(null);
  const { pathname } = useLocation();
  const [title, subtitle] = PAGE_META[pathname] || ["Dashboard", ""];

  // close mobile sidebar on outside click
  useEffect(() => {
    const fn = (e) => {
      if (
        mobileOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target)
      )
        setMobileOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [mobileOpen]);

  // lock body scroll when mobile open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const handleExport = () => {
    exportCSV(transactions);
    showToast("CSV exported successfully");
  };

  // sidebar width
  const SW = collapsed ? 68 : 240;

  // ── Shared sidebar inner content ──────────────────────────────
  const SidebarInner = ({ isMobile = false }) => {
    const isCol = collapsed && !isMobile;

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {/* ── Logo row ── */}
        <div
          style={{
            padding: isCol ? "16px 0" : "16px 20px 14px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: isCol ? "center" : "space-between",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                flexShrink: 0,
                background: "linear-gradient(135deg,#00d4aa,#7c6fe0)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              💰
            </div>
            {!isCol && (
              <div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--text)",
                    lineHeight: 1.2,
                  }}
                >
                  FinancePro
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--text3)",
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                  }}
                >
                  Dashboard
                </div>
              </div>
            )}
          </div>
          {/* close btn on mobile */}
          {isMobile && (
            <button
              onClick={() => setMobileOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "var(--text2)",
                cursor: "pointer",
                padding: 4,
                display: "flex",
                borderRadius: 6,
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* ── Nav section ── */}
        <nav style={{ flex: 1, padding: "12px 0" }}>
          {!isCol && (
            <div
              style={{
                fontSize: 10,
                color: "var(--text3)",
                letterSpacing: 1.5,
                textTransform: "uppercase",
                padding: "0 20px 8px",
              }}
            >
              Navigation
            </div>
          )}
          {NAV.map(({ to, label, Icon, end }) => (
            <div
              key={to}
              style={{
                position: "relative",
                margin: isCol ? "2px 6px" : "2px 10px",
              }}
              onMouseEnter={() => isCol && setHoveredNav(to)}
              onMouseLeave={() => setHoveredNav(null)}
            >
              <NavLink
                to={to}
                end={end}
                onClick={() => isMobile && setMobileOpen(false)}
                style={({ isActive }) => ({
                  display: "flex",
                  alignItems: "center",
                  gap: isCol ? 0 : 12,
                  padding: isCol ? "11px 0" : "10px 12px",
                  justifyContent: isCol ? "center" : "flex-start",
                  borderRadius: 9,
                  color: isActive ? "var(--teal)" : "var(--text2)",
                  background: isActive ? "var(--teal-dim)" : "transparent",
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 13,
                  textDecoration: "none",
                  transition: "background .15s, color .15s",
                  position: "relative",
                })}
              >
                {({ isActive }) => (
                  <>
                    {/* active left bar */}
                    {isActive && !isCol && (
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          top: "20%",
                          bottom: "20%",
                          width: 3,
                          borderRadius: "0 3px 3px 0",
                          background: "var(--teal)",
                        }}
                      />
                    )}
                    <Icon
                      size={18}
                      style={{
                        flexShrink: 0,
                        color: isActive ? "var(--teal)" : "var(--text2)",
                      }}
                    />
                    {!isCol && (
                      <span
                        style={{
                          color: isActive ? "var(--teal)" : "var(--text2)",
                        }}
                      >
                        {label}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
              {/* tooltip when collapsed */}
              <NavTooltip label={label} visible={isCol && hoveredNav === to} />
            </div>
          ))}
        </nav>

        {/* ── Role switcher ── */}
        {!isCol && (
          <div
            style={{
              padding: "14px 16px",
              borderTop: "1px solid var(--border)",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "var(--text3)",
                letterSpacing: 1.5,
                textTransform: "uppercase",
                marginBottom: 7,
              }}
            >
              Current Role
            </div>
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                showToast(`Switched to ${e.target.value} role`);
              }}
              style={{
                width: "100%",
                background: "var(--bg3)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                padding: "7px 10px",
                borderRadius: 8,
                fontSize: 13,
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="admin">Admin</option>
              <option value="viewer">Viewer</option>
            </select>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "3px 10px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 600,
                marginTop: 7,
                background:
                  role === "admin" ? "var(--teal-dim)" : "var(--purple-dim)",
                color: role === "admin" ? "var(--teal)" : "var(--purple)",
              }}
            >
              ● {role.toUpperCase()}
            </div>
          </div>
        )}

        {/* ── Collapsed role indicator ── */}
        {isCol && (
          <div
            style={{
              padding: "12px 0",
              borderTop: "1px solid var(--border)",
              display: "flex",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: role === "admin" ? "var(--teal)" : "var(--purple)",
                boxShadow: `0 0 6px ${role === "admin" ? "var(--teal)" : "var(--purple)"}`,
              }}
            />
          </div>
        )}
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "var(--bg)",
        overflow: "hidden",
      }}
    >
      {/* ════ DESKTOP SIDEBAR ════ */}
      <aside
        style={{
          width: SW,
          minWidth: SW,
          flexShrink: 0,
          background: "var(--bg2)",
          borderRight: "1px solid var(--border)",
          position: "relative",
          transition:
            "width .25s cubic-bezier(.4,0,.2,1), min-width .25s cubic-bezier(.4,0,.2,1)",
          display: "flex",
          flexDirection: "column",
          // hidden on small screens
          ...(typeof window !== "undefined" && window.innerWidth < 768
            ? { display: "none" }
            : {}),
        }}
        id="ds-sidebar"
      >
        {/* inject media query to hide on mobile */}
        <style>{`
          @media(max-width:767px){#ds-sidebar{display:none!important}}
          @media(min-width:768px){#ds-sidebar{display:flex!important}}
          .nav-link-hover:hover{background:var(--bg3)!important}
        `}</style>

        <SidebarInner />

        {/* ── Toggle collapse button ── */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            position: "absolute",
            top: 68,
            right: -13,
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: "var(--bg3)",
            border: "1px solid var(--border2)",
            color: "var(--text2)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            transition: "all .2s",
            boxShadow: "0 2px 8px rgba(0,0,0,.3)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--teal-dim)";
            e.currentTarget.style.color = "var(--teal)";
            e.currentTarget.style.borderColor = "var(--teal)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--bg3)";
            e.currentTarget.style.color = "var(--text2)";
            e.currentTarget.style.borderColor = "var(--border2)";
          }}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </aside>

      {/* ════ MOBILE OVERLAY SIDEBAR ════ */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            background: "rgba(0,0,0,.65)",
            backdropFilter: "blur(2px)",
          }}
        >
          <div
            ref={sidebarRef}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 260,
              background: "var(--bg2)",
              borderRight: "1px solid var(--border)",
              animation: "slideIn .22s ease",
            }}
          >
            <style>{`@keyframes slideIn{from{transform:translateX(-100%)}to{transform:translateX(0)}}`}</style>
            <SidebarInner isMobile />
          </div>
        </div>
      )}

      {/* ════ MAIN AREA ════ */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        {/* ── Topbar ── */}
        <header
          style={{
            background: "var(--bg2)",
            borderBottom: "1px solid var(--border)",
            padding: "0 16px 0 20px",
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            gap: 12,
          }}
        >
          {/* Left */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Hamburger – visible on mobile only */}
            <button
              onClick={() => setMobileOpen(true)}
              id="mob-hamburger"
              style={{
                background: "none",
                border: "none",
                color: "var(--text2)",
                cursor: "pointer",
                padding: 5,
                borderRadius: 7,
                display: "flex",
              }}
            >
              <style>{`@media(min-width:768px){#mob-hamburger{display:none!important}}`}</style>
              <Menu size={20} />
            </button>

            {/* Page title */}
            <div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--text)",
                  lineHeight: 1.2,
                }}
              >
                {title}
              </div>
              <div style={{ fontSize: 11, color: "var(--text3)" }}>
                {subtitle}
              </div>
            </div>
          </div>

          {/* Right actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexShrink: 0,
            }}
          >
            {/* Live badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 11px",
                background: "var(--teal-dim)",
                border: "1px solid var(--teal)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--teal)",
              }}
            >
              <div
                className="live-dot"
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "var(--teal)",
                }}
              />
              Live
            </div>

            {/* Export */}
            <button
              onClick={handleExport}
              title="Export CSV"
              style={{
                background: "var(--bg3)",
                border: "1px solid var(--border)",
                color: "var(--text2)",
                padding: "7px 13px",
                borderRadius: 8,
                fontSize: 12,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Download size={14} />
              <span id="export-label">Export</span>
              <style>{`@media(max-width:520px){#export-label{display:none}}`}</style>
            </button>

            {/* Viewer badge */}
            {!isAdmin && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 10px",
                  background: "var(--purple-dim)",
                  border: "1px solid var(--purple)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "var(--purple)",
                }}
              >
                🔒 <span id="view-label">View only</span>
                <style>{`@media(max-width:520px){#view-label{display:none}}`}</style>
              </div>
            )}

            {/* Add Transaction (admin only) */}
            {isAdmin && (
              <button
                onClick={() => setShowModal(true)}
                style={{
                  background: "var(--teal)",
                  color: "#000",
                  border: "none",
                  padding: "8px 15px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "background .15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--teal2)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "var(--teal)")
                }
              >
                <Plus size={15} />
                <span id="add-label">Add Transaction</span>
                <style>{`@media(max-width:520px){#add-label{display:none}}`}</style>
              </button>
            )}
          </div>
        </header>

        {/* ── Page content ── */}
        <main style={{ flex: 1, overflowY: "auto", padding: "22px 22px" }}>
          <Outlet context={{ showToast }} />
        </main>
      </div>

      {/* ── Modals / Toasts ── */}
      {showModal && (
        <AddModal
          onClose={() => setShowModal(false)}
          onSuccess={(msg) => showToast(msg)}
        />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}
