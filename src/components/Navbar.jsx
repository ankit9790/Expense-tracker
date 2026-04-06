import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, User, Settings, LogOut } from "lucide-react";
import { navbarStyles } from "../assets/dummyStyles";

const Navbar = ({ user = {}, onToggleSidebar }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const displayName = user?.name || "User";
  const displayEmail = user?.email || "";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className={navbarStyles.header}>
      <div className={navbarStyles.container}>
        {/* Logo */}
        <div
          className={navbarStyles.logoContainer}
          onClick={() => navigate("/")}
        >
          <span className={navbarStyles.logoText}>💰 FinanceApp</span>
        </div>

        {/* User menu */}
        <div className={navbarStyles.userContainer} ref={menuRef}>
          <button
            className={navbarStyles.userButton}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <div className="relative">
              <div className={navbarStyles.userAvatar}>{initials}</div>
              <div className={navbarStyles.statusIndicator} />
            </div>
            <div className={navbarStyles.userTextContainer}>
              <p className={navbarStyles.userName}>{displayName}</p>
              <p className={navbarStyles.userEmail}>{displayEmail}</p>
            </div>
            <ChevronDown className={navbarStyles.chevronIcon(menuOpen)} />
          </button>

          {menuOpen && (
            <div className={navbarStyles.dropdownMenu}>
              {/* Header */}
              <div className={navbarStyles.dropdownHeader}>
                <div className="flex items-center gap-3">
                  <div className={navbarStyles.dropdownAvatar}>{initials}</div>
                  <div>
                    <p className={navbarStyles.dropdownName}>{displayName}</p>
                    <p className={navbarStyles.dropdownEmail}>{displayEmail}</p>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className={navbarStyles.menuItemContainer}>
                <button
                  className={navbarStyles.menuItem}
                  onClick={() => {
                    navigate("/profile");
                    setMenuOpen(false);
                  }}
                >
                  <User size={16} /> Profile
                </button>
              </div>

              <div className={navbarStyles.menuItemBorder}>
                <button
                  className={navbarStyles.logoutButton}
                  onClick={() => {
                    setMenuOpen(false);
                    // No real logout – just show a message
                    alert(
                      "You are logged in as a demo user. No logout in demo mode.",
                    );
                  }}
                >
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
