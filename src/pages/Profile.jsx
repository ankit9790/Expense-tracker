import React, { useState, useCallback, memo } from "react";
import { useOutletContext } from "react-router-dom";
import {
  User,
  Mail,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  Edit2,
  X,
} from "lucide-react";
import { profileStyles } from "../assets/dummyStyles";

// ── Password input (memoised) ──────────────────────────────────────
const PasswordInput = memo(
  ({ name, label, value, error, showField, onToggle, onChange, disabled }) => (
    <div>
      <label className={profileStyles.passwordLabel}>{label}</label>
      <div className={profileStyles.passwordContainer}>
        <input
          type={showField ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          className={`${profileStyles.inputWithError} ${error ? "border-red-300" : "border-gray-200"}`}
          placeholder={`Enter ${label.toLowerCase()}`}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={onToggle}
          className={profileStyles.passwordToggle}
          disabled={disabled}
        >
          {showField ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>
      {error && <p className={profileStyles.errorText}>{error}</p>}
    </div>
  ),
);
PasswordInput.displayName = "PasswordInput";

// ─────────────────────────────────────────────────────────────────
const ProfilePage = () => {
  const { user, setUser, allTransactions = [] } = useOutletContext();

  const [editMode, setEditMode] = useState(false);
  const [tempUser, setTempUser] = useState({ ...user });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Stats
  const totalIncome = allTransactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = allTransactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);
  const totalTx = allTransactions.length;

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setTempUser((p) => ({ ...p, [name]: value }));
  }, []);

  const handleSaveProfile = () => {
    if (!tempUser.name?.trim() || !tempUser.email?.trim()) {
      alert("Name and email are required.");
      return;
    }
    setUser(tempUser);
    setEditMode(false);
    setSaveMsg("Profile updated!");
    setTimeout(() => setSaveMsg(""), 3000);
  };

  const handlePasswordChange = useCallback((e) => {
    const { name, value } = e.target;
    setPasswordData((p) => ({ ...p, [name]: value }));
    setPasswordErrors((p) => ({ ...p, [name]: "" }));
  }, []);

  const togglePasswordVisibility = useCallback((field) => {
    setShowPassword((p) => ({ ...p, [field]: !p[field] }));
  }, []);

  const validatePassword = () => {
    const errors = {};
    if (!passwordData.current) errors.current = "Current password is required";
    if (!passwordData.new) errors.new = "New password is required";
    else if (passwordData.new.length < 8)
      errors.new = "Password must be at least 8 characters";
    if (passwordData.new !== passwordData.confirm)
      errors.confirm = "Passwords do not match";
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!validatePassword()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowPasswordModal(false);
      setPasswordData({ current: "", new: "", confirm: "" });
      setSaveMsg("Password updated!");
      setTimeout(() => setSaveMsg(""), 3000);
    }, 800);
  };

  const initials = (user?.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={profileStyles.container}>
      <div className={profileStyles.mainContainer}>
        {/* Header */}
        <div className={profileStyles.header}>
          <div className={profileStyles.avatar}>
            <span className="text-3xl font-bold text-white">{initials}</span>
          </div>
          <h2 className={profileStyles.userName}>{user?.name}</h2>
          <p className={profileStyles.userEmail}>{user?.email}</p>
        </div>

        {/* Content */}
        <div className="p-8">
          {saveMsg && (
            <div className="mb-4 p-3 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium">
              ✓ {saveMsg}
            </div>
          )}

          <div className={profileStyles.grid}>
            {/* Personal info */}
            <div className={profileStyles.card}>
              <h3 className={profileStyles.cardTitle}>
                <User className={profileStyles.icon} /> Personal Information
              </h3>

              {editMode ? (
                <div className="space-y-4">
                  <div>
                    <label className={profileStyles.label}>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={tempUser.name || ""}
                      onChange={handleInputChange}
                      className={profileStyles.input}
                    />
                  </div>
                  <div>
                    <label className={profileStyles.label}>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={tempUser.email || ""}
                      onChange={handleInputChange}
                      className={profileStyles.input}
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSaveProfile}
                      className={profileStyles.buttonPrimary}
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setTempUser({ ...user });
                        setEditMode(false);
                      }}
                      className={profileStyles.buttonSecondary}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className={profileStyles.label}>Full Name</p>
                      <p className="font-medium text-gray-800">{user?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className={profileStyles.label}>Email</p>
                      <p className="font-medium text-gray-800">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className={profileStyles.label}>Member Since</p>
                      <p className="font-medium text-gray-800">
                        {user?.joinDate
                          ? new Date(user.joinDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )
                          : "—"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setTempUser({ ...user });
                      setEditMode(true);
                    }}
                    className={profileStyles.editButton}
                  >
                    <Edit2 className="w-4 h-4 inline mr-1" /> Edit Profile
                  </button>
                </div>
              )}
            </div>

            {/* Security & Stats */}
            <div className="space-y-6">
              {/* Security */}
              <div className={profileStyles.card}>
                <h3 className={profileStyles.cardTitle}>
                  <Lock className={profileStyles.icon} /> Security
                </h3>
                <div className={profileStyles.securityItem}>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">
                      Password
                    </p>
                    <p className={profileStyles.securityText}>••••••••</p>
                  </div>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className={profileStyles.changeButton}
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* Financial summary */}
              <div className={profileStyles.card}>
                <h3 className={profileStyles.cardTitle}>
                  <span className="w-5 h-5 mr-2 text-teal-600">📊</span>{" "}
                  Financial Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Total Transactions
                    </span>
                    <span className="font-semibold text-gray-800">
                      {totalTx}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Income</span>
                    <span className="font-semibold text-green-600">
                      ${totalIncome.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Total Expenses
                    </span>
                    <span className="font-semibold text-orange-600">
                      ${totalExpense.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm text-gray-600">Net Savings</span>
                    <span
                      className={`font-bold ${totalIncome - totalExpense >= 0 ? "text-teal-600" : "text-red-500"}`}
                    >
                      ${(totalIncome - totalExpense).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Change Password Modal ── */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={profileStyles.modalContent}>
            <div className={profileStyles.modalHeader}>
              <h3 className={profileStyles.modalTitle}>Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-500 hover:text-gray-800"
                disabled={loading}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <PasswordInput
                name="current"
                label="Current Password"
                value={passwordData.current}
                error={passwordErrors.current}
                showField={showPassword.current}
                onToggle={() => togglePasswordVisibility("current")}
                onChange={handlePasswordChange}
                disabled={loading}
              />
              <PasswordInput
                name="new"
                label="New Password"
                value={passwordData.new}
                error={passwordErrors.new}
                showField={showPassword.new}
                onToggle={() => togglePasswordVisibility("new")}
                onChange={handlePasswordChange}
                disabled={loading}
              />
              <PasswordInput
                name="confirm"
                label="Confirm New Password"
                value={passwordData.confirm}
                error={passwordErrors.confirm}
                showField={showPassword.confirm}
                onToggle={() => togglePasswordVisibility("confirm")}
                onChange={handlePasswordChange}
                disabled={loading}
              />
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className={profileStyles.buttonPrimary}
                  disabled={loading}
                >
                  {loading ? "Updating…" : "Update Password"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className={profileStyles.buttonSecondary}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
