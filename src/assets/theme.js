// assets/theme.js  –  all design tokens and CSS-in-JS style objects

export const t = {
  // backgrounds
  bg: "var(--bg)",
  bg2: "var(--bg2)",
  bg3: "var(--bg3)",
  bg4: "var(--bg4)",
  // borders
  border: "var(--border)",
  border2: "var(--border2)",
  // text
  text: "var(--text)",
  text2: "var(--text2)",
  text3: "var(--text3)",
  // accents
  teal: "var(--teal)",
  tealDim: "var(--teal-dim)",
  orange: "var(--orange)",
  orangeDim: "var(--orange-dim)",
  purple: "var(--purple)",
  purpleDim: "var(--purple-dim)",
  blue: "var(--blue)",
  blueDim: "var(--blue-dim)",
  red: "var(--red)",
  redDim: "var(--red-dim)",
  amber: "var(--amber)",
  amberDim: "var(--amber-dim)",
  green: "var(--green)",
  greenDim: "var(--green-dim)",
};

// Inline style helpers
export const card = {
  background: "var(--bg2)",
  border: "1px solid var(--border)",
  borderRadius: 14,
};

export const cardSm = {
  background: "var(--bg3)",
  border: "1px solid var(--border)",
  borderRadius: 10,
};

export const inputStyle = {
  background: "var(--bg3)",
  border: "1px solid var(--border)",
  color: "var(--text)",
  borderRadius: 8,
  padding: "8px 12px",
  fontSize: 13,
  width: "100%",
  outline: "none",
};

export const btnPrimary = {
  background: "var(--teal)",
  color: "#000",
  border: "none",
  borderRadius: 8,
  padding: "9px 18px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 6,
};

export const btnGhost = {
  background: "var(--bg3)",
  color: "var(--text2)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: "8px 14px",
  fontSize: 13,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 6,
};

// chart tooltip shared style
export const chartTooltip = {
  backgroundColor: "#1e2535",
  borderColor: "#2a3350",
  borderWidth: 1,
  titleColor: "#e8eaf0",
  bodyColor: "#8b95b0",
  padding: 10,
};

// recharts axis tick props
export const axisTick = { fill: "#5a6380", fontSize: 11 };
export const gridStyle = { stroke: "rgba(255,255,255,0.04)" };
