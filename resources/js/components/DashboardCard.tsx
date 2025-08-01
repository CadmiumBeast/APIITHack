import React from "react";

interface DashboardCardProps {
  title: string;
  value: string;
  color?: string;
  subtitle?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  color = "bg-gray-300",
  subtitle = "",
}) => {
  return (
    <div
      className={`p-5 rounded-2xl shadow-md text-white ${color} transition transform hover:scale-105`}
      title={`${title} - ${subtitle}`}
    >
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-3xl font-bold mt-2">{value}</p>
      {subtitle && <p className="text-sm mt-1 opacity-80">{subtitle}</p>}
    </div>
  );
};

export default DashboardCard;
