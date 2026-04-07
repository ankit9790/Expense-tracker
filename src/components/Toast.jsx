import React from "react";

export default function Toast({ msg, type = "success" }) {
  const colors = {
    success: {
      bg: "var(--teal-dim)",
      border: "var(--teal)",
      color: "var(--teal)",
    },
    error: { bg: "var(--red-dim)", border: "var(--red)", color: "var(--red)" },
    info: {
      bg: "var(--blue-dim)",
      border: "var(--blue)",
      color: "var(--blue)",
    },
  };
  const c = colors[type] || colors.success;
  return (
    <div
      className="toast-enter"
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 100,
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.color,
        padding: "11px 18px",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 500,
        maxWidth: 320,
      }}
    >
      {msg}
    </div>
  );
}
