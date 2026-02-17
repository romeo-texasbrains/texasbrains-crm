
import React from 'react';

interface ProgressBarProps {
    value: number;
    max: number;
    label?: string;
    subLabel?: string;
    color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, max, label, subLabel, color = 'bg-blue-600' }) => {
    const percentage = Math.min(Math.round((value / max) * 100), 100);

    return (
        <div className="w-full">
            <div className="flex justify-between items-end mb-2">
                <div>
                    {label && <p className="text-sm font-semibold text-gray-900 uppercase tracking-tight">{label}</p>}
                    {subLabel && <p className="text-xs text-gray-500">{subLabel}</p>}
                </div>
                <span className="text-sm font-bold text-gray-900">{percentage}%</span>
            </div>
            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <div className="flex justify-between mt-1">
                <span className="text-xs font-medium text-gray-500">${value.toLocaleString()} achieved</span>
                <span className="text-xs font-medium text-gray-500">Target: ${max.toLocaleString()}</span>
            </div>
        </div>
    );
};
