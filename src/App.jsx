import React, { useState, useEffect, useCallback, useMemo } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import IncomePage from "./pages/Income";
import ExpensePage from "./pages/Expense";
import ProfilePage from "./pages/Profile";
import { getMockTransactions } from "./assets/dummy";

// ── localStorage helpers ──────────────────────────────────────────
const STORAGE_KEY = "finance_transactions";

function loadTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  // First load – seed with mock data
  const mock = getMockTransactions();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mock));
  return mock;
}

function saveTransactions(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (_) {}
}

// ── Mock user ─────────────────────────────────────────────────────
const MOCK_USER = {
  name: "Dev",
  email: "dev@example.com",
  joinDate: "2024-01-15",
};

// ─────────────────────────────────────────────────────────────────
export default function App() {
  const [transactions, setTransactions] = useState(loadTransactions);
  const [timeFrame, setTimeFrame] = useState("monthly");
  const [user, setUser] = useState(MOCK_USER);

  // Persist on every change
  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  // ── CRUD ─────────────────────────────────────────────────────────
  const addTransaction = useCallback((tx) => {
    const newTx = {
      ...tx,
      id: crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString(36) + Math.random().toString(36).slice(2),
      date: tx.date || new Date().toISOString(),
      amount: Number(tx.amount),
    };
    setTransactions((prev) => [newTx, ...prev]);
    return Promise.resolve(true);
  }, []);

  const editTransaction = useCallback((id, updated) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, ...updated, id, amount: Number(updated.amount) }
          : t,
      ),
    );
    return Promise.resolve(true);
  }, []);

  const deleteTransaction = useCallback((id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    return Promise.resolve(true);
  }, []);

  const refreshTransactions = useCallback(() => {
    // no-op for localStorage version; data is always current
  }, []);

  // ── Filter by time frame ──────────────────────────────────────────
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter((t) => {
      const d = new Date(t.date);
      if (timeFrame === "daily") {
        return d.toDateString() === now.toDateString();
      }
      if (timeFrame === "weekly") {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        return d >= startOfWeek;
      }
      if (timeFrame === "monthly") {
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      }
      if (timeFrame === "yearly") {
        return d.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [transactions, timeFrame]);

  const outletContext = {
    transactions: filteredTransactions,
    allTransactions: transactions,
    addTransaction,
    editTransaction,
    deleteTransaction,
    refreshTransactions,
    timeFrame,
    setTimeFrame,
    user,
    setUser,
    lastUpdated: new Date(),
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout context={outletContext} />}>
          <Route index element={<Dashboard />} />
          <Route path="income" element={<IncomePage />} />
          <Route path="expense" element={<ExpensePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
