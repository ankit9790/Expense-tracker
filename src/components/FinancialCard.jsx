import React from "react";

const FinancialCard = ({
  icon,
  label,
  value,
  additionalContent,
  borderColor = "",
  className = "",
}) => {
  return (
    <div
      className={`bg-white rounded-xl p-5 shadow-sm border border-gray-100 ${borderColor} ${className}`}
    >
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-sm text-gray-600 font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      {additionalContent}
    </div>
  );
};

export default FinancialCard;
