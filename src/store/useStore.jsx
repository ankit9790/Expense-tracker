import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { getMockTransactions } from "../assets/dummy";

const STORAGE_KEY = "financepro_v1";
const ROLE_KEY = "financepro_role";

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  const seed = getMockTransactions();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
}

const StoreCtx = createContext(null);

export function StoreProvider({ children }) {
  const [transactions, setTransactions] = useState(load);
  const [role, setRole] = useState(
    () => localStorage.getItem(ROLE_KEY) || "admin",
  );
  const [timeFrame, setTimeFrame] = useState("monthly");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(ROLE_KEY, role);
  }, [role]);

  const addTransaction = useCallback((tx) => {
    const newTx = {
      ...tx,
      id: uid(),
      amount: Number(tx.amount),
      date: tx.date || new Date().toISOString().split("T")[0],
    };
    setTransactions((p) => [newTx, ...p]);
    return newTx;
  }, []);

  const editTransaction = useCallback((id, updates) => {
    setTransactions((p) =>
      p.map((t) =>
        t.id === id
          ? { ...t, ...updates, id, amount: Number(updates.amount) }
          : t,
      ),
    );
  }, []);

  const deleteTransaction = useCallback((id) => {
    setTransactions((p) => p.filter((t) => t.id !== id));
  }, []);

  const isAdmin = role === "admin";

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter((t) => {
      const d = new Date(t.date);
      if (timeFrame === "daily") {
        return d.toDateString() === now.toDateString();
      }
      if (timeFrame === "weekly") {
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        start.setHours(0, 0, 0, 0);
        return d >= start;
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

  return (
    <StoreCtx.Provider
      value={{
        transactions,
        filteredTransactions,
        addTransaction,
        editTransaction,
        deleteTransaction,
        role,
        setRole,
        isAdmin,
        timeFrame,
        setTimeFrame,
      }}
    >
      {children}
    </StoreCtx.Provider>
  );
}

export const useStore = () => useContext(StoreCtx);
