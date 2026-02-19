import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthPickerProps {
    value: string; // Format: 'YYYY-MM'
    onChange: (value: string) => void;
}

const MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const MonthPicker: React.FC<MonthPickerProps> = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Parse initial value robustly
    const initialYear = value ? parseInt(value.split('-')[0]) : new Date().getFullYear();
    const [viewYear, setViewYear] = useState(initialYear);

    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Also update viewYear if value changes externally
    useEffect(() => {
        if (value) {
            setViewYear(parseInt(value.split('-')[0]));
        }
    }, [value]);

    const handleMonthSelect = (monthIndex: number) => {
        const monthStr = String(monthIndex + 1).padStart(2, '0');
        onChange(`${viewYear}-${monthStr}`);
        setIsOpen(false);
    };

    let displayLabel = 'Select Month';
    if (value) {
        const [yearStr, monthStr] = value.split('-');
        const date = new Date(Number(yearStr), Number(monthStr) - 1, 1);
        displayLabel = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    }

    const valueYear = value ? parseInt(value.split('-')[0]) : -1;
    const valueMonth = value ? parseInt(value.split('-')[1]) - 1 : -1;

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between bg-white border border-gray-200 hover:border-panze-purple rounded-xl px-3 md:px-4 py-2 md:py-2.5 text-sm font-semibold text-gray-700 transition-all outline-none"
            >
                <div className="flex items-center gap-2 text-gray-700">
                    <Calendar size={14} className="text-gray-400" />
                    <span>{displayLabel}</span>
                </div>
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl p-4 right-0 md:left-0 md:right-auto animate-in fade-in zoom-in-95 duration-200 origin-top">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            type="button"
                            onClick={() => setViewYear(v => v - 1)}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm font-bold text-gray-800">{viewYear}</span>
                        <button
                            type="button"
                            onClick={() => setViewYear(v => v + 1)}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-3 gap-2">
                        {MONTHS.map((month, index) => {
                            const isSelected = viewYear === valueYear && index === valueMonth;
                            const isCurrent = viewYear === new Date().getFullYear() && index === new Date().getMonth();

                            return (
                                <button
                                    key={month}
                                    type="button"
                                    onClick={() => handleMonthSelect(index)}
                                    className={`
                                        py-2 text-xs font-semibold rounded-lg transition-all
                                        ${isSelected
                                            ? 'bg-panze-gradient text-white shadow-sm'
                                            : isCurrent
                                                ? 'bg-purple-50 text-panze-purple hover:bg-purple-100'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                                    `}
                                >
                                    {month}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
