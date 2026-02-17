
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Search } from 'lucide-react';

export interface ComboBoxOption {
    value: string;
    label: string;
    sublabel?: string;
}

interface ComboBoxProps {
    options: ComboBoxOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    icon?: React.ReactNode;
    disabled?: boolean;
    required?: boolean;
}

export const ComboBox: React.FC<ComboBoxProps> = ({
    options,
    value,
    onChange,
    placeholder = 'Search...',
    icon,
    disabled = false,
    required = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [highlightIndex, setHighlightIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find(o => o.value === value);

    const filtered = query
        ? options.filter(o =>
            o.label.toLowerCase().includes(query.toLowerCase()) ||
            (o.sublabel && o.sublabel.toLowerCase().includes(query.toLowerCase()))
        )
        : options;

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setQuery('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Reset highlight when filtered list changes
    useEffect(() => {
        setHighlightIndex(0);
    }, [query]);

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
        setQuery('');
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
        setQuery('');
        setIsOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightIndex(i => Math.min(i + 1, filtered.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightIndex(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filtered[highlightIndex]) {
                handleSelect(filtered[highlightIndex].value);
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            setQuery('');
        }
    };

    return (
        <div ref={containerRef} className="relative">
            {/* Hidden native input for form validation */}
            {required && (
                <input
                    tabIndex={-1}
                    autoComplete="off"
                    className="absolute opacity-0 w-0 h-0"
                    value={value}
                    onChange={() => { }}
                    required
                />
            )}

            {/* Display / Trigger */}
            <div
                onClick={() => {
                    if (!disabled) {
                        setIsOpen(true);
                        setTimeout(() => inputRef.current?.focus(), 50);
                    }
                }}
                className={`w-full pl-12 pr-10 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 cursor-pointer
                    transition-all font-bold text-gray-800 flex items-center min-h-[56px]
                    ${isOpen ? 'border-panze-purple bg-white ring-2 ring-purple-100' : ''}
                    ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-gray-200'}
                `}
            >
                {/* Icon */}
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    {icon || <Search size={18} />}
                </span>

                {/* Display value or placeholder */}
                {!isOpen && (
                    <>
                        {selectedOption ? (
                            <span className="truncate">{selectedOption.label}</span>
                        ) : (
                            <span className="text-gray-300 font-bold">{placeholder}</span>
                        )}
                    </>
                )}

                {/* Search input when open */}
                {isOpen && (
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={selectedOption ? selectedOption.label : placeholder}
                        className="w-full bg-transparent outline-none font-bold text-gray-800 placeholder:text-gray-300"
                    />
                )}

                {/* Right side: clear or chevron */}
                <span className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {value && !disabled && (
                        <button type="button" onClick={handleClear} className="p-0.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                            <X size={14} />
                        </button>
                    )}
                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </span>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 mt-2 w-full bg-white rounded-2xl border border-gray-100 shadow-xl max-h-[240px] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                    {filtered.length === 0 ? (
                        <div className="px-4 py-6 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                            No results found
                        </div>
                    ) : (
                        filtered.map((option, i) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleSelect(option.value)}
                                className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors first:rounded-t-2xl last:rounded-b-2xl
                                    ${i === highlightIndex ? 'bg-purple-50' : 'hover:bg-gray-50'}
                                    ${option.value === value ? 'text-panze-purple' : 'text-gray-700'}
                                `}
                            >
                                <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-black text-gray-500 shrink-0">
                                    {option.label.charAt(0)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold truncate">{option.label}</p>
                                    {option.sublabel && (
                                        <p className="text-[10px] text-gray-400 truncate">{option.sublabel}</p>
                                    )}
                                </div>
                                {option.value === value && (
                                    <span className="text-[10px] font-black text-panze-purple uppercase">Selected</span>
                                )}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};
