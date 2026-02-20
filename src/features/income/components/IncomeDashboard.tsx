
'use client';

import React, { useEffect, useState } from 'react';
import { IncomeTable } from './IncomeTable';
import { getIncomeRecords, createBankAccount, createIncomeCategory } from '../api';
import { IncomeRecord } from '@/lib/types';
import { EntryModal } from '@/components/ui/EntryModal';
import { Plus, Filter, Loader2, Wallet, Layers } from 'lucide-react';
import { NewEntryModal } from '@/features/dashboard/components/NewEntryModal';

import useSWR from 'swr';

export default function IncomeDashboard() {
    const { data: records, isLoading, mutate } = useSWR('income-records', getIncomeRecords, {
        revalidateOnFocus: false,
        revalidateIfStale: true,
    });
    const data = records || [];

    const [modalType, setModalType] = useState<'account' | 'category' | null>(null);
    const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);

    return (
        <div className="space-y-5 md:space-y-8 animate-in fade-in duration-700">
            <header className="flex flex-col gap-4">
                <div>
                    <h1 className="text-xl md:text-3xl font-bold text-gray-800">Income Ledger</h1>
                    <p className="text-xs md:text-sm text-gray-400 font-medium">Manage and audit your business transactions</p>
                </div>

                <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                    <div className="flex bg-gray-50 p-1 md:p-1.5 rounded-xl md:rounded-2xl border border-gray-100">
                        <button className="px-3 md:px-5 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs font-bold bg-white shadow-sm border border-gray-100 text-gray-800">
                            Audited
                        </button>
                        <button className="px-3 md:px-5 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs font-bold text-gray-400 hover:text-gray-800 transition-all">
                            Pending
                        </button>
                    </div>
                    <button
                        onClick={() => setIsEntryModalOpen(true)}
                        className="panze-btn-primary"
                    >
                        <Plus size={16} />
                        <span className="hidden sm:inline">New Entry</span>
                        <span className="sm:hidden">Add</span>
                    </button>
                </div>
            </header>

            <div className="bg-white rounded-xl md:rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Toolbar — stacks on mobile */}
                <div className="px-3 md:px-8 py-3 md:py-5 border-b border-gray-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-gray-50/30">
                    <div className="flex items-center gap-3 md:gap-6">
                        <div className="flex items-center gap-2 text-gray-800">
                            <Filter size={14} className="text-panze-purple" />
                            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Active Statements</span>
                        </div>
                        <div className="h-4 w-[1px] bg-gray-200 hidden md:block" />
                        <button className="flex items-center gap-2 text-panze-purple hover:underline transition-all">
                            <span className="text-xs font-bold">Filter By Project</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-3 md:gap-4">
                        <button
                            onClick={() => setModalType('account')}
                            className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-gray-400 hover:text-panze-purple transition-colors"
                        >
                            <Wallet size={14} /> <span className="hidden sm:inline">+ Account</span><span className="sm:hidden">+ Acct</span>
                        </button>
                        <button
                            onClick={() => setModalType('category')}
                            className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-gray-400 hover:text-panze-purple transition-colors"
                        >
                            <Layers size={14} /> <span className="hidden sm:inline">+ Category</span><span className="sm:hidden">+ Cat</span>
                        </button>
                    </div>
                </div>

                <div className="p-1">
                    {isLoading ? (
                        <div className="h-96 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-8 h-8 text-panze-purple animate-spin" />
                            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.2em]">Synchronizing Records</p>
                        </div>
                    ) : (
                        <IncomeTable data={data} />
                    )}
                </div>
            </div>

            <EntryModal
                title="Add Bank Account"
                isOpen={modalType === 'account'}
                onClose={() => setModalType(null)}
                onSave={async (name: string) => {
                    await createBankAccount(name);
                    await mutate();
                }}
            />

            <EntryModal
                title="Add Income Category"
                isOpen={modalType === 'category'}
                onClose={() => setModalType(null)}
                onSave={async (name: string) => {
                    await createIncomeCategory(name);
                    await mutate();
                }}
            />

            <NewEntryModal
                isOpen={isEntryModalOpen}
                onClose={() => setIsEntryModalOpen(false)}
                onSuccess={() => mutate()}
            />
        </div>
    );
}
