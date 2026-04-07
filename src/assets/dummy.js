// assets/dummy.js  –  seed data for localStorage

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export function getMockTransactions() {
  const rd = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split("T")[0];
  };

  // previous month helper
  const prevMonth = (day) => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    d.setDate(day);
    return d.toISOString().split("T")[0];
  };

  const twoMonthsAgo = (day) => {
    const d = new Date();
    d.setMonth(d.getMonth() - 2);
    d.setDate(day);
    return d.toISOString().split("T")[0];
  };

  return [
    // ── This month ──────────────────────────────────────────────
    {
      id: uid(),
      type: "income",
      desc: "Monthly salary",
      amount: 5000,
      category: "Salary",
      date: rd(1),
    },
    {
      id: uid(),
      type: "income",
      desc: "Freelance project",
      amount: 1200,
      category: "Freelance",
      date: rd(5),
    },
    {
      id: uid(),
      type: "income",
      desc: "Dividend payout",
      amount: 350,
      category: "Investment",
      date: rd(8),
    },
    {
      id: uid(),
      type: "income",
      desc: "Performance bonus",
      amount: 500,
      category: "Bonus",
      date: rd(12),
    },
    {
      id: uid(),
      type: "expense",
      desc: "Monthly rent",
      amount: 1200,
      category: "Housing",
      date: rd(2),
    },
    {
      id: uid(),
      type: "expense",
      desc: "Grocery shopping",
      amount: 180,
      category: "Food & Dining",
      date: rd(3),
    },
    {
      id: uid(),
      type: "expense",
      desc: "Electricity bill",
      amount: 95,
      category: "Utilities",
      date: rd(4),
    },
    {
      id: uid(),
      type: "expense",
      desc: "Netflix & Spotify",
      amount: 25,
      category: "Entertainment",
      date: rd(6),
    },
    {
      id: uid(),
      type: "expense",
      desc: "Gym membership",
      amount: 50,
      category: "Healthcare",
      date: rd(7),
    },
    {
      id: uid(),
      type: "expense",
      desc: "Amazon purchases",
      amount: 220,
      category: "Shopping",
      date: rd(9),
    },
    {
      id: uid(),
      type: "expense",
      desc: "Uber rides",
      amount: 65,
      category: "Transport",
      date: rd(10),
    },
    {
      id: uid(),
      type: "expense",
      desc: "Restaurant dinner",
      amount: 85,
      category: "Food & Dining",
      date: rd(11),
    },
    {
      id: uid(),
      type: "expense",
      desc: "Phone bill",
      amount: 60,
      category: "Utilities",
      date: rd(14),
    },
    {
      id: uid(),
      type: "expense",
      desc: "New clothes",
      amount: 150,
      category: "Shopping",
      date: rd(15),
    },
    // ── Previous month ──────────────────────────────────────────
    {
      id: uid(),
      type: "income",
      desc: "Monthly salary",
      amount: 5000,
      category: "Salary",
      date: prevMonth(1),
    },
    {
      id: uid(),
      type: "income",
      desc: "Consulting fee",
      amount: 800,
      category: "Freelance",
      date: prevMonth(8),
    },
    {
      id: uid(),
      type: "income",
      desc: "Stock dividends",
      amount: 420,
      category: "Investment",
      date: prevMonth(15),
    },
    {
      id: uid(),
      type: "expense",
      desc: "Monthly rent",
      amount: 1200,
      category: "Housing",
      date: prevMonth(2),
    },
    {
      id: uid(),
      type: "expense",
      desc: "Groceries",
      amount: 210,
      category: "Food & Dining",
      date: prevMonth(5),
    },
    {
      id: uid(),
      type: "expense",
      desc: "Gas bill",
      amount: 75,
      category: "Utilities",
      date: prevMonth(7),
    },
    {
      id: uid(),
      type: "expense",
      desc: "Concert tickets",
      amount: 120,
      category: "Entertainment",
      date: prevMonth(10),
    },
    {
      id: uid(),
      type: "expense",
      desc: "Fuel refill",
      amount: 80,
      category: "Transport",
      date: prevMonth(12),
    },
    {
      id: uid(),
      type: "expense",
      desc: "Doctor visit",
      amount: 90,
      category: "Healthcare",
      date: prevMonth(18),
    },
    {
      id: uid(),
      type: "expense",
      desc: "Online shopping",
      amount: 175,
      category: "Shopping",
      date: prevMonth(20),
    },
    // ── Two months ago ──────────────────────────────────────────
    {
      id: uid(),
      type: "income",
      desc: "Monthly salary",
      amount: 4800,
      category: "Salary",
      date: twoMonthsAgo(1),
    },
    {
      id: uid(),
      type: "income",
      desc: "Year-end bonus",
      amount: 2000,
      category: "Bonus",
      date: twoMonthsAgo(5),
    },
    {
      id: uid(),
      type: "expense",
      desc: "Monthly rent",
      amount: 1200,
      category: "Housing",
      date: twoMonthsAgo(2),
    },
    {
      id: uid(),
      type: "expense",
      desc: "Vacation shopping",
      amount: 350,
      category: "Shopping",
      date: twoMonthsAgo(8),
    },
    {
      id: uid(),
      type: "expense",
      desc: "Groceries",
      amount: 190,
      category: "Food & Dining",
      date: twoMonthsAgo(12),
    },
    {
      id: uid(),
      type: "expense",
      desc: "Internet plan",
      amount: 55,
      category: "Utilities",
      date: twoMonthsAgo(15),
    },
    {
      id: uid(),
      type: "expense",
      desc: "Pharmacy",
      amount: 45,
      category: "Healthcare",
      date: twoMonthsAgo(20),
    },
  ].sort((a, b) => new Date(b.date) - new Date(a.date));
}

export const CAT_COLORS = {
  Salary: "#00d4aa",
  Freelance: "#4a9ff5",
  Investment: "#7c6fe0",
  Bonus: "#ffb300",
  "Food & Dining": "#ff7043",
  Housing: "#ef5350",
  Transport: "#26a69a",
  Shopping: "#ff4081",
  Entertainment: "#ab47bc",
  Utilities: "#42a5f5",
  Healthcare: "#66bb6a",
  Other: "#78909c",
};

export const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Investment",
  "Bonus",
  "Other",
];
export const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Housing",
  "Transport",
  "Shopping",
  "Entertainment",
  "Utilities",
  "Healthcare",
  "Other",
];
export const ALL_CATEGORIES = [
  ...new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES]),
];
