// assets/dummy.js  – mock data seeded into localStorage on first load

const randomDate = (daysAgo = 60) => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - daysAgo);
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  ).toISOString();
};

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const expenseCategories = [
  "Food",
  "Housing",
  "Transport",
  "Shopping",
  "Entertainment",
  "Utilities",
  "Healthcare",
  "Other",
];
const incomeCategories = [
  "Salary",
  "Freelance",
  "Investment",
  "Bonus",
  "Other",
];

const expenseDescriptions = {
  Food: [
    "Grocery run",
    "Pizza night",
    "Coffee shop",
    "Restaurant dinner",
    "Bakery",
  ],
  Housing: [
    "Monthly rent",
    "Electricity bill",
    "Water bill",
    "Internet plan",
    "Home repair",
  ],
  Transport: [
    "Uber ride",
    "Fuel refill",
    "Bus pass",
    "Car service",
    "Parking fee",
  ],
  Shopping: [
    "New shoes",
    "Clothes haul",
    "Amazon order",
    "Electronics",
    "Books",
  ],
  Entertainment: [
    "Netflix subscription",
    "Concert ticket",
    "Movie night",
    "Game purchase",
    "Spotify",
  ],
  Utilities: [
    "Gas bill",
    "Phone bill",
    "Cloud storage",
    "Cable TV",
    "Gym membership",
  ],
  Healthcare: [
    "Doctor visit",
    "Pharmacy",
    "Health insurance",
    "Dentist",
    "Vitamins",
  ],
  Other: ["Miscellaneous", "Gift", "Donation", "Subscription", "Service fee"],
};

const incomeDescriptions = {
  Salary: ["Monthly salary", "Bi-weekly paycheck", "Base salary"],
  Freelance: [
    "Client project",
    "Consulting fee",
    "Design work",
    "Dev contract",
  ],
  Investment: [
    "Dividend payment",
    "Stock profit",
    "Crypto gain",
    "Mutual fund",
  ],
  Bonus: ["Performance bonus", "Year-end bonus", "Referral bonus"],
  Other: ["Side hustle", "Sold item", "Refund", "Cashback reward"],
};

export function getMockTransactions() {
  const transactions = [];

  // ── Salary income (monthly, current + last month) ─────────────────
  [0, 1].forEach((monthsAgo) => {
    const d = new Date();
    d.setMonth(d.getMonth() - monthsAgo);
    d.setDate(1);
    transactions.push({
      id: uid(),
      type: "income",
      amount: 4500,
      description: "Monthly salary",
      category: "Salary",
      date: d.toISOString(),
    });
  });

  // ── Freelance income ──────────────────────────────────────────────
  transactions.push(
    {
      id: uid(),
      type: "income",
      amount: 850,
      description: "Client project",
      category: "Freelance",
      date: randomDate(15),
    },
    {
      id: uid(),
      type: "income",
      amount: 1200,
      description: "Consulting fee",
      category: "Freelance",
      date: randomDate(45),
    },
    {
      id: uid(),
      type: "income",
      amount: 300,
      description: "Dividend payment",
      category: "Investment",
      date: randomDate(20),
    },
    {
      id: uid(),
      type: "income",
      amount: 500,
      description: "Performance bonus",
      category: "Bonus",
      date: randomDate(10),
    },
  );

  // ── Expenses – this month ─────────────────────────────────────────
  const expenseData = [
    { cat: "Food", amt: 120, desc: "Grocery run", days: 2 },
    { cat: "Food", amt: 45, desc: "Restaurant dinner", days: 5 },
    { cat: "Food", amt: 18, desc: "Coffee shop", days: 7 },
    { cat: "Housing", amt: 1200, desc: "Monthly rent", days: 1 },
    { cat: "Housing", amt: 95, desc: "Electricity bill", days: 8 },
    { cat: "Housing", amt: 60, desc: "Internet plan", days: 9 },
    { cat: "Transport", amt: 75, desc: "Fuel refill", days: 3 },
    { cat: "Transport", amt: 35, desc: "Uber ride", days: 6 },
    { cat: "Shopping", amt: 220, desc: "Amazon order", days: 11 },
    { cat: "Shopping", amt: 85, desc: "New shoes", days: 14 },
    { cat: "Entertainment", amt: 15, desc: "Netflix subscription", days: 5 },
    { cat: "Entertainment", amt: 45, desc: "Concert ticket", days: 12 },
    { cat: "Utilities", amt: 55, desc: "Phone bill", days: 4 },
    { cat: "Utilities", amt: 40, desc: "Gym membership", days: 1 },
    { cat: "Healthcare", amt: 80, desc: "Doctor visit", days: 10 },
    { cat: "Healthcare", amt: 35, desc: "Pharmacy", days: 15 },
  ];

  expenseData.forEach(({ cat, amt, desc, days }) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    transactions.push({
      id: uid(),
      type: "expense",
      amount: amt,
      description: desc,
      category: cat,
      date: d.toISOString(),
    });
  });

  // ── Previous month expenses ───────────────────────────────────────
  [
    { cat: "Food", amt: 340, desc: "Grocery run" },
    { cat: "Housing", amt: 1200, desc: "Monthly rent" },
    { cat: "Transport", amt: 110, desc: "Fuel refill" },
    { cat: "Shopping", amt: 175, desc: "Clothes haul" },
    { cat: "Entertainment", amt: 60, desc: "Movie night" },
    { cat: "Utilities", amt: 95, desc: "Gas bill" },
  ].forEach(({ cat, amt, desc }) => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    d.setDate(Math.floor(Math.random() * 28) + 1);
    transactions.push({
      id: uid(),
      type: "expense",
      amount: amt,
      description: desc,
      category: cat,
      date: d.toISOString(),
    });
  });

  return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// ── Gauge data ────────────────────────────────────────────────────
export const gaugeData = [
  { name: "Income", value: 4500, history: [3200, 4000, 5000, 6000, 5500] },
  { name: "Expenses", value: 3200, history: [1800, 1900, 2100, 2400, 3000] },
  { name: "Savings", value: 1800, history: [1000, 1200, 900, 1500, 1800] },
];

export const COLORS = [
  "#0d9488",
  "#0f766e",
  "#0891b2",
  "#0e7490",
  "#f97316",
  "#ea580c",
  "#14b8a6",
];
