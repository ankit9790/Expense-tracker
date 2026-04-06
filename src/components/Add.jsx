import React from "react";
import { X } from "lucide-react";
import { modalStyles } from "../assets/dummyStyles";

const AddTransactionModal = ({
  showModal,
  setShowModal,
  newTransaction,
  setNewTransaction,
  handleAddTransaction,
  loading = false,
  type = "both",
  title = "Add New Transaction",
  buttonText = "Add Transaction",
  categories = [
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
  ],
  color = "teal",
}) => {
  if (!showModal) return null;

  const today = new Date().toISOString().split("T")[0];
  const minDate = `${new Date().getFullYear()}-01-01`;
  const colorClass =
    modalStyles.colorClasses[color] || modalStyles.colorClasses.teal;

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAddTransaction();
  };

  return (
    <div className={modalStyles.overlay}>
      <div className={modalStyles.modalContainer}>
        {/* Header */}
        <div className={modalStyles.modalHeader}>
          <h2 className={modalStyles.modalTitle}>{title}</h2>
          <button
            onClick={() => setShowModal(false)}
            className={modalStyles.closeButton}
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={modalStyles.form}>
          {/* Type selector (only when type === "both") */}
          {type === "both" && (
            <div>
              <label className={modalStyles.label}>Type</label>
              <div className={modalStyles.typeButtonContainer}>
                <button
                  type="button"
                  className={modalStyles.typeButton(
                    newTransaction.type === "income",
                    modalStyles.colorClasses.teal.typeButtonSelected,
                  )}
                  onClick={() =>
                    setNewTransaction((p) => ({ ...p, type: "income" }))
                  }
                >
                  Income
                </button>
                <button
                  type="button"
                  className={modalStyles.typeButton(
                    newTransaction.type === "expense",
                    modalStyles.colorClasses.orange.typeButtonSelected,
                  )}
                  onClick={() =>
                    setNewTransaction((p) => ({ ...p, type: "expense" }))
                  }
                >
                  Expense
                </button>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className={modalStyles.label}>Description</label>
            <input
              type="text"
              value={newTransaction.description}
              onChange={(e) =>
                setNewTransaction((p) => ({
                  ...p,
                  description: e.target.value,
                }))
              }
              className={modalStyles.input(colorClass.ring)}
              placeholder="Enter description"
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className={modalStyles.label}>Amount ($)</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={newTransaction.amount}
              onChange={(e) =>
                setNewTransaction((p) => ({ ...p, amount: e.target.value }))
              }
              className={modalStyles.input(colorClass.ring)}
              placeholder="0.00"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className={modalStyles.label}>Category</label>
            <select
              value={newTransaction.category}
              onChange={(e) =>
                setNewTransaction((p) => ({ ...p, category: e.target.value }))
              }
              className={modalStyles.input(colorClass.ring)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className={modalStyles.label}>Date</label>
            <input
              type="date"
              value={
                newTransaction.date ? newTransaction.date.slice(0, 10) : today
              }
              min={minDate}
              max={today}
              onChange={(e) =>
                setNewTransaction((p) => ({ ...p, date: e.target.value }))
              }
              className={modalStyles.input(colorClass.ring)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={modalStyles.submitButton(colorClass.button)}
          >
            {loading ? "Processing…" : buttonText}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;
