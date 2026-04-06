import React, { useState, useMemo, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Plus,
  DollarSign,
  Download,
  Eye,
  Calendar,
  TrendingDown,
  BarChart2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

import AddTransactionModal from "../components/Add";
import TransactionItem from "../components/TransactionItem";
import TimeFrameSelector from "../components/TimeFrame";
import FinancialCard from "../components/FinancialCard";
import { getTimeFrameRange, generateChartPoints } from "../components/Helpers";
import { CATEGORY_ICONS } from "../assets/color";
import { expensePageStyles as styles } from "../assets/dummyStyles";

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

const ExpensePage = () => {
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
    type: "expense",
    category: "Food",
  });

  const [editForm, setEditForm] = useState({
    description: "",
    amount: "",
    category: "Food",
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

  const expenseTransactions = useMemo(
    () =>
      (allTransactions || [])
        .filter((t) => t.type === "expense")
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [allTransactions],
  );

  const timeFrameTransactions = useMemo(
    () =>
      expenseTransactions.filter((t) =>
        isInRange(t.date, timeFrameRange.start, timeFrameRange.end),
      ),
    [expenseTransactions, timeFrameRange, isInRange],
  );

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

  const chartData = useMemo(() => {
    const data = chartPoints.map((p) => ({ ...p, expense: 0 }));
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
      if (point) point.expense += Math.round(Number(t.amount));
    });
    return data;
  }, [filteredTransactions, chartPoints, timeFrame]);

  const totalExpense = useMemo(
    () => filteredTransactions.reduce((s, t) => s + Number(t.amount), 0),
    [filteredTransactions],
  );
  const averageExpense = useMemo(
    () =>
      filteredTransactions.length
        ? Math.round(totalExpense / filteredTransactions.length)
        : 0,
    [filteredTransactions, totalExpense],
  );

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
      type: "expense",
      category: "Food",
    });
    setShowModal(false);
  };

  const handleEdit = async () => {
    if (!editingId || !editForm.description || !editForm.amount) return;
    await editTransaction(editingId, {
      ...editForm,
      amount: parseFloat(editForm.amount),
      date: new Date(editForm.date).toISOString(),
      type: "expense",
    });
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense record?")) return;
    await deleteTransaction(id);
  };

  const handleExport = () => {
    const data = filteredTransactions.map((t) => ({
      Date: new Date(t.date).toLocaleDateString(),
      Description: t.description,
      Category: t.category,
      Amount: t.amount,
    }));
    exportCSV(data, `expenses_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerCard}>
        <div className={styles.headerContainer}>
          <div>
            <h1 className={styles.headerTitle}>Expense Overview</h1>
            <p className={styles.headerSubtitle}>
              Track and manage your expenses
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className={styles.addButton}
          >
            <Plus size={20} /> Add Expense
          </button>
        </div>
        <div className={styles.timeframePositioning}>
          <TimeFrameSelector
            timeFrame={timeFrame}
            setTimeFrame={setTimeFrame}
            options={["daily", "weekly", "monthly", "yearly"]}
            color="orange"
          />
        </div>
      </div>

      {/* Summary cards */}
      <div className={styles.cardsGrid}>
        <FinancialCard
          icon={
            <div className={styles.iconOrange}>
              <DollarSign className={`w-5 h-5 ${styles.textOrange}`} />
            </div>
          }
          label="Total Expenses"
          value={`$${totalExpense.toLocaleString()}`}
          additionalContent={
            <div className="mt-2 text-xs text-gray-500 flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {timeFrameRange.label}
            </div>
          }
          borderColor={styles.borderOrange}
        />
        <FinancialCard
          icon={
            <div className={styles.iconAmber}>
              <BarChart2 className={`w-5 h-5 ${styles.textAmber}`} />
            </div>
          }
          label="Average Expense"
          value={`$${averageExpense.toLocaleString()}`}
          additionalContent={
            <div className="mt-2 text-xs text-gray-500 flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {filteredTransactions.length} transactions
            </div>
          }
          borderColor={styles.borderAmber}
        />
        <FinancialCard
          icon={
            <div className={styles.iconYellow}>
              <TrendingDown className={`w-5 h-5 ${styles.textYellow}`} />
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
          borderColor={styles.borderYellow}
        />
      </div>

      {/* Chart */}
      <div className={styles.chartContainer}>
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>
            <BarChart2 className="w-6 h-6 text-orange-500" />
            {timeFrame === "daily"
              ? "Hourly"
              : timeFrame === "yearly"
                ? "Monthly"
                : "Daily"}{" "}
            Expense Trends
            <span className="text-sm text-gray-500 font-normal">
              {" "}
              ({timeFrameRange.label})
            </span>
          </h3>
          <button onClick={handleExport} className={styles.chartExportButton}>
            <Download size={18} /> Export CSV
          </button>
        </div>
        <div className={styles.chartHeight}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <defs>
                <linearGradient
                  id="expenseGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#ff9800" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ff9800" stopOpacity={0.1} />
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
                width={60}
                tickFormatter={(v) => `$${v.toLocaleString()}`}
              />
              <Tooltip
                formatter={(v) => [
                  `$${Math.round(v).toLocaleString()}`,
                  "Expense",
                ]}
                contentStyle={styles.tooltipContent}
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="#ff9800"
                fill="url(#expenseGradient)"
                strokeWidth={2}
                activeDot={{ r: 6, fill: "#ff9800" }}
              />
              {chartData.map((p, i) =>
                p.isCurrent ? (
                  <ReferenceLine
                    key={i}
                    x={p.label}
                    stroke="#ff5722"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                  />
                ) : null,
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transactions */}
      <div className={styles.transactionsContainer}>
        <div className={styles.transactionsHeader}>
          <h3 className={styles.transactionsTitle}>
            <DollarSign className="w-6 h-6 text-orange-500" />
            Expense Transactions
            <span className="text-sm text-gray-500 font-normal">
              {" "}
              ({timeFrameRange.label})
            </span>
          </h3>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Transactions</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="Food">Food</option>
                <option value="Housing">Housing</option>
                <option value="Transport">Transport</option>
                <option value="Shopping">Shopping</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Utilities">Utilities</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <button onClick={handleExport} className={styles.exportButton}>
              <Download size={18} /> Export
            </button>
          </div>
        </div>

        <div className={styles.transactionsList}>
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
              type="expense"
              categoryIcons={CATEGORY_ICONS}
              setEditingId={setEditingId}
              containerClass={styles.transactionItemContainer}
              amountClass={styles.transactionAmount}
              iconClass={styles.transactionIcon}
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
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>
                <DollarSign className="w-8 h-8 text-orange-400" />
              </div>
              <p className={styles.emptyStateText}>
                No expense transactions found
              </p>
              <p className={styles.emptyStateSubtext}>
                {filter === "all"
                  ? "You haven't recorded any expenses yet"
                  : `No ${filter} transactions found`}
              </p>
              <button
                onClick={() => setShowModal(true)}
                className={styles.addButton}
              >
                <Plus size={20} /> Add Expense
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
        type="expense"
        title="Add New Expense"
        buttonText="Add Expense"
        categories={[
          "Food",
          "Housing",
          "Transport",
          "Shopping",
          "Entertainment",
          "Utilities",
          "Healthcare",
          "Other",
        ]}
        color="orange"
      />
    </div>
  );
};

export default ExpensePage;
