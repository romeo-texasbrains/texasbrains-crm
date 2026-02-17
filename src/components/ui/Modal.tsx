
'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />
            <div className="bg-white rounded-2xl md:rounded-[40px] w-full max-w-xl shadow-2xl relative z-10 animate-in zoom-in-95 fade-in duration-300 overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="px-5 md:px-10 py-5 md:py-8 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <div>
                        <h3 className="text-lg md:text-2xl font-black text-gray-800 tracking-tight">{title}</h3>
                        <p className="text-[9px] md:text-[10px] font-black text-panze-purple uppercase tracking-[0.2em] mt-1">Entity Onboarding</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-800 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="px-5 md:px-10 py-5 md:py-10">
                    {children}
                </div>
            </div>
        </div>
    );
};
