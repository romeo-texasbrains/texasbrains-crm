
'use client';

import React, { useEffect, useState } from 'react';
import { LedgerTable } from './LedgerTable';
import { StatCard } from '@/components/ui/StatCard';
import { getLedger } from '../api';
import { ProjectLedger } from '@/lib/types';
import { Briefcase, CheckCircle, Clock, FileText, Plus } from 'lucide-react';
import { NewEntryModal } from '@/features/dashboard/components/NewEntryModal';
import { formatCurrency } from '@/lib/utils';
import useSWR from 'swr';

export const LedgerDashboard = () => {
    const { data = [], isLoading, mutate } = useSWR('ledger-data', getLedger, {
        revalidateOnFocus: false,
        revalidateIfStale: true,
    });
    const [isModalOpen, setIsModalOpen] = useState(false);

    const totalValue = data.reduce((sum, item) => sum + Number(item.total_amount), 0);
    const totalPaid = data.reduce((sum, item) => sum + Number(item.paid_amount), 0);
    const totalRemaining = data.reduce((sum, item) => sum + Number(item.remaining_amount), 0);

    if (isLoading) return (
        <div className="h-96 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-panze-purple/20 border-t-panze-purple rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-5 md:space-y-8 animate-in fade-in duration-700">
            <header className="flex flex-col gap-4 mb-4 md:mb-8">
                <div>
                    <h1 className="text-xl md:text-3xl font-black text-gray-800 tracking-tight">Project Ledger</h1>
                    <p className="text-xs md:text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Financial tracking & Statements</p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="panze-btn-primary w-fit"
                >
                    <Plus size={16} />
                    <span className="hidden sm:inline">Initialize Project</span>
                    <span className="sm:hidden">New Project</span>
                </button>
            </header>

            <NewEntryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => mutate()}
            />

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                <StatCard
                    title="Contract Value"
                    value={formatCurrency(totalValue)}
                    icon={Briefcase}
                    colorClass="bg-blue-50 text-blue-600"
                />
                <StatCard
                    title="Collected"
                    value={formatCurrency(totalPaid)}
                    icon={CheckCircle}
                    colorClass="bg-green-50 text-green-600"
                />
                <StatCard
                    title="Outstanding"
                    value={formatCurrency(totalRemaining)}
                    icon={Clock}
                    colorClass="bg-orange-50 text-orange-600"
                />
            </div>

            <div className="bg-white p-3 md:p-8 rounded-xl md:rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex justify-between items-center mb-3 md:mb-8 pb-3 md:pb-4 border-b border-gray-50">
                    <div className="flex items-center gap-2 md:gap-3 text-gray-800">
                        <FileText size={18} className="text-panze-purple" />
                        <h3 className="text-sm md:text-lg font-bold">Active Statements</h3>
                    </div>
                    <span className="text-[9px] md:text-xs font-bold text-gray-400 bg-gray-50 px-2 md:px-3 py-1 rounded-lg tabular-nums">
                        {data.length} PROJECTS
                    </span>
                </div>
                <LedgerTable data={data} />
            </div>
        </div>
    );
};
