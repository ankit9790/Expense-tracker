import React, { useState } from "react";
import { X } from "lucide-react";
import { useStore } from "../store/useStore";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "../assets/dummy";

export default function AddModal({ onClose, onSuccess }) {
  const { addTransaction } = useStore();
  const [type, setType] = useState("income");
  const [form, setForm] = useState({
    desc: "",
    amount: "",
    category: "Salary",
    date: new Date().toISOString().split("T")[0],
  });
  const [err, setErr] = useState("");

  const cats = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.desc.trim()) {
      setErr("Description is required");
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      setErr("Enter a valid amount");
      return;
    }
    if (!form.date) {
      setErr("Date is required");
      return;
    }
    addTransaction({
      type,
      desc: form.desc.trim(),
      amount: Number(form.amount),
      category: form.category,
      date: form.date,
    });
    onSuccess?.("Transaction added successfully");
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 16,
      }}
    >
      <div
        style={{
          background: "var(--bg2)",
          border: "1px solid var(--border2)",
          borderRadius: 16,
          padding: 24,
          width: "100%",
          maxWidth: 420,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>
            Add Transaction
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text2)",
              cursor: "pointer",
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit}>
          {/* Type */}
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                fontSize: 12,
                color: "var(--text2)",
                display: "block",
                marginBottom: 5,
              }}
            >
              Type
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {["income", "expense"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setType(t);
                    set(
                      "category",
                      t === "income" ? "Salary" : "Food & Dining",
                    );
                  }}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    borderRadius: 8,
                    fontSize: 13,
                    cursor: "pointer",
                    fontWeight: 500,
                    border: type === t ? "none" : "1px solid var(--border)",
                    background:
                      type === t
                        ? t === "income"
                          ? "var(--teal-dim)"
                          : "var(--orange-dim)"
                        : "var(--bg3)",
                    color:
                      type === t
                        ? t === "income"
                          ? "var(--teal)"
                          : "var(--orange)"
                        : "var(--text2)",
                  }}
                >
                  {t === "income" ? "↑ Income" : "↓ Expense"}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                fontSize: 12,
                color: "var(--text2)",
                display: "block",
                marginBottom: 5,
              }}
            >
              Description
            </label>
            <input
              value={form.desc}
              onChange={(e) => set("desc", e.target.value)}
              placeholder="e.g. Monthly salary"
              style={{
                width: "100%",
                background: "var(--bg3)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                padding: "9px 12px",
                borderRadius: 8,
                fontSize: 13,
                outline: "none",
              }}
            />
          </div>

          {/* Amount */}
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                fontSize: 12,
                color: "var(--text2)",
                display: "block",
                marginBottom: 5,
              }}
            >
              Amount ($)
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(e) => set("amount", e.target.value)}
              placeholder="0.00"
              style={{
                width: "100%",
                background: "var(--bg3)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                padding: "9px 12px",
                borderRadius: 8,
                fontSize: 13,
                outline: "none",
              }}
            />
          </div>

          {/* Category */}
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                fontSize: 12,
                color: "var(--text2)",
                display: "block",
                marginBottom: 5,
              }}
            >
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              style={{
                width: "100%",
                background: "var(--bg3)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                padding: "9px 12px",
                borderRadius: 8,
                fontSize: 13,
                outline: "none",
              }}
            >
              {cats.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                fontSize: 12,
                color: "var(--text2)",
                display: "block",
                marginBottom: 5,
              }}
            >
              Date
            </label>
            <input
              type="date"
              value={form.date}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => set("date", e.target.value)}
              style={{
                width: "100%",
                background: "var(--bg3)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                padding: "9px 12px",
                borderRadius: 8,
                fontSize: 13,
                outline: "none",
              }}
            />
          </div>

          {err && (
            <p style={{ color: "var(--red)", fontSize: 12, marginBottom: 10 }}>
              {err}
            </p>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "10px 0",
                background: "var(--bg3)",
                border: "1px solid var(--border)",
                color: "var(--text2)",
                borderRadius: 8,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: "10px 0",
                background: "var(--teal)",
                border: "none",
                color: "#000",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Add Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
