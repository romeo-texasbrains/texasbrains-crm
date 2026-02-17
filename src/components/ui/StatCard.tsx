
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
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, trend, icon: Icon, colorClass = "bg-purple-100 text-purple-600" }) => {
    return (
        <div className="bg-white rounded-xl md:rounded-3xl p-3 md:p-6 border border-gray-100/50 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300">
            <div className={`panze-stat-icon ${colorClass} mb-2 md:mb-4 !w-8 !h-8 md:!w-10 md:!h-10`}>
                <Icon size={16} className="md:w-5 md:h-5" />
            </div>

            <div className="space-y-0.5 md:space-y-1">
                <p className="text-gray-500 text-[10px] md:text-sm font-medium">{title}</p>
                <h3 className="text-xl md:text-3xl font-bold text-gray-800 tabular-nums">{value}</h3>
            </div>

            <div className="hidden md:flex mt-4 pt-4 border-t border-gray-50 items-center justify-between">
                <span className="text-xs text-gray-400">Last 30 days</span>
                {trend && (
                    <span className={`text-xs font-bold flex items-center gap-1 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {trend.isPositive ? '↑' : '↓'} {trend.value}
                    </span>
                )}
            </div>
        </div>
    );
};
