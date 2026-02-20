
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    trend?: {
        value: string;
        isPositive: boolean;
    };
    icon: LucideIcon;
    colorClass?: string;
    subtext?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, trend, icon: Icon, colorClass = "bg-purple-100 text-purple-600", subtext }) => {
    return (
        <div className="bg-white rounded-2xl md:rounded-[32px] p-4 md:p-7 border border-gray-100 shadow-sm shadow-gray-200/50 hover:shadow-md hover:shadow-purple-500/10 transition-all duration-300 group">
            <div className={`panze-stat-icon ${colorClass} mb-3 md:mb-5 !w-9 !h-9 md:!w-12 md:!h-12 rounded-xl md:rounded-2xl group-hover:scale-110 transition-transform`}>
                <Icon size={16} className="md:w-5 md:h-5" />
            </div>

            <div className="space-y-0.5 md:space-y-1">
                <p className="text-gray-500 text-[10px] md:text-sm font-medium">{title}</p>
                <h3 className="text-xl md:text-3xl font-bold text-gray-800 tabular-nums">{value}</h3>
            </div>

            {(trend || subtext) && (
                <div className={`hidden md:flex mt-4 pt-4 border-t border-gray-50 items-center ${subtext ? 'justify-between' : 'justify-end'}`}>
                    {subtext && <span className="text-xs text-gray-400">{subtext}</span>}
                    {trend && (
                        <span className={`text-xs font-bold flex items-center gap-1 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                            {trend.isPositive ? '↑' : '↓'} {trend.value}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};
