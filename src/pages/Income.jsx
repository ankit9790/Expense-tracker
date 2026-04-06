import React, { useState, useMemo, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Plus,
  DollarSign,
  Download,
  Eye,
  Calendar,
  TrendingUp,
  BarChart2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

import AddTransactionModal from "../components/Add";
import TransactionItem from "../components/TransactionItem";
import TimeFrameSelector from "../components/TimeFrame";
import FinancialCard from "../components/FinancialCard";
import { getTimeFrameRange, generateChartPoints } from "../components/Helpers";
import { INCOME_COLORS, CATEGORY_ICONS_Inc } from "../assets/color";
import { incomeStyles as styles } from "../assets/dummyStyles";

// Simple client-side CSV export
const exportCSV = (data, filename) => {
  if (!data.length) return;
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map((r) => Object.values(r).join(",")).join("\n");
  const blob = new Blob([headers + "\n" + rows], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename + ".csv";
  link.click();
};

const IncomePage = () => {
  const {
    allTransactions = [],
    timeFrame = "monthly",
    setTimeFrame = () => {},
    addTransaction,
    editTransaction,
    deleteTransaction,
  } = useOutletContext();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [filter, setFilter] = useState("all");

  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    amount: "",
    type: "income",
    category: "Salary",
  });

  const [editForm, setEditForm] = useState({
    description: "",
    amount: "",
    category: "Salary",
    date: new Date().toISOString().split("T")[0],
  });

  const timeFrameRange = useMemo(
    () => getTimeFrameRange(timeFrame),
    [timeFrame],
  );
  const chartPoints = useMemo(
    () => generateChartPoints(timeFrame),
    [timeFrame],
  );

  const isInRange = useCallback((date, start, end) => {
    const d = new Date(date);
    const s = new Date(start);
    s.setHours(0, 0, 0, 0);
    const e = new Date(end);
    e.setHours(23, 59, 59, 999);
    return d >= s && d <= e;
  }, []);

  // All income
  const incomeTransactions = useMemo(
    () =>
      (allTransactions || [])
        .filter((t) => t.type === "income")
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [allTransactions],
  );

  // Within time frame
  const timeFrameTransactions = useMemo(
    () =>
      incomeTransactions.filter((t) =>
        isInRange(t.date, timeFrameRange.start, timeFrameRange.end),
      ),
    [incomeTransactions, timeFrameRange, isInRange],
  );

  // Filtered
  const filteredTransactions = useMemo(() => {
    if (filter === "all") return timeFrameTransactions;
    if (filter === "month") {
      return timeFrameTransactions.filter((t) => {
        const d = new Date(t.date);
        return (
          d.getMonth() === timeFrameRange.start.getMonth() &&
          d.getFullYear() === timeFrameRange.start.getFullYear()
        );
      });
    }
    if (filter === "year") {
      return timeFrameTransactions.filter(
        (t) =>
          new Date(t.date).getFullYear() === timeFrameRange.start.getFullYear(),
      );
    }
    return timeFrameTransactions.filter(
      (t) => t.category.toLowerCase() === filter.toLowerCase(),
    );
  }, [timeFrameTransactions, filter, timeFrameRange]);

  // Chart
  const chartData = useMemo(() => {
    const data = chartPoints.map((p) => ({ ...p, income: 0 }));
    filteredTransactions.forEach((t) => {
      const d = new Date(t.date);
      const point = data.find((p) =>
        timeFrame === "daily"
          ? p.hour === d.getHours()
          : timeFrame === "yearly"
            ? p.date.getMonth() === d.getMonth()
            : p.date.getDate() === d.getDate() &&
              p.date.getMonth() === d.getMonth(),
      );
      if (point) point.income += Math.round(Number(t.amount));
    });
    return data;
  }, [filteredTransactions, chartPoints, timeFrame]);

  const totalIncome = useMemo(
    () => filteredTransactions.reduce((s, t) => s + Number(t.amount), 0),
    [filteredTransactions],
  );
  const averageIncome = useMemo(
    () =>
      filteredTransactions.length
        ? Math.round(totalIncome / filteredTransactions.length)
        : 0,
    [filteredTransactions, totalIncome],
  );

  // Handlers
  const handleAdd = async () => {
    if (!newTransaction.description || !newTransaction.amount) return;
    await addTransaction({
      ...newTransaction,
      amount: parseFloat(newTransaction.amount),
      date: new Date(newTransaction.date).toISOString(),
    });
    setNewTransaction({
      date: new Date().toISOString().split("T")[0],
      description: "",
      amount: "",
      type: "income",
      category: "Salary",
    });
    setShowModal(false);
  };

  const handleEdit = async () => {
    if (!editingId || !editForm.description || !editForm.amount) return;
    await editTransaction(editingId, {
      ...editForm,
      amount: parseFloat(editForm.amount),
      date: new Date(editForm.date).toISOString(),
      type: "income",
    });
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this income record?")) return;
    await deleteTransaction(id);
  };

  const handleExport = () => {
    const data = filteredTransactions.map((t) => ({
      Date: new Date(t.date).toLocaleDateString(),
      Description: t.description,
      Category: t.category,
      Amount: t.amount,
    }));
    exportCSV(data, `income_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.headerContainer}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.headerTitle}>Income Overview</h1>
            <p className={styles.headerSubtitle}>
              Track and manage your income sources
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className={styles.addButton}
          >
            <Plus size={18} /> Add Income
          </button>
        </div>
        <div className={styles.timeFrameContainer}>
          <TimeFrameSelector
            timeFrame={timeFrame}
            setTimeFrame={setTimeFrame}
            options={["daily", "weekly", "monthly", "yearly"]}
            color="teal"
          />
        </div>
      </div>

      {/* Summary cards */}
      <div className={styles.summaryGrid}>
        <FinancialCard
          icon={
            <div className={styles.iconGreen}>
              <DollarSign className={`w-5 h-5 ${styles.textGreen}`} />
            </div>
          }
          label="Total Income"
          value={`$${totalIncome.toLocaleString()}`}
          additionalContent={
            <div className="mt-2 text-xs text-gray-500 flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {timeFrameRange.label}
            </div>
          }
          borderColor={styles.borderGreen}
        />
        <FinancialCard
          icon={
            <div className={styles.iconBlue}>
              <BarChart2 className={`w-5 h-5 ${styles.textBlue}`} />
            </div>
          }
          label="Average Income"
          value={`$${averageIncome.toLocaleString()}`}
          additionalContent={
            <div className="mt-2 text-xs text-gray-500 flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {filteredTransactions.length} transactions
            </div>
          }
          borderColor={styles.borderBlue}
        />
        <FinancialCard
          icon={
            <div className={styles.iconPurple}>
              <TrendingUp className={`w-5 h-5 ${styles.textPurple}`} />
            </div>
          }
          label="Transactions"
          value={filteredTransactions.length}
          additionalContent={
            <div className="mt-2 text-xs text-gray-500 flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {filter === "all" ? "All records" : "Filtered records"}
            </div>
          }
          borderColor={styles.borderPurple}
        />
      </div>

      {/* Chart */}
      <div className={styles.chartContainer}>
        <div className={styles.chartHeaderContainer}>
          <h3 className={styles.chartTitle}>
            <BarChart2 className="w-5 h-5 text-green-500" />
            {timeFrame === "daily"
              ? "Hourly"
              : timeFrame === "yearly"
                ? "Monthly"
                : "Daily"}{" "}
            Income Trends
            <span className="text-sm text-gray-500 font-normal">
              {" "}
              ({timeFrameRange.label})
            </span>
          </h3>
          <button onClick={handleExport} className={styles.exportButton}>
            <Download size={16} /> Export CSV
          </button>
        </div>
        <div className={styles.chartHeight}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
            >
              <defs>
                <linearGradient
                  id="incomeBarGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f3f4f6"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                width={50}
                tickFormatter={(v) => `$${v.toLocaleString()}`}
              />
              <Tooltip
                formatter={(v) => [
                  `$${Math.round(v).toLocaleString()}`,
                  "Income",
                ]}
                contentStyle={styles.tooltipContent}
              />
              <Bar
                dataKey="income"
                name="Income"
                radius={[6, 6, 0, 0]}
                barSize={20}
              >
                {chartData.map((_, i) => (
                  <Cell
                    key={`cell-${i}`}
                    fill={INCOME_COLORS[i % INCOME_COLORS.length]}
                  />
                ))}
              </Bar>
              {chartData.map((p, i) =>
                p.isCurrent ? (
                  <ReferenceLine
                    key={i}
                    x={p.label}
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                  />
                ) : null,
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transaction list */}
      <div className={styles.listContainer}>
        <div className={styles.header}>
          <h3 className={styles.sectionTitle}>
            <DollarSign className="w-5 h-5 text-green-500" />
            Income Transactions
            <span className="text-sm text-gray-500 font-normal">
              {" "}
              ({timeFrameRange.label})
            </span>
          </h3>
          <div className={styles.filterContainer}>
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Transactions</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="Salary">Salary</option>
                <option value="Freelance">Freelance</option>
                <option value="Investment">Investment</option>
                <option value="Bonus">Bonus</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <button onClick={handleExport} className={styles.exportButton}>
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        <div className={styles.transactionList}>
          {filteredTransactions.slice(0, showAll ? undefined : 8).map((t) => (
            <TransactionItem
              key={t.id}
              transaction={t}
              isEditing={editingId === t.id}
              editForm={editForm}
              setEditForm={setEditForm}
              onSave={handleEdit}
              onCancel={() => setEditingId(null)}
              onDelete={handleDelete}
              type="income"
              categoryIcons={CATEGORY_ICONS_Inc}
              setEditingId={setEditingId}
            />
          ))}

          {!showAll && filteredTransactions.length > 8 && (
            <button
              onClick={() => setShowAll(true)}
              className={styles.viewAllButton}
            >
              <Eye size={18} /> View All {filteredTransactions.length}{" "}
              Transactions
            </button>
          )}

          {filteredTransactions.length === 0 && (
            <div className={styles.emptyStateContainer}>
              <div className={styles.emptyStateIcon}>
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
              <p className={styles.emptyStateText}>
                No income transactions found
              </p>
              <p className={styles.emptyStateSubtext}>
                {filter === "all"
                  ? "You haven't recorded any income yet"
                  : `No ${filter} transactions found`}
              </p>
              <button
                onClick={() => setShowModal(true)}
                className={styles.emptyStateButton}
              >
                <Plus size={16} /> Add Income
              </button>
            </div>
          )}
        </div>
      </div>

      <AddTransactionModal
        showModal={showModal}
        setShowModal={setShowModal}
        newTransaction={newTransaction}
        setNewTransaction={setNewTransaction}
        handleAddTransaction={handleAdd}
        type="income"
        title="Add New Income"
        buttonText="Add Income"
        categories={["Salary", "Freelance", "Investment", "Bonus", "Other"]}
        color="teal"
      />
    </div>
  );
};

export default IncomePage;
