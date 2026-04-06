import React, { useState } from "react";
import { Save, X, Edit, Trash2 } from "lucide-react";
import { colorClasses } from "../assets/color";
import { transactionItemStyles } from "../assets/dummyStyles";

const TransactionItem = ({
  transaction,
  isEditing,
  editForm,
  setEditForm,
  onSave,
  onCancel,
  onDelete,
  type = "expense",
  categoryIcons = {},
  setEditingId,
  amountClass = "font-bold truncate block text-right",
  iconClass = "p-3 rounded-xl flex-shrink-0",
}) => {
  const [errors, setErrors] = useState({ description: "", amount: "" });
  const classes = colorClasses[type] || colorClasses.expense;
  const sign = type === "income" ? "+" : "-";

  const validate = () => {
    const nextErrors = { description: "", amount: "" };
    const desc = String(editForm.description ?? "").trim();
    const amt = String(editForm.amount ?? "").trim();

    if (!desc) nextErrors.description = "Description is required.";
    if (amt === "") nextErrors.amount = "Amount is required.";
    else if (Number(amt) <= 0)
      nextErrors.amount = "Amount must be greater than 0.";

    setErrors(nextErrors);
    return !nextErrors.description && !nextErrors.amount;
  };

  const handleSaveClick = () => {
    if (validate()) {
      setErrors({ description: "", amount: "" });
      onSave();
    }
  };

  const IconComponent =
    categoryIcons[transaction.category] || categoryIcons["Other"] || null;

  return (
    <div className={transactionItemStyles.container(isEditing, classes)}>
      {/* Left: icon + description */}
      <div className={transactionItemStyles.mainContainer}>
        <div
          className={transactionItemStyles.iconContainer(iconClass, classes)}
        >
          {IconComponent}
        </div>

        <div className={transactionItemStyles.contentContainer}>
          {isEditing ? (
            <>
              <input
                type="text"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Description"
                className={transactionItemStyles.input(
                  !!errors.description,
                  classes,
                )}
              />
              {errors.description && (
                <p className={transactionItemStyles.errorText}>
                  {errors.description}
                </p>
              )}
              <select
                value={editForm.category}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, category: e.target.value }))
                }
                className={`mt-1 w-full bg-white rounded-lg px-3 py-2 text-sm border focus:outline-none focus:ring-1 ${classes.border} ${classes.ring}`}
              >
                {type === "income"
                  ? ["Salary", "Freelance", "Investment", "Bonus", "Other"].map(
                      (c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ),
                    )
                  : [
                      "Food",
                      "Housing",
                      "Transport",
                      "Shopping",
                      "Entertainment",
                      "Utilities",
                      "Healthcare",
                      "Other",
                    ].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
              </select>
            </>
          ) : (
            <>
              <p className={transactionItemStyles.description}>
                {transaction.description}
              </p>
              <p className={transactionItemStyles.details}>
                {transaction.category} &bull;{" "}
                {new Date(transaction.date).toLocaleDateString()}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Right: amount + actions */}
      <div className={transactionItemStyles.actionsContainer}>
        <div className={transactionItemStyles.amountContainer}>
          {isEditing ? (
            <>
              <input
                type="number"
                value={editForm.amount}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, amount: e.target.value }))
                }
                className={transactionItemStyles.amountInput(
                  !!errors.amount,
                  classes,
                )}
              />
              {errors.amount && (
                <p className={transactionItemStyles.errorText}>
                  {errors.amount}
                </p>
              )}
            </>
          ) : (
            <span
              className={transactionItemStyles.amountText(amountClass, classes)}
            >
              {sign}$
              {Number(transaction.amount).toLocaleString("en-US", {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              })}
            </span>
          )}
        </div>

        <div className={transactionItemStyles.buttonsContainer}>
          {isEditing ? (
            <>
              <button
                onClick={handleSaveClick}
                className={transactionItemStyles.saveButton(classes)}
                title="Save"
              >
                <Save size={16} />
              </button>
              <button
                onClick={() => {
                  setErrors({ description: "", amount: "" });
                  onCancel();
                }}
                className={transactionItemStyles.cancelButton}
                title="Cancel"
              >
                <X size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setEditForm({
                    description: transaction.description ?? "",
                    amount: transaction.amount ?? "",
                    category: transaction.category ?? "",
                    date: transaction.date ?? "",
                    type: transaction.type ?? type,
                  });
                  setErrors({ description: "", amount: "" });
                  setEditingId(transaction.id);
                }}
                className={transactionItemStyles.editButton(classes)}
                title="Edit"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => onDelete(transaction.id)}
                className={transactionItemStyles.deleteButton(classes)}
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionItem;
