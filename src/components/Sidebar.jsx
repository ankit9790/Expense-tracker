import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  ArrowUp,
  ArrowDown,
  User,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { sidebarStyles, cn } from "../assets/dummyStyles";

const MENU_ITEMS = [
  { text: "Dashboard", path: "/", icon: <Home size={20} /> },
  { text: "Income", path: "/income", icon: <ArrowUp size={20} /> },
  { text: "Expenses", path: "/expense", icon: <ArrowDown size={20} /> },
  { text: "Profile", path: "/profile", icon: <User size={20} /> },
];

const Sidebar = ({ isCollapsed, setIsCollapsed, user = {} }) => {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeHover, setActiveHover] = useState(null);
  const sidebarRef = useRef(null);

  const displayName = user?.name || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobileOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        mobileOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target)
      ) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileOpen]);

  const renderMenuItem = ({ text, path, icon }) => {
    const isActive = pathname === path;
    return (
      <li key={text}>
        <Link
          to={path}
          className={cn(
            sidebarStyles.menuItem.base,
            isActive
              ? sidebarStyles.menuItem.active
              : sidebarStyles.menuItem.inactive,
            isCollapsed
              ? sidebarStyles.menuItem.collapsed
              : sidebarStyles.menuItem.expanded,
          )}
          onMouseEnter={() => setActiveHover(text)}
          onMouseLeave={() => setActiveHover(null)}
        >
          <span
            className={
              isActive
                ? sidebarStyles.menuIcon.active
                : sidebarStyles.menuIcon.inactive
            }
          >
            {icon}
          </span>
          {!isCollapsed && <span>{text}</span>}
          {activeHover === text && !isActive && !isCollapsed && (
            <span className={sidebarStyles.activeIndicator} />
          )}
        </Link>
      </li>
    );
  };

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        className={cn(
          sidebarStyles.sidebarContainer.base,
          isCollapsed ? "w-20" : "w-64",
        )}
        style={{ transition: "width 0.3s" }}
      >
        <div className={cn(sidebarStyles.sidebarInner.base, "w-full")}>
          {/* Collapse toggle */}
          <button
            className={sidebarStyles.toggleButton.base}
            onClick={() => setIsCollapsed((c) => !c)}
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            <ChevronRight
              size={14}
              style={{
                transform: isCollapsed ? "rotate(0deg)" : "rotate(180deg)",
                transition: "transform 0.3s",
              }}
            />
          </button>

          {/* User info */}
          <div
            className={cn(
              sidebarStyles.userProfileContainer.base,
              isCollapsed
                ? sidebarStyles.userProfileContainer.collapsed
                : sidebarStyles.userProfileContainer.expanded,
            )}
          >
            <div className={sidebarStyles.userInitials.base}>{initials}</div>
            {!isCollapsed && (
              <div className="mt-2">
                <p className="font-semibold text-gray-800 text-sm">
                  {displayName}
                </p>
                <p className="text-xs text-gray-500">{user?.email || ""}</p>
              </div>
            )}
          </div>

          {/* Menu */}
          <nav className="flex-1 mt-4">
            <ul className={sidebarStyles.menuList.base}>
              {MENU_ITEMS.map(renderMenuItem)}
            </ul>
          </nav>
        </div>
      </aside>

      {/* ── Mobile FAB ── */}
      <button
        className={sidebarStyles.mobileMenuButton}
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className={sidebarStyles.mobileOverlay}>
          <div
            className={sidebarStyles.mobileBackdrop}
            onClick={() => setMobileOpen(false)}
          />

          <div ref={sidebarRef} className={sidebarStyles.mobileSidebar.base}>
            <div className={sidebarStyles.mobileHeader}>
              <div className="flex items-center gap-3">
                <div className={sidebarStyles.userInitials.base}>
                  {initials}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email || ""}</p>
                </div>
              </div>
              <button
                className={sidebarStyles.mobileCloseButton}
                onClick={() => setMobileOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <ul className={sidebarStyles.mobileMenuList}>
              {MENU_ITEMS.map(({ text, path, icon }) => (
                <li key={text}>
                  <Link
                    to={path}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      sidebarStyles.mobileMenuItem.base,
                      pathname === path
                        ? sidebarStyles.mobileMenuItem.active
                        : sidebarStyles.mobileMenuItem.inactive,
                    )}
                  >
                    <span
                      className={
                        pathname === path
                          ? sidebarStyles.menuIcon.active
                          : sidebarStyles.menuIcon.inactive
                      }
                    >
                      {icon}
                    </span>
                    <span>{text}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
