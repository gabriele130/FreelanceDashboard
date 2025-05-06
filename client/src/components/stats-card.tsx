import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: "blue" | "purple" | "green";
  subtitle?: string;
  subtitleValue?: string;
  progress?: number;
  indicator?: {
    color: string;
    label: string;
  };
}

const StatsCard = ({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
  subtitleValue,
  progress,
  indicator,
}: StatsCardProps) => {
  const cardClass = `stat-card stat-card-${color}`;
  const iconClass = `stat-icon stat-icon-${color}`;

  return (
    <div className={cardClass}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className={`text-2xl font-bold text-${color === "blue" ? "primary" : color === "purple" ? "accent" : "secondary"} mt-1`}>
            {value}
          </p>
        </div>
        <div className={iconClass}>
          <Icon className="text-xl" />
        </div>
      </div>
      
      {(subtitle || progress !== undefined) && (
        <div className="mt-4">
          {subtitle && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{subtitle}</span>
              {subtitleValue && <span className="text-gray-800 font-medium">{subtitleValue}</span>}
            </div>
          )}
          
          {progress !== undefined && (
            <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
              <div 
                className={`h-2 ${
                  color === "blue" 
                    ? "bg-primary" 
                    : color === "purple" 
                      ? "bg-accent" 
                      : "bg-secondary"
                } rounded-full`} 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
          
          {indicator && (
            <div className="mt-1 flex items-center space-x-1">
              <span className={`w-3 h-3 rounded-full bg-${indicator.color}`}></span>
              <span className="text-xs text-gray-600">{indicator.label}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StatsCard;
