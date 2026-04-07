import React from "react";

const ACCENT = {
  teal: { accent: "var(--teal)", dim: "var(--teal-dim)" },
  orange: { accent: "var(--orange)", dim: "var(--orange-dim)" },
  blue: { accent: "var(--blue)", dim: "var(--blue-dim)" },
  purple: { accent: "var(--purple)", dim: "var(--purple-dim)" },
};

export default function StatCard({
  icon,
  label,
  value,
  badge,
  badgeType = "pos",
  barPct = 50,
  color = "teal",
}) {
  const c = ACCENT[color] || ACCENT.teal;
  const badgeColors = {
    pos: { bg: "var(--teal-dim)", color: "var(--teal)" },
    neg: { bg: "var(--red-dim)", color: "var(--red)" },
    neu: { bg: "var(--bg4)", color: "var(--text2)" },
  };
  const bc = badgeColors[badgeType] || badgeColors.neu;

  return (
    <div
      style={{
        background: "var(--bg2)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: "18px 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* top accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: c.accent,
        }}
      />

      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: c.dim,
          color: c.accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
          fontSize: 16,
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontSize: 11,
          color: "var(--text3)",
          textTransform: "uppercase",
          letterSpacing: 0.5,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: "var(--text)",
          marginBottom: 7,
        }}
      >
        {value}
      </div>
      {badge && (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            fontSize: 11,
            fontWeight: 500,
            padding: "2px 8px",
            borderRadius: 12,
            background: bc.bg,
            color: bc.color,
          }}
        >
          {badge}
        </span>
      )}
      <div
        style={{
          height: 2,
          background: "var(--bg4)",
          borderRadius: 2,
          marginTop: 12,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.min(barPct, 100)}%`,
            background: c.accent,
            borderRadius: 2,
            transition: "width .6s",
          }}
        />
      </div>
    </div>
  );
}
