import React, { useState, useCallback, memo } from "react";
import { useStore } from "../store/useStore";
import { getStats } from "../utils/helpers";
import {
  Eye,
  EyeOff,
  Edit2,
  Lock,
  User,
  Mail,
  Calendar,
  X,
} from "lucide-react";

const MOCK_USER = {
  name: "Dev",
  email: "dev@financepro.app",
  joinDate: "2024-01-15",
};
const USER_KEY = "financepro_user";

function loadUser() {
  try {
    const r = localStorage.getItem(USER_KEY);
    if (r) return JSON.parse(r);
  } catch (_) {}
  return MOCK_USER;
}

const PasswordField = memo(
  ({ name, label, value, error, show, onToggle, onChange, disabled }) => (
    <div style={{ marginBottom: 14 }}>
      <label
        style={{
          fontSize: 12,
          color: "var(--text2)",
          display: "block",
          marginBottom: 5,
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={`Enter ${label.toLowerCase()}`}
          style={{
            width: "100%",
            background: "var(--bg3)",
            border: `1px solid ${error ? "var(--red)" : "var(--border)"}`,
            color: "var(--text)",
            padding: "9px 36px 9px 12px",
            borderRadius: 8,
            fontSize: 13,
            outline: "none",
          }}
        />
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            color: "var(--text3)",
            cursor: "pointer",
            display: "flex",
            padding: 0,
          }}
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {error && (
        <p style={{ fontSize: 11, color: "var(--red)", marginTop: 4 }}>
          {error}
        </p>
      )}
    </div>
  ),
);
PasswordField.displayName = "PasswordField";

export default function Profile() {
  const { transactions, role, setRole } = useStore();
  const [user, setUserState] = useState(loadUser);
  const [editMode, setEditMode] = useState(false);
  const [tempUser, setTempUser] = useState({ ...user });
  const [showPwModal, setShowPwModal] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [pwData, setPwData] = useState({ current: "", new: "", confirm: "" });
  const [showPw, setShowPw] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [pwErrors, setPwErrors] = useState({});

  const stats = getStats(transactions);

  const saveUser = (u) => {
    setUserState(u);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
  };

  const handleSaveProfile = () => {
    if (!tempUser.name?.trim() || !tempUser.email?.trim()) {
      setSaveMsg("error:Name and email are required.");
      return;
    }
    saveUser(tempUser);
    setEditMode(false);
    setSaveMsg("success:Profile updated successfully!");
    setTimeout(() => setSaveMsg(""), 3000);
  };

  const handlePwChange = useCallback((e) => {
    const { name, value } = e.target;
    setPwData((p) => ({ ...p, [name]: value }));
    setPwErrors((p) => ({ ...p, [name]: "" }));
  }, []);

  const validatePw = () => {
    const err = {};
    if (!pwData.current) err.current = "Current password is required";
    if (!pwData.new) err.new = "New password is required";
    else if (pwData.new.length < 8) err.new = "Minimum 8 characters";
    if (pwData.new !== pwData.confirm) err.confirm = "Passwords do not match";
    setPwErrors(err);
    return Object.keys(err).length === 0;
  };

  const handlePwSubmit = (e) => {
    e.preventDefault();
    if (!validatePw()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowPwModal(false);
      setPwData({ current: "", new: "", confirm: "" });
      setSaveMsg("success:Password updated successfully!");
      setTimeout(() => setSaveMsg(""), 3000);
    }, 700);
  };

  const initials = (user.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const [msgType, msgText] = saveMsg.includes(":")
    ? saveMsg.split(":")
    : ["", saveMsg];

  const inpSt = {
    width: "100%",
    background: "var(--bg3)",
    border: "1px solid var(--border)",
    color: "var(--text)",
    padding: "9px 12px",
    borderRadius: 8,
    fontSize: 13,
    outline: "none",
  };
  const labelSt = {
    fontSize: 12,
    color: "var(--text2)",
    display: "block",
    marginBottom: 5,
  };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      {/* Header card */}
      <div
        style={{
          background:
            "linear-gradient(135deg, var(--teal-dim), var(--purple-dim))",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: 32,
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "rgba(0,212,170,0.2)",
            border: "2px solid var(--teal)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 14px",
            fontSize: 26,
            fontWeight: 700,
            color: "var(--teal)",
          }}
        >
          {initials}
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)" }}>
          {user.name}
        </div>
        <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 4 }}>
          {user.email}
        </div>
      </div>

      {/* Save message */}
      {saveMsg && (
        <div
          style={{
            marginBottom: 16,
            padding: "10px 16px",
            borderRadius: 9,
            fontSize: 13,
            fontWeight: 500,
            background:
              msgType === "success" ? "var(--teal-dim)" : "var(--red-dim)",
            border: `1px solid ${msgType === "success" ? "var(--teal)" : "var(--red)"}`,
            color: msgType === "success" ? "var(--teal)" : "var(--red)",
          }}
        >
          {msgText}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Personal info */}
        <div
          style={{
            background: "var(--bg2)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 14,
                fontWeight: 700,
                color: "var(--text)",
              }}
            >
              <User size={16} style={{ color: "var(--teal)" }} /> Personal
              Information
            </div>
            {!editMode && (
              <button
                onClick={() => {
                  setTempUser({ ...user });
                  setEditMode(true);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--teal)",
                  cursor: "pointer",
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Edit2 size={13} /> Edit
              </button>
            )}
          </div>

          {editMode ? (
            <div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelSt}>Full Name</label>
                <input
                  value={tempUser.name || ""}
                  onChange={(e) =>
                    setTempUser((p) => ({ ...p, name: e.target.value }))
                  }
                  style={inpSt}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelSt}>Email Address</label>
                <input
                  type="email"
                  value={tempUser.email || ""}
                  onChange={(e) =>
                    setTempUser((p) => ({ ...p, email: e.target.value }))
                  }
                  style={inpSt}
                />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button
                  onClick={handleSaveProfile}
                  style={{
                    flex: 1,
                    padding: "9px 0",
                    background: "var(--teal)",
                    border: "none",
                    color: "#000",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  style={{
                    flex: 1,
                    padding: "9px 0",
                    background: "var(--bg3)",
                    border: "1px solid var(--border)",
                    color: "var(--text2)",
                    borderRadius: 8,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                [<User size={14} />, "Full Name", user.name],
                [<Mail size={14} />, "Email", user.email],
                [
                  <Calendar size={14} />,
                  "Member Since",
                  user.joinDate
                    ? new Date(user.joinDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "—",
                ],
              ].map(([icon, label, val]) => (
                <div
                  key={label}
                  style={{ display: "flex", alignItems: "flex-start", gap: 10 }}
                >
                  <div style={{ color: "var(--text3)", marginTop: 2 }}>
                    {icon}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text3)",
                        marginBottom: 2,
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--text)",
                        fontWeight: 500,
                      }}
                    >
                      {val}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Security */}
          <div
            style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 14,
                fontWeight: 700,
                color: "var(--text)",
                marginBottom: 16,
              }}
            >
              <Lock size={16} style={{ color: "var(--teal)" }} /> Security
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 14px",
                background: "var(--bg3)",
                borderRadius: 9,
                border: "1px solid var(--border)",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--text)",
                  }}
                >
                  Password
                </div>
                <div
                  style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}
                >
                  ••••••••
                </div>
              </div>
              <button
                onClick={() => setShowPwModal(true)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--teal)",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                Change
              </button>
            </div>
          </div>

          {/* Role */}
          <div
            style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: 20,
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "var(--text)",
                marginBottom: 14,
              }}
            >
              Current Role
            </div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: "100%",
                background: "var(--bg3)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                padding: "9px 12px",
                borderRadius: 8,
                fontSize: 13,
                cursor: "pointer",
                marginBottom: 10,
              }}
            >
              <option value="admin">Admin – Can add, edit, delete</option>
              <option value="viewer">Viewer – Read only</option>
            </select>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 12px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 600,
                background:
                  role === "admin" ? "var(--teal-dim)" : "var(--purple-dim)",
                color: role === "admin" ? "var(--teal)" : "var(--purple)",
              }}
            >
              ● {role.toUpperCase()}
            </div>
          </div>

          {/* Financial summary */}
          <div
            style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: 20,
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "var(--text)",
                marginBottom: 14,
              }}
            >
              📊 Financial Summary
            </div>
            {[
              ["Total Transactions", stats.count, "var(--text)"],
              [
                "Total Income",
                "$" + stats.income.toLocaleString(),
                "var(--teal)",
              ],
              [
                "Total Expenses",
                "$" + stats.expense.toLocaleString(),
                "var(--orange)",
              ],
              [
                "Net Savings",
                "$" + (stats.income - stats.expense).toLocaleString(),
                stats.income - stats.expense >= 0
                  ? "var(--teal)"
                  : "var(--red)",
              ],
            ].map(([label, val, color], i) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: i < 3 ? "1px solid var(--border)" : "none",
                }}
              >
                <span style={{ fontSize: 13, color: "var(--text2)" }}>
                  {label}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color }}>
                  {val}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Change password modal */}
      {showPwModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 16,
          }}
        >
          <div
            style={{
              background: "var(--bg2)",
              border: "1px solid var(--border2)",
              borderRadius: 16,
              padding: 24,
              width: "100%",
              maxWidth: 400,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <h3
                style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}
              >
                Change Password
              </h3>
              <button
                onClick={() => setShowPwModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text2)",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handlePwSubmit}>
              {[
                ["current", "Current Password"],
                ["new", "New Password"],
                ["confirm", "Confirm New Password"],
              ].map(([name, label]) => (
                <PasswordField
                  key={name}
                  name={name}
                  label={label}
                  value={pwData[name]}
                  error={pwErrors[name]}
                  show={showPw[name]}
                  disabled={loading}
                  onToggle={() =>
                    setShowPw((p) => ({ ...p, [name]: !p[name] }))
                  }
                  onChange={handlePwChange}
                />
              ))}
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowPwModal(false)}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    background: "var(--bg3)",
                    border: "1px solid var(--border)",
                    color: "var(--text2)",
                    borderRadius: 8,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    background: "var(--teal)",
                    border: "none",
                    color: "#000",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {loading ? "Updating…" : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
