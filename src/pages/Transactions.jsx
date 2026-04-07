import React, { useState, useMemo } from "react";
import { useStore } from "../store/useStore";
import { fmt, exportCSV } from "../utils/helpers";
import {
  CAT_COLORS,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
} from "../assets/dummy";
import { Edit2, Trash2, Save, X, Download } from "lucide-react";

const ALL_CATS = [...new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES])];

const inputSt = {
  background: "var(--bg3)",
  border: "1px solid var(--border)",
  color: "var(--text)",
  padding: "5px 9px",
  borderRadius: 7,
  fontSize: 12,
  outline: "none",
  width: "100%",
};

export default function Transactions() {
  const { transactions, isAdmin, editTransaction, deleteTransaction } =
    useStore();

  const [search, setSearch] = useState("");
  const [typeF, setTypeF] = useState("all");
  const [catF, setCatF] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const filtered = useMemo(() => {
    let list = [...transactions];
    if (search)
      list = list.filter(
        (t) =>
          t.desc.toLowerCase().includes(search.toLowerCase()) ||
          t.category.toLowerCase().includes(search.toLowerCase()),
      );
    if (typeF !== "all") list = list.filter((t) => t.type === typeF);
    if (catF !== "all") list = list.filter((t) => t.category === catF);
    list.sort((a, b) => {
      if (sortBy === "date-desc") return new Date(b.date) - new Date(a.date);
      if (sortBy === "date-asc") return new Date(a.date) - new Date(b.date);
      if (sortBy === "amt-desc") return b.amount - a.amount;
      if (sortBy === "amt-asc") return a.amount - b.amount;
      return 0;
    });
    return list;
  }, [transactions, search, typeF, catF, sortBy]);

  const startEdit = (t) => {
    setEditId(t.id);
    setEditForm({
      desc: t.desc,
      amount: t.amount,
      category: t.category,
      date: t.date,
      type: t.type,
    });
  };
  const saveEdit = () => {
    if (!editForm.desc || !editForm.amount) return;
    editTransaction(editId, editForm);
    setEditId(null);
  };
  const cancelEdit = () => setEditId(null);

  const sel = (val, onChange, opts) => (
    <select
      value={val}
      onChange={(e) => onChange(e.target.value)}
      style={{
        background: "var(--bg3)",
        border: "1px solid var(--border)",
        color: "var(--text)",
        padding: "7px 10px",
        borderRadius: 8,
        fontSize: 12,
        cursor: "pointer",
      }}
    >
      {opts.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  );

  return (
    <div>
      <div
        style={{
          background: "var(--bg2)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: 20,
        }}
      >
        {/* Header */}
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
              All Transactions
            </div>
            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>
              {filtered.length} records
            </div>
          </div>
          <button
            onClick={() => exportCSV(transactions)}
            style={{
              background: "var(--bg3)",
              border: "1px solid var(--border)",
              color: "var(--text2)",
              padding: "7px 13px",
              borderRadius: 8,
              fontSize: 12,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Download size={13} /> Export CSV
          </button>
        </div>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search description or category..."
            style={{
              ...inputSt,
              flex: 1,
              minWidth: 180,
              padding: "8px 12px",
              borderRadius: 8,
              fontSize: 13,
            }}
          />
          {sel(typeF, setTypeF, [
            ["all", "All Types"],
            ["income", "Income"],
            ["expense", "Expense"],
          ])}
          {sel(catF, setCatF, [
            ["all", "All Categories"],
            ...ALL_CATS.map((c) => [c, c]),
          ])}
          {sel(sortBy, setSortBy, [
            ["date-desc", "Newest First"],
            ["date-asc", "Oldest First"],
            ["amt-desc", "Amount ↓"],
            ["amt-asc", "Amount ↑"],
          ])}
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}
          >
            <thead>
              <tr>
                {[
                  "Date",
                  "Description",
                  "Category",
                  "Type",
                  "Amount",
                  ...(isAdmin ? ["Actions"] : []),
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      fontSize: 10,
                      color: "var(--text3)",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      padding: "7px 10px",
                      borderBottom: "1px solid var(--border)",
                      textAlign: h === "Amount" ? "right" : "left",
                      fontWeight: 400,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const c = CAT_COLORS[t.category] || "#78909c";
                const isEd = editId === t.id;
                const cats =
                  t.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
                return (
                  <tr
                    key={t.id}
                    onMouseEnter={(e) =>
                      !isEd && (e.currentTarget.style.background = "var(--bg3)")
                    }
                    onMouseLeave={(e) =>
                      !isEd &&
                      (e.currentTarget.style.background = isEd
                        ? "var(--bg3)"
                        : "transparent")
                    }
                    style={{ background: isEd ? "var(--bg3)" : "transparent" }}
                  >
                    {/* Date */}
                    <td
                      style={{
                        padding: "9px 10px",
                        fontSize: 12,
                        color: "var(--text3)",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      {isEd ? (
                        <input
                          type="date"
                          value={editForm.date}
                          max={new Date().toISOString().split("T")[0]}
                          onChange={(e) =>
                            setEditForm((p) => ({ ...p, date: e.target.value }))
                          }
                          style={inputSt}
                        />
                      ) : (
                        t.date
                      )}
                    </td>

                    {/* Description */}
                    <td
                      style={{
                        padding: "9px 10px",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      {isEd ? (
                        <input
                          value={editForm.desc}
                          onChange={(e) =>
                            setEditForm((p) => ({ ...p, desc: e.target.value }))
                          }
                          style={inputSt}
                        />
                      ) : (
                        <span style={{ fontSize: 13, color: "var(--text)" }}>
                          {t.desc}
                        </span>
                      )}
                    </td>

                    {/* Category */}
                    <td
                      style={{
                        padding: "9px 10px",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      {isEd ? (
                        <select
                          value={editForm.category}
                          onChange={(e) =>
                            setEditForm((p) => ({
                              ...p,
                              category: e.target.value,
                            }))
                          }
                          style={inputSt}
                        >
                          {cats.map((cc) => (
                            <option key={cc} value={cc}>
                              {cc}
                            </option>
                          ))}
                        </select>
                      ) : (
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
                      )}
                    </td>

                    {/* Type */}
                    <td
                      style={{
                        padding: "9px 10px",
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

                    {/* Amount */}
                    <td
                      style={{
                        padding: "9px 10px",
                        textAlign: "right",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      {isEd ? (
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={editForm.amount}
                          onChange={(e) =>
                            setEditForm((p) => ({
                              ...p,
                              amount: e.target.value,
                            }))
                          }
                          style={{ ...inputSt, textAlign: "right", width: 90 }}
                        />
                      ) : (
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color:
                              t.type === "income"
                                ? "var(--teal)"
                                : "var(--orange)",
                          }}
                        >
                          {t.type === "income" ? "+" : "-"}
                          {fmt(t.amount)}
                        </span>
                      )}
                    </td>

                    {/* Actions (admin only) */}
                    {isAdmin && (
                      <td
                        style={{
                          padding: "9px 10px",
                          textAlign: "center",
                          borderBottom: "1px solid var(--border)",
                        }}
                      >
                        {isEd ? (
                          <div
                            style={{
                              display: "flex",
                              gap: 5,
                              justifyContent: "center",
                            }}
                          >
                            <button
                              onClick={saveEdit}
                              title="Save"
                              style={{
                                background: "var(--teal-dim)",
                                border: "1px solid var(--teal)",
                                color: "var(--teal)",
                                padding: "4px 8px",
                                borderRadius: 7,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <Save size={13} />
                            </button>
                            <button
                              onClick={cancelEdit}
                              title="Cancel"
                              style={{
                                background: "var(--bg4)",
                                border: "1px solid var(--border2)",
                                color: "var(--text2)",
                                padding: "4px 8px",
                                borderRadius: 7,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              gap: 5,
                              justifyContent: "center",
                            }}
                          >
                            <button
                              onClick={() => startEdit(t)}
                              title="Edit"
                              style={{
                                background: "var(--blue-dim)",
                                border: "1px solid var(--blue)",
                                color: "var(--blue)",
                                padding: "4px 8px",
                                borderRadius: 7,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm("Delete this transaction?"))
                                  deleteTransaction(t.id);
                              }}
                              title="Delete"
                              style={{
                                background: "var(--red-dim)",
                                border: "1px solid var(--red)",
                                color: "var(--red)",
                                padding: "4px 8px",
                                borderRadius: 7,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={isAdmin ? 6 : 5}
                    style={{
                      textAlign: "center",
                      padding: 40,
                      color: "var(--text3)",
                      fontSize: 13,
                    }}
                  >
                    No transactions match your filters.
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
