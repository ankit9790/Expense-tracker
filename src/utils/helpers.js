// utils/helpers.js

export const fmt = (n) =>
  "$" +
  Math.abs(Number(n)).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

export const fmtSigned = (n) => (n >= 0 ? "+" : "-") + fmt(n);

export const uid = () =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

export function getStats(txs) {
  const income = txs
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);
  const expense = txs
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);
  return {
    income,
    expense,
    balance: income - expense,
    count: txs.length,
    incomeCount: txs.filter((t) => t.type === "income").length,
    expenseCount: txs.filter((t) => t.type === "expense").length,
    savingsRate:
      income > 0 ? Math.round(((income - expense) / income) * 100) : 0,
  };
}

export function getMonthTxs(allTransactions, monthsAgo = 0) {
  const now = new Date();
  const year = new Date(
    now.getFullYear(),
    now.getMonth() - monthsAgo,
    1,
  ).getFullYear();
  const mon = new Date(
    now.getFullYear(),
    now.getMonth() - monthsAgo,
    1,
  ).getMonth();
  return allTransactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === mon && d.getFullYear() === year;
  });
}

export function getCategoryTotals(txs, type = "expense") {
  const cats = {};
  txs
    .filter((t) => t.type === type)
    .forEach((t) => {
      cats[t.category] = (cats[t.category] || 0) + Number(t.amount);
    });
  return Object.entries(cats).sort((a, b) => b[1] - a[1]);
}

export function exportCSV(transactions) {
  const header = "Date,Description,Category,Type,Amount";
  const rows = transactions.map(
    (t) =>
      `${t.date},"${t.desc || t.description}",${t.category},${t.type},${t.amount}`,
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function getMonthLabel(monthsAgo = 0) {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
