"use client";

interface StatisticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: "blue" | "green" | "purple" | "orange";
}

export default function StatisticsCard({
  title,
  value,
  subtitle,
  color = "blue",
}: StatisticsCardProps) {
  const colorClasses = {
    blue: "bg-blue-900/30 border-blue-500 text-blue-400",
    green: "bg-green-900/30 border-green-500 text-green-400",
    purple: "bg-purple-900/30 border-purple-500 text-purple-400",
    orange: "bg-orange-900/30 border-orange-500 text-orange-400",
  };

  return (
    <div className={`rounded-lg border-2 p-4 ${colorClasses[color]}`}>
      <h3 className="text-sm font-medium opacity-80 mb-1">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
      {subtitle && <p className="text-xs opacity-70 mt-1">{subtitle}</p>}
    </div>
  );
}
