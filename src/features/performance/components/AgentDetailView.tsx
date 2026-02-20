'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    getAgent,
    getAgentYearlyBreakdown,
    updateAgentTarget,
    MonthlyBreakdownEntry
} from '../api';
import { Profile } from '@/lib/types';
import {
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    Target,
    Calendar,
    DollarSign,
    Loader2,
    Save,
    X,
    ChevronRight,
    Search,
    Trophy
} from 'lucide-react';
import { formatCurrency, getAchievementColors } from '@/lib/utils';
import Link from 'next/link';
import useSWR from 'swr';

export const AgentDetailView = () => {
    const { id } = useParams();
    const router = useRouter();
    const [year, setYear] = useState(new Date().getFullYear());

    const [editingMonth, setEditingMonth] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<number>(0);
    const [isSaving, setIsSaving] = useState(false);
    const [showScopeModal, setShowScopeModal] = useState<{ monthKey: string, amount: number } | null>(null);
    const [totalPeriod, setTotalPeriod] = useState<'Annual' | 'Q1' | 'Q2' | 'Q3' | 'Q4'>('Annual');

    const fetcher = async () => {
        if (!id) return { agentData: null, yearlyData: [] };
        const [agentData, yearlyData] = await Promise.all([
            getAgent(id as string),
            getAgentYearlyBreakdown(id as string, year)
        ]);
        return { agentData, yearlyData };
    };

    const { data, isLoading, mutate } = useSWR(`agent-${id}-${year}`, fetcher, {
        revalidateOnFocus: false,
        revalidateIfStale: true,
    });

    const agent = data?.agentData || null;
    const breakdown = data?.yearlyData || [];

    const handleEditStart = (monthKey: string, currentTarget: number) => {
        setEditingMonth(monthKey);
        setEditValue(currentTarget);
    };

    const handleSaveRequest = () => {
        if (!editingMonth) return;
        setShowScopeModal({ monthKey: editingMonth, amount: editValue });
    };

    const handleConfirmUpdate = async (scope: 'specific' | 'future') => {
        if (!showScopeModal || !id) return;
        setIsSaving(true);
        try {
            await updateAgentTarget(id as string, showScopeModal.monthKey, showScopeModal.amount, scope);
            await mutate();
            setEditingMonth(null);
            setShowScopeModal(null);
        } catch (err) {
            console.error('Failed to update target', err);
            alert('Error updating target.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading && !agent) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 text-panze-purple animate-spin opacity-20" />
            </div>
        );
    }

    const totalSales = breakdown.reduce((sum, m) => sum + m.sales, 0);
    const totalCollections = breakdown.reduce((sum, m) => sum + m.collections, 0);
    const totalTarget = breakdown.reduce((sum, m) => sum + m.target, 0);
    const avgAchievement = totalTarget > 0 ? (totalCollections / totalTarget) * 100 : 0;

    // Calculate Average Monthly Revenue (based on months elapsed)
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    let monthsElapsed = 12;
    if (year === currentYear) {
        monthsElapsed = currentMonth + 1;
    } else if (year > currentYear) {
        monthsElapsed = 1;
    }
    const avgMonthlyRevenue = totalCollections / monthsElapsed;


    return (
        <div className="min-h-screen pb-[calc(1.5rem+var(--sab))] animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header & Navigation Area */}
            <div className="sticky top-0 z-40 pt-[var(--sat)] bg-background/80 backdrop-blur-xl border-b border-gray-100 mb-6">
                <div className="px-4 py-4 md:px-8 md:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="w-10 h-10 flex items-center justify-center bg-white/50 backdrop-blur-md border border-white/20 rounded-2xl text-gray-500 hover:text-panze-purple transition-all shadow-sm active:scale-90"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight">{agent?.full_name}</h1>
                                <span className="px-2 py-0.5 bg-panze-purple/10 text-panze-purple text-[10px] font-black uppercase tracking-widest rounded-full">Partner</span>
                            </div>
                            <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                                <Calendar size={12} className="opacity-50" /> Performance {year}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center bg-gray-200/30 p-1 rounded-2xl border border-white/40 shadow-inner">
                        {[year - 1, year, year + 1].map(y => (
                            <button
                                key={y}
                                onClick={() => setYear(y)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${year === y ? 'bg-white text-panze-purple shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {y}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="px-4 md:px-8 space-y-8">
                {/* Visual Summary: Large Achievement Orbit */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Yearly Target', value: formatCurrency(totalTarget), icon: Target, color: 'text-purple-600', bg: 'bg-purple-50' },
                            { label: 'Revenue Collected', value: formatCurrency(totalCollections), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            { label: 'Avg Monthly', value: formatCurrency(avgMonthlyRevenue), icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
                            { label: 'Current Lag', value: formatCurrency(Math.max(0, totalTarget - totalCollections)), icon: TrendingDown, color: 'text-orange-600', bg: 'bg-orange-50' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white/70 backdrop-blur-md p-6 rounded-[32px] border border-white shadow-sm hover:shadow-md transition-all group flex flex-col items-center justify-center text-center min-h-[160px]">
                                <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <stat.icon size={20} />
                                </div>
                                <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{stat.label}</span>
                                <p className={`text-2xl font-black tabular-nums ${stat.label === 'Revenue Collected' ? 'text-emerald-600' : 'text-gray-900'}`}>
                                    {stat.value}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-panze-gradient p-8 rounded-[32px] text-white shadow-xl shadow-purple-500/20 flex flex-col justify-between overflow-hidden relative group">
                        <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-1000">
                            <TrendingUp size={160} />
                        </div>
                        <div className="relative">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Annual Progress</span>
                            <h2 className="text-4xl md:text-5xl font-black mt-2 tabular-nums">{avgAchievement.toFixed(1)}%</h2>
                        </div>
                        <div className="mt-8 relative h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                            <div
                                className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${Math.min(avgAchievement, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Performance Feed */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Monthly Feed</h3>
                        <button className="text-[10px] font-black text-panze-purple uppercase tracking-widest flex items-center gap-1">
                            <Search size={12} /> Filter
                        </button>
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden lg:block bg-white/60 backdrop-blur-xl rounded-[32px] border border-white shadow-card overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Period</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Target</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Collected</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Monthly Lag</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Achievement</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50/50">
                                {breakdown.map((row) => (
                                    <tr key={row.monthKey} className="hover:bg-white/80 transition-all group border-b border-gray-50/50">
                                        <td className="px-8 py-8">
                                            <span className="text-lg font-black text-gray-900 tracking-tight">{row.monthName}</span>
                                        </td>
                                        <td className="px-8 py-8 text-right">
                                            {editingMonth === row.monthKey ? (
                                                <div className="flex items-center justify-end gap-2 animate-in fade-in zoom-in-95 duration-200">
                                                    <input
                                                        autoFocus
                                                        type="number"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(Number(e.target.value))}
                                                        className="w-32 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-lg font-black text-right outline-none ring-2 ring-transparent focus:ring-panze-purple/20 transition-all"
                                                    />
                                                    <button onClick={handleSaveRequest} className="p-2 bg-panze-purple text-white rounded-lg"><Save size={18} /></button>
                                                </div>
                                            ) : (
                                                <span className="text-lg font-bold text-gray-400 tabular-nums">{formatCurrency(row.target)}</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-8 text-right">
                                            <span className="text-lg font-black text-emerald-600 tabular-nums">{formatCurrency(row.collections)}</span>
                                        </td>
                                        <td className="px-8 py-8 text-right">
                                            <span className={`text-lg font-black tabular-nums ${row.target > row.collections ? 'text-orange-600' : 'text-gray-200'}`}>
                                                {formatCurrency(Math.max(0, row.target - row.collections))}
                                            </span>
                                        </td>
                                        <td className="px-8 py-8">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-32 h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 ${getAchievementColors(row.achievement).bg}`}
                                                        style={{ width: `${Math.min(row.achievement, 100)}%` }}
                                                    />
                                                </div>
                                                <span className={`text-xs font-black tabular-nums ${getAchievementColors(row.achievement).text}`}>
                                                    {row.achievement.toFixed(0)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={() => handleEditStart(row.monthKey, row.target)}
                                                className="p-2 border border-gray-100 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-panze-purple transition-all active:scale-95"
                                            >
                                                <Target size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50/50 border-t-2 border-gray-100">
                                {(() => {
                                    const filteredMonths = breakdown.filter(m => {
                                        if (totalPeriod === 'Annual') return true;
                                        const monthIdx = parseInt(m.monthKey.split('-')[1]);
                                        if (totalPeriod === 'Q1') return monthIdx <= 3;
                                        if (totalPeriod === 'Q2') return monthIdx > 3 && monthIdx <= 6;
                                        if (totalPeriod === 'Q3') return monthIdx > 6 && monthIdx <= 9;
                                        if (totalPeriod === 'Q4') return monthIdx > 9;
                                        return true;
                                    });

                                    const tTarget = filteredMonths.reduce((sum, m) => sum + m.target, 0);
                                    const tCollected = filteredMonths.reduce((sum, m) => sum + m.collections, 0);
                                    const tAchievement = tTarget > 0 ? (tCollected / tTarget) * 100 : 0;

                                    return (
                                        <tr className="group">
                                            <td className="px-8 py-8">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Aggregate Total</span>
                                                    <select
                                                        value={totalPeriod}
                                                        onChange={(e) => setTotalPeriod(e.target.value as any)}
                                                        className="bg-transparent text-xl font-black text-panze-purple outline-none cursor-pointer hover:underline decoration-panze-purple/30 underline-offset-4"
                                                    >
                                                        <option value="Annual">Annual {year}</option>
                                                        <option value="Q1">Quarter 1</option>
                                                        <option value="Q2">Quarter 2</option>
                                                        <option value="Q3">Quarter 3</option>
                                                        <option value="Q4">Quarter 4</option>
                                                    </select>
                                                </div>
                                            </td>
                                            <td className="px-8 py-8 text-right">
                                                <span className="text-xl font-black text-gray-900 tabular-nums">{formatCurrency(tTarget)}</span>
                                            </td>
                                            <td className="px-8 py-8 text-right">
                                                <span className="text-xl font-black text-emerald-600 tabular-nums">{formatCurrency(tCollected)}</span>
                                            </td>
                                            <td className="px-8 py-8 text-right">
                                                <span className={`text-xl font-black tabular-nums ${tTarget > tCollected ? 'text-orange-600' : 'text-gray-200'}`}>
                                                    {formatCurrency(Math.max(0, tTarget - tCollected))}
                                                </span>
                                            </td>
                                            <td className="px-8 py-8">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-1000 ${getAchievementColors(tAchievement).bg}`}
                                                            style={{ width: `${Math.min(tAchievement, 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className={`text-sm font-black tabular-nums ${getAchievementColors(tAchievement).text}`}>
                                                        {tAchievement.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-8 text-right">
                                                <div className="w-10 h-10 rounded-2xl bg-panze-purple/5 flex items-center justify-center text-panze-purple">
                                                    <Trophy size={20} />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })()}
                            </tfoot>
                        </table>
                    </div>

                    {/* Mobile Feed Map (Apple Style) */}
                    <div className="lg:hidden space-y-3 pb-[calc(1.5rem+var(--sab))]">
                        {breakdown.map((row) => (
                            <div key={row.monthKey} className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm flex flex-col gap-4 active:scale-[0.98] transition-all touch-none">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-base font-black text-gray-900">{row.monthName}</h4>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{year}</p>
                                    </div>
                                    <button
                                        onClick={() => handleEditStart(row.monthKey, row.target)}
                                        className="h-10 px-4 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black uppercase text-gray-400 hover:text-panze-purple active:bg-purple-50"
                                    >
                                        Set Goal
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-4">
                                    <div>
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Target</span>
                                        <p className="text-sm font-black text-gray-900 tabular-nums">{formatCurrency(row.target)}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Collected</span>
                                        <p className="text-sm font-black text-emerald-600 tabular-nums">{formatCurrency(row.collections)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 bg-gray-50/50 p-3 rounded-2xl">
                                    <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-700 ${getAchievementColors(row.achievement).bg}`}
                                            style={{ width: `${Math.min(row.achievement, 100)}%` }}
                                        />
                                    </div>
                                    <span className={`text-xs font-black tabular-nums ${getAchievementColors(row.achievement).text}`}>
                                        {row.achievement.toFixed(0)}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Premium Bottom Sheet Overlay for Editing (PWA Style) */}
            {editingMonth && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
                    <div
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setEditingMonth(null)}
                    />
                    <div className="relative w-full max-w-lg bg-white rounded-t-[40px] sm:rounded-[40px] p-8 pb-[calc(2rem+var(--sab))] shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
                        {/* Handle for mobile feel */}
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8 sm:hidden" />

                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Performance Goal</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Adjust Target for {editingMonth}</p>
                            </div>
                            <button
                                onClick={() => setEditingMonth(null)}
                                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="relative group">
                                <label className="text-[10px] font-black text-panze-purple uppercase tracking-[0.2em] mb-2 block">Monthly Quota ($)</label>
                                <div className="relative flex items-center">
                                    <DollarSign className="absolute left-6 text-gray-300 group-focus-within:text-panze-purple transition-colors" size={32} />
                                    <input
                                        autoFocus
                                        type="number"
                                        value={editValue}
                                        onChange={(e) => setEditValue(Number(e.target.value))}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-panze-purple/20 focus:bg-white rounded-[28px] py-8 pl-16 pr-8 text-4xl font-black text-gray-900 outline-none transition-all tabular-nums shadow-inner"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSaveRequest}
                                className="w-full bg-panze-gradient h-16 rounded-[28px] text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-purple-500/30 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                <Save size={20} />
                                Confirm Goal Update
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Save Options Modal (Propagate Forward) */}
            {showScopeModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300"
                        onClick={() => setShowScopeModal(null)}
                    />
                    <div className="relative bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl animate-in zoom-in-95 duration-300 text-center">
                        <div className="w-16 h-16 bg-panze-purple/10 text-panze-purple rounded-[24px] flex items-center justify-center mx-auto mb-6">
                            <TrendingUp size={32} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">Update Scope</h3>
                        <p className="text-sm text-gray-500 mt-2 mb-8 px-4 font-medium">
                            Apply <span className="text-gray-900 font-bold">{formatCurrency(showScopeModal.amount)}</span> to all future months in {year}?
                        </p>

                        <div className="grid grid-cols-1 gap-3">
                            <button
                                onClick={() => handleConfirmUpdate('future')}
                                className="w-full h-14 bg-panze-gradient text-white rounded-[20px] text-xs font-black uppercase tracking-widest shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
                            >
                                Yes, propagate forward
                            </button>
                            <button
                                onClick={() => handleConfirmUpdate('specific')}
                                className="w-full h-14 bg-gray-100 text-gray-700 rounded-[20px] text-xs font-black uppercase tracking-widest hover:bg-gray-200 active:scale-95 transition-all"
                            >
                                No, only {editingMonth}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
