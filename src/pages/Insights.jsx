import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useStore } from "../store/useStore";
import {
  getStats,
  getMonthTxs,
  getCategoryTotals,
  fmt,
  getMonthLabel,
} from "../utils/helpers";
import { CAT_COLORS } from "../assets/dummy";

const InsightCard = ({ icon, iconBg, label, value, desc }) => (
  <div
    style={{
      background: "var(--bg2)",
      border: "1px solid var(--border)",
      borderRadius: 14,
      padding: 18,
    }}
  >
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        background: iconBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
        marginBottom: 12,
      }}
    >
      {icon}
    </div>
    <div
      style={{
        fontSize: 10,
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
        fontSize: 22,
        fontWeight: 700,
        color: "var(--text)",
        marginBottom: 6,
      }}
    >
      {value}
    </div>
    <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.5 }}>
      {desc}
    </div>
  </div>
);

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--bg3)",
        border: "1px solid var(--border2)",
        borderRadius: 8,
        padding: "10px 14px",
      }}
    >
      <p style={{ fontSize: 11, color: "var(--text3)", marginBottom: 5 }}>
        {label}
      </p>
      {payload.map((p) => (
        <p
          key={p.name}
          style={{ fontSize: 13, fontWeight: 600, color: p.color }}
        >
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function Insights() {
  const { transactions } = useStore();

  const curMonthTxs = useMemo(
    () => getMonthTxs(transactions, 0),
    [transactions],
  );
  const prevMonthTxs = useMemo(
    () => getMonthTxs(transactions, 1),
    [transactions],
  );
  const curStats = useMemo(() => getStats(curMonthTxs), [curMonthTxs]);
  const prevStats = useMemo(() => getStats(prevMonthTxs), [prevMonthTxs]);

  const curLabel = getMonthLabel(0);
  const prevLabel = getMonthLabel(1);

  // Top spending category (current month)
  const topCatEntry = useMemo(() => {
    const cats = getCategoryTotals(curMonthTxs, "expense");
    return cats[0] || null;
  }, [curMonthTxs]);

  // Most active month
  const mostActiveMonth = useMemo(() => {
    const activity = {};
    transactions.forEach((t) => {
      const key = new Date(t.date).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      activity[key] = (activity[key] || 0) + Number(t.amount);
    });
    const sorted = Object.entries(activity).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || "N/A";
  }, [transactions]);

  // Average monthly income
  const avgMonthlyIncome = useMemo(() => {
    const months = new Set(
      transactions.map((t) => {
        const d = new Date(t.date);
        return d.getFullYear() + "-" + d.getMonth();
      }),
    );
    const total = transactions
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + Number(t.amount), 0);
    return months.size > 0 ? Math.round(total / months.size) : 0;
  }, [transactions]);

  const momExpChange =
    prevStats.expense > 0
      ? Math.round(
          ((curStats.expense - prevStats.expense) / prevStats.expense) * 100,
        )
      : 0;

  // Monthly comparison chart data
  const compData = [
    {
      label: "Income",
      [prevLabel]: Math.round(prevStats.income),
      [curLabel]: Math.round(curStats.income),
    },
    {
      label: "Expense",
      [prevLabel]: Math.round(prevStats.expense),
      [curLabel]: Math.round(curStats.expense),
    },
  ];

  // Category breakdown (all time expenses)
  const catBreakdown = useMemo(() => {
    const cats = getCategoryTotals(transactions, "expense");
    const total = cats.reduce((s, [, v]) => s + v, 0);
    const max = cats[0]?.[1] || 1;
    return cats.map(([name, amt]) => ({
      name,
      amount: Math.round(amt),
      pct: total > 0 ? Math.round((amt / total) * 100) : 0,
      barPct: Math.round((amt / max) * 100),
      color: CAT_COLORS[name] || "#78909c",
    }));
  }, [transactions]);

  return (
    <div>
      {/* Insight cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <InsightCard
          icon="🛍"
          iconBg="var(--orange-dim)"
          label="Top Spending Category"
          value={topCatEntry ? topCatEntry[0] : "N/A"}
          desc={
            topCatEntry
              ? `${fmt(topCatEntry[1])} spent — your biggest expense bucket. Consider setting a budget here.`
              : "No expense data for this month yet."
          }
        />
        <InsightCard
          icon="💰"
          iconBg="var(--teal-dim)"
          label="Savings Rate"
          value={curStats.income > 0 ? curStats.savingsRate + "%" : "N/A"}
          desc={
            curStats.savingsRate > 20
              ? "Great job! You're saving above the recommended 20% threshold."
              : "Try to save at least 20% of your monthly income."
          }
        />
        <InsightCard
          icon="📈"
          iconBg={momExpChange > 0 ? "var(--red-dim)" : "var(--green-dim)"}
          label="Month-on-Month Expenses"
          value={(momExpChange >= 0 ? "+" : "") + momExpChange + "%"}
          desc={`Spending ${momExpChange > 0 ? "rose" : "fell"} vs ${prevLabel}. ${momExpChange > 50 ? "Review discretionary categories." : "Keep it up!"}`}
        />
        <InsightCard
          icon="⊕"
          iconBg="var(--blue-dim)"
          label="Net Savings This Month"
          value={fmt(curStats.balance)}
          desc={`Income ${fmt(curStats.income)} minus expenses ${fmt(curStats.expense)} for ${curLabel}.`}
        />
        <InsightCard
          icon="⚡"
          iconBg="var(--purple-dim)"
          label="Most Active Month"
          value={mostActiveMonth}
          desc="The month with the highest combined income and expense activity."
        />
        <InsightCard
          icon="◎"
          iconBg="var(--amber-dim)"
          label="Avg Monthly Income"
          value={fmt(avgMonthlyIncome)}
          desc="Average income across all recorded months in your history."
        />
      </div>

      {/* Bottom charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Monthly comparison */}
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
              marginBottom: 4,
            }}
          >
            Monthly Comparison
          </div>
          <div
            style={{ fontSize: 11, color: "var(--text3)", marginBottom: 16 }}
          >
            {prevLabel} vs {curLabel}
          </div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={compData}
                margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                barGap={4}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#5a6380", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#5a6380", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => "$" + Math.round(v / 1000) + "k"}
                  width={42}
                />
                <Tooltip content={<ChartTip />} />
                <Bar
                  dataKey={prevLabel}
                  fill="#534AB7"
                  radius={[6, 6, 0, 0]}
                  barSize={32}
                />
                <Bar
                  dataKey={curLabel}
                  fill="#7c6fe0"
                  radius={[6, 6, 0, 0]}
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
            {[
              [" #534AB7", prevLabel],
              ["#7c6fe0", curLabel],
            ].map(([color, label]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  color: "var(--text2)",
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: color,
                  }}
                />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Category breakdown */}
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
              marginBottom: 16,
            }}
          >
            Full Category Breakdown
          </div>
          {catBreakdown.length === 0 && (
            <div
              style={{
                color: "var(--text3)",
                fontSize: 13,
                textAlign: "center",
                paddingTop: 40,
              }}
            >
              No expense data yet.
            </div>
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              maxHeight: 280,
              overflowY: "auto",
            }}
          >
            {catBreakdown.map((cat, i) => (
              <div
                key={cat.name}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <div
                  style={{
                    width: 16,
                    fontSize: 11,
                    color: "var(--text3)",
                    textAlign: "right",
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </div>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: cat.color,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, fontSize: 12, color: "var(--text)" }}>
                  {cat.name}
                </div>
                <div
                  style={{
                    flex: 2,
                    background: "var(--bg3)",
                    height: 4,
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${cat.barPct}%`,
                      background: cat.color,
                      borderRadius: 4,
                      transition: "width .5s",
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "var(--text)",
                    textAlign: "right",
                    minWidth: 65,
                  }}
                >
                  ${cat.amount.toLocaleString()}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text3)",
                    minWidth: 32,
                    textAlign: "right",
                  }}
                >
                  {cat.pct}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
