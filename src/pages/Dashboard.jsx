import React, { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
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
import StatCard from "../components/StatCard";

const TREND_MONTHS = { "3M": 3, "6M": 6 };

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

export default function Dashboard() {
  const { transactions } = useStore();
  const [trendKey, setTrendKey] = useState("3M");

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
  const allStats = useMemo(() => getStats(transactions), [transactions]);

  const expChg =
    prevStats.expense > 0
      ? Math.round(
          ((curStats.expense - prevStats.expense) / prevStats.expense) * 100,
        )
      : 0;
  const incChg =
    prevStats.income > 0
      ? Math.round(
          ((curStats.income - prevStats.income) / prevStats.income) * 100,
        )
      : 0;

  const trendData = useMemo(() => {
    const n = TREND_MONTHS[trendKey];
    return Array.from({ length: n }, (_, i) => {
      const ago = n - 1 - i;
      const s = getStats(getMonthTxs(transactions, ago));
      return {
        label: getMonthLabel(ago),
        income: s.income,
        expense: s.expense,
      };
    });
  }, [transactions, trendKey]);

  const donutData = useMemo(
    () =>
      getCategoryTotals(transactions, "expense")
        .slice(0, 6)
        .map(([name, value]) => ({ name, value: Math.round(value) })),
    [transactions],
  );

  const recent = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5),
    [transactions],
  );

  return (
    <div>
      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <StatCard
          icon="⊞"
          color="teal"
          label="Total Balance"
          value={fmt(allStats.balance)}
          badge={`+${allStats.savingsRate}% savings rate`}
          badgeType="pos"
          barPct={allStats.savingsRate}
        />
        <StatCard
          icon="↑"
          color="blue"
          label="Total Income"
          value={fmt(curStats.income)}
          badge={`${incChg >= 0 ? "+" : ""}${incChg}% vs last month`}
          badgeType={incChg >= 0 ? "pos" : "neg"}
          barPct={80}
        />
        <StatCard
          icon="↓"
          color="orange"
          label="Total Expenses"
          value={fmt(curStats.expense)}
          badge={`${expChg >= 0 ? "+" : ""}${expChg}% vs last month`}
          badgeType={expChg <= 0 ? "pos" : "neg"}
          barPct={35}
        />
        <StatCard
          icon="≡"
          color="purple"
          label="Transactions"
          value={allStats.count}
          badge={`${allStats.incomeCount} income · ${allStats.expenseCount} exp`}
          badgeType="neu"
          barPct={50}
        />
      </div>

      {/* Charts row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 14,
          marginBottom: 20,
        }}
      >
        {/* Trend */}
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
              marginBottom: 16,
            }}
          >
            <div>
              <div
                style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}
              >
                Balance Trend
              </div>
              <div
                style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}
              >
                Monthly income vs expenses
              </div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {Object.keys(TREND_MONTHS).map((k) => (
                <button
                  key={k}
                  onClick={() => setTrendKey(k)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 11,
                    cursor: "pointer",
                    border: trendKey === k ? "none" : "1px solid var(--border)",
                    background:
                      trendKey === k ? "var(--teal-dim)" : "var(--bg3)",
                    color: trendKey === k ? "var(--teal)" : "var(--text2)",
                  }}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trendData}
                margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="gInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff7043" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ff7043" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                <Area
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="#00d4aa"
                  fill="url(#gInc)"
                  strokeWidth={2}
                  dot={{ fill: "#00d4aa", r: 3 }}
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  name="Expense"
                  stroke="#ff7043"
                  fill="url(#gExp)"
                  strokeWidth={2}
                  dot={{ fill: "#ff7043", r: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", gap: 18, marginTop: 10 }}>
            {[
              ["#00d4aa", "Income"],
              ["#ff7043", "Expenses"],
            ].map(([c, l]) => (
              <div
                key={l}
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
                    background: c,
                  }}
                />
                {l}
              </div>
            ))}
          </div>
        </div>

        {/* Donut */}
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
            Spending
          </div>
          <div
            style={{ fontSize: 11, color: "var(--text3)", marginBottom: 12 }}
          >
            By category
          </div>
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {donutData.map((e) => (
                    <Cell
                      key={e.name}
                      fill={CAT_COLORS[e.name] || "#78909c"}
                      strokeWidth={0}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => ["$" + v.toLocaleString(), "Amount"]}
                  contentStyle={{
                    background: "var(--bg3)",
                    border: "1px solid var(--border2)",
                    borderRadius: 8,
                  }}
                  itemStyle={{ color: "var(--text)", fontSize: 12 }}
                  labelStyle={{ color: "var(--text3)", fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 5,
              marginTop: 6,
            }}
          >
            {donutData.slice(0, 4).map((d) => (
              <div
                key={d.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: "var(--text2)",
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: CAT_COLORS[d.name] || "#78909c",
                    }}
                  />
                  {d.name}
                </div>
                <span style={{ color: "var(--text)", fontWeight: 500 }}>
                  ${d.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent transactions */}
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
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
            Recent Transactions
          </div>
          <a
            href="/transactions"
            style={{
              fontSize: 12,
              color: "var(--teal)",
              textDecoration: "none",
            }}
          >
            View all →
          </a>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}
          >
            <thead>
              <tr>
                {["Date", "Description", "Category", "Type", "Amount"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        fontSize: 10,
                        color: "var(--text3)",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        padding: "6px 10px",
                        borderBottom: "1px solid var(--border)",
                        textAlign: h === "Amount" ? "right" : "left",
                        fontWeight: 400,
                      }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {recent.map((t) => {
                const c = CAT_COLORS[t.category] || "#78909c";
                return (
                  <tr
                    key={t.id}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--bg3)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td
                      style={{
                        padding: "10px 10px",
                        fontSize: 12,
                        color: "var(--text3)",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      {t.date}
                    </td>
                    <td
                      style={{
                        padding: "10px 10px",
                        fontSize: 13,
                        color: "var(--text)",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      {t.desc}
                    </td>
                    <td
                      style={{
                        padding: "10px 10px",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "3px 9px",
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 500,
                          background: c + "22",
                          color: c,
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: c,
                          }}
                        />
                        {t.category}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "10px 10px",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 500,
                          background:
                            t.type === "income"
                              ? "var(--teal-dim)"
                              : "var(--orange-dim)",
                          color:
                            t.type === "income"
                              ? "var(--teal)"
                              : "var(--orange)",
                        }}
                      >
                        {t.type === "income" ? "↑ Income" : "↓ Expense"}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "10px 10px",
                        fontSize: 13,
                        fontWeight: 600,
                        textAlign: "right",
                        borderBottom: "1px solid var(--border)",
                        color:
                          t.type === "income" ? "var(--teal)" : "var(--orange)",
                      }}
                    >
                      {t.type === "income" ? "+" : "-"}
                      {fmt(t.amount)}
                    </td>
                  </tr>
                );
              })}
              {recent.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      textAlign: "center",
                      padding: 32,
                      color: "var(--text3)",
                      fontSize: 13,
                    }}
                  >
                    No transactions yet. Add your first one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
