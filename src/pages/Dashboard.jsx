import React, { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Plus,
  DollarSign,
  ChevronDown,
  ChevronUp,
  ArrowDown,
  PiggyBank,
  Wallet,
} from "lucide-react";

import GaugeCard from "../components/GaugeCard";
import FinancialCard from "../components/Financialcard";
import TimeFrameSelector from "../components/TimeFrame";
import AddTransactionModal from "../components/Add";

import {
  COLORS,
  GAUGE_COLORS,
  INCOME_CATEGORY_ICONS,
  EXPENSE_CATEGORY_ICONS,
} from "../assets/color";
import { dashboardStyles, chartStyles } from "../assets/dummyStyles";
import {
  getTimeFrameRange,
  getPreviousTimeFrameRange,
  calculateData,
} from "../components/Helpers";

// ── tiny helper: is date within [start, end]? ─────────────────────
const inRange = (date, start, end) => {
  const d = new Date(date);
  const s = new Date(start);
  s.setHours(0, 0, 0, 0);
  const e = new Date(end);
  e.setHours(23, 59, 59, 999);
  return d >= s && d <= e;
};

// A small ProfitIcon substitute
const ProfitIcon = ({ className }) => <DollarSign className={className} />;
const PieChartIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
  </svg>
);

const Dashboard = () => {
  const {
    transactions: outletTransactions = [],
    allTransactions = [],
    timeFrame = "monthly",
    setTimeFrame = () => {},
    addTransaction,
  } = useOutletContext();

  const [showModal, setShowModal] = useState(false);
  const [showAllIncome, setShowAllIncome] = useState(false);
  const [showAllExpense, setShowAllExpense] = useState(false);
  const [gaugeData, setGaugeData] = useState([]);

  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    amount: "",
    type: "expense",
    category: "Food",
  });

  const timeFrameRange = useMemo(
    () => getTimeFrameRange(timeFrame),
    [timeFrame],
  );
  const prevTimeFrameRange = useMemo(
    () => getPreviousTimeFrameRange(timeFrame),
    [timeFrame],
  );

  // Filter transactions to the current / previous time-frame window
  const filteredTransactions = useMemo(
    () =>
      (allTransactions || []).filter((t) =>
        inRange(t.date, timeFrameRange.start, timeFrameRange.end),
      ),
    [allTransactions, timeFrameRange],
  );

  const prevFilteredTransactions = useMemo(
    () =>
      (allTransactions || []).filter((t) =>
        inRange(t.date, prevTimeFrameRange.start, prevTimeFrameRange.end),
      ),
    [allTransactions, prevTimeFrameRange],
  );

  const currentData = useMemo(
    () => calculateData(filteredTransactions),
    [filteredTransactions],
  );
  const prevData = useMemo(
    () => calculateData(prevFilteredTransactions),
    [prevFilteredTransactions],
  );

  // Gauge
  useEffect(() => {
    const maxValues = {
      income: Math.max(currentData.income, 5000),
      expenses: Math.max(currentData.expenses, 3000),
      savings: Math.max(Math.abs(currentData.savings), 2000),
    };
    setGaugeData([
      { name: "Income", value: currentData.income, max: maxValues.income },
      { name: "Spent", value: currentData.expenses, max: maxValues.expenses },
      { name: "Savings", value: currentData.savings, max: maxValues.savings },
    ]);
  }, [currentData]);

  // Expense change vs previous period
  const expenseChange = useMemo(() => {
    const prev = prevData.expenses;
    const curr = currentData.expenses;
    if (!prev) return curr ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  }, [prevData, currentData]);

  // Pie chart data
  const financialOverviewData = useMemo(() => {
    const cats = {};
    filteredTransactions.forEach((t) => {
      if (t.type === "expense") {
        cats[t.category] = (cats[t.category] || 0) + Number(t.amount);
      }
    });
    return Object.entries(cats).map(([name, value]) => ({
      name,
      value: Math.round(value),
    }));
  }, [filteredTransactions]);

  // Income / expense lists
  const incomeTransactions = useMemo(
    () =>
      filteredTransactions
        .filter((t) => t.type === "income")
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [filteredTransactions],
  );
  const expenseTransactions = useMemo(
    () =>
      filteredTransactions
        .filter((t) => t.type === "expense")
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [filteredTransactions],
  );

  const displayedIncome = showAllIncome
    ? incomeTransactions
    : incomeTransactions.slice(0, 3);
  const displayedExpense = showAllExpense
    ? expenseTransactions
    : expenseTransactions.slice(0, 3);

  // Add transaction handler
  const handleAddTransaction = async () => {
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

  return (
    <div className={dashboardStyles.container}>
      {/* ── Header ── */}
      <div className={dashboardStyles.headerContainer}>
        <div className={dashboardStyles.headerContent}>
          <div>
            <h1 className={dashboardStyles.headerTitle}>Financial Dashboard</h1>
            <p className={dashboardStyles.headerSubtitle}>
              Track your financial health
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className={dashboardStyles.addButton}
          >
            <Plus size={20} /> Add Transaction
          </button>
        </div>

        <div className={dashboardStyles.timeFrameContainer}>
          <TimeFrameSelector
            timeFrame={timeFrame}
            setTimeFrame={setTimeFrame}
            options={["daily", "weekly", "monthly", "yearly"]}
            color="teal"
          />
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div className={dashboardStyles.summaryGrid}>
        <FinancialCard
          icon={
            <div className={dashboardStyles.walletIconContainer}>
              <Wallet className="w-5 h-5 text-teal-600" />
            </div>
          }
          label="Total Income"
          value={`$${currentData.income.toLocaleString()}`}
          additionalContent={
            <span className={dashboardStyles.balanceBadge}>
              {timeFrameRange.label}
            </span>
          }
        />
        <FinancialCard
          icon={
            <div className={dashboardStyles.arrowDownIconContainer}>
              <ArrowDown className="w-5 h-5 text-orange-600" />
            </div>
          }
          label="Total Expenses"
          value={`$${currentData.expenses.toLocaleString()}`}
          additionalContent={
            <span className={dashboardStyles.expenseBadge}>
              {expenseChange >= 0 ? "+" : ""}
              {expenseChange}% vs prev
            </span>
          }
        />
        <FinancialCard
          icon={
            <div className={dashboardStyles.piggyBankIconContainer}>
              <PiggyBank className="w-5 h-5 text-cyan-600" />
            </div>
          }
          label="Net Savings"
          value={`$${currentData.savings.toLocaleString()}`}
          additionalContent={
            <span
              className={
                currentData.savings >= 0
                  ? "text-green-600 text-xs font-medium"
                  : "text-red-500 text-xs font-medium"
              }
            >
              {currentData.savings >= 0 ? "Positive" : "Negative"} balance
            </span>
          }
        />
      </div>

      {/* ── Gauges ── */}
      <div className={dashboardStyles.gaugeGrid}>
        {gaugeData.map((g) => (
          <GaugeCard
            key={g.name}
            gauge={g}
            colorInfo={GAUGE_COLORS[g.name] || {}}
            timeFrameLabel={timeFrameRange.label}
            highlightNegative={g.name === "Savings"}
          />
        ))}
      </div>

      {/* ── Pie chart ── */}
      <div className={dashboardStyles.pieChartContainer}>
        <div className={dashboardStyles.pieChartHeader}>
          <h3 className={dashboardStyles.pieChartTitle}>
            <PieChartIcon className="w-6 h-6 text-teal-500" />
            Expense Distribution
            <span className={dashboardStyles.listSubtitle}>
              {" "}
              ({timeFrameRange.label})
            </span>
          </h3>
        </div>
        <div className={dashboardStyles.pieChartHeight} style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart className={chartStyles.pieChart}>
              <Pie
                data={financialOverviewData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name}: ${Math.round(percent * 100)}%`
                }
                labelLine={false}
              >
                {financialOverviewData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [
                  `$${Math.round(value).toLocaleString()}`,
                  "Amount",
                ]}
                contentStyle={dashboardStyles.tooltipContent}
                itemStyle={dashboardStyles.tooltipItem}
              />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                formatter={(v) => (
                  <span className={dashboardStyles.legendText}>{v}</span>
                )}
                iconSize={10}
                iconType="circle"
                wrapperStyle={dashboardStyles.legendWrapper}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Income / Expense lists ── */}
      <div className={dashboardStyles.listsGrid}>
        {/* Income */}
        <div className={dashboardStyles.listContainer}>
          <div className={dashboardStyles.listHeader}>
            <h3 className={dashboardStyles.listTitle}>
              <ProfitIcon className="w-6 h-6 text-green-500" /> Recent Income
              <span className={dashboardStyles.listSubtitle}>
                {" "}
                ({timeFrameRange.label})
              </span>
            </h3>
            <span className={dashboardStyles.incomeCountBadge}>
              {incomeTransactions.length} records
            </span>
          </div>

          <div className={dashboardStyles.transactionList}>
            {displayedIncome.map((t) => {
              const Icon =
                INCOME_CATEGORY_ICONS[t.category] ||
                INCOME_CATEGORY_ICONS.Other;
              return (
                <div
                  key={t.id}
                  className={dashboardStyles.incomeTransactionItem}
                >
                  <div className={dashboardStyles.transactionContent}>
                    <div className={dashboardStyles.incomeIconContainer}>
                      {Icon}
                    </div>
                    <div>
                      <p className={dashboardStyles.transactionDescription}>
                        {t.description}
                      </p>
                      <p className={dashboardStyles.transactionCategory}>
                        {t.category}
                      </p>
                    </div>
                  </div>
                  <div className={dashboardStyles.transactionAmount}>
                    <p className={dashboardStyles.incomeAmount}>
                      +${Math.abs(t.amount).toLocaleString()}
                    </p>
                    <p className={dashboardStyles.transactionDate}>
                      {new Date(t.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}

            {incomeTransactions.length === 0 && (
              <div className={dashboardStyles.emptyState}>
                <div
                  className={dashboardStyles.emptyIconContainer("bg-green-50")}
                >
                  <DollarSign className="w-8 h-8 text-green-400" />
                </div>
                <p className={dashboardStyles.emptyText}>
                  No income transactions
                </p>
              </div>
            )}

            {incomeTransactions.length > 3 && (
              <div className={dashboardStyles.viewAllContainer}>
                <button
                  onClick={() => setShowAllIncome(!showAllIncome)}
                  className={dashboardStyles.viewAllButton}
                >
                  {showAllIncome ? (
                    <>
                      <ChevronUp className="w-5 h-5" /> Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-5 h-5" /> View All Income (
                      {incomeTransactions.length})
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Expenses */}
        <div className={dashboardStyles.listContainer}>
          <div className={dashboardStyles.listHeader}>
            <h3 className={dashboardStyles.listTitle}>
              <ArrowDown className="w-6 h-6 text-orange-500" /> Recent Expenses
              <span className={dashboardStyles.listSubtitle}>
                {" "}
                ({timeFrameRange.label})
              </span>
            </h3>
            <span className={dashboardStyles.expenseCountBadge}>
              {expenseTransactions.length} records
            </span>
          </div>

          <div className={dashboardStyles.transactionList}>
            {displayedExpense.map((t) => {
              const Icon =
                EXPENSE_CATEGORY_ICONS[t.category] ||
                EXPENSE_CATEGORY_ICONS.Other;
              return (
                <div
                  key={t.id}
                  className={dashboardStyles.expenseTransactionItem}
                >
                  <div className={dashboardStyles.transactionContent}>
                    <div className={dashboardStyles.expenseIconContainer}>
                      {Icon}
                    </div>
                    <div>
                      <p className={dashboardStyles.transactionDescription}>
                        {t.description}
                      </p>
                      <p className={dashboardStyles.transactionCategory}>
                        {t.category}
                      </p>
                    </div>
                  </div>
                  <div className={dashboardStyles.transactionAmount}>
                    <p className={dashboardStyles.expenseAmount}>
                      -${Math.abs(t.amount).toLocaleString()}
                    </p>
                    <p className={dashboardStyles.transactionDate}>
                      {new Date(t.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}

            {expenseTransactions.length === 0 && (
              <div className={dashboardStyles.emptyState}>
                <div
                  className={dashboardStyles.emptyIconContainer("bg-orange-50")}
                >
                  <ArrowDown className="w-8 h-8 text-orange-400" />
                </div>
                <p className={dashboardStyles.emptyText}>
                  No expense transactions
                </p>
              </div>
            )}

            {expenseTransactions.length > 3 && (
              <div className={dashboardStyles.viewAllContainer}>
                <button
                  onClick={() => setShowAllExpense(!showAllExpense)}
                  className={dashboardStyles.viewAllButton}
                >
                  {showAllExpense ? (
                    <>
                      <ChevronUp className="w-5 h-5" /> Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-5 h-5" /> View All Expenses (
                      {expenseTransactions.length})
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Add Transaction Modal ── */}
      <AddTransactionModal
        showModal={showModal}
        setShowModal={setShowModal}
        newTransaction={newTransaction}
        setNewTransaction={setNewTransaction}
        handleAddTransaction={handleAddTransaction}
        type="both"
        title="Add New Transaction"
        buttonText="Add Transaction"
        categories={[
          "Food",
          "Housing",
          "Transport",
          "Shopping",
          "Entertainment",
          "Utilities",
          "Healthcare",
          "Salary",
          "Freelance",
          "Investment",
          "Bonus",
          "Other",
        ]}
        color="teal"
      />
    </div>
  );
};

export default Dashboard;
