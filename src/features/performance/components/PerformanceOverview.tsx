'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
    getAgents,
    getFullAgentPerformance,
    getTeamLeaderboard,
    FullPerformanceData,
    LeaderboardEntry,
    PeriodMetrics,
} from '../api';
import { Profile } from '@/lib/types';
import {
    Target, DollarSign, UserPlus,
    Loader2, Users, Trophy, ChevronDown, Calendar, ArrowUpRight,
    TrendingUp, Search, Filter, ChevronRight
} from 'lucide-react';
import { TargetModal } from './TargetModal';
import { AddAgentModal } from './AddAgentModal';
import { PerformanceSkeleton } from './PerformanceSkeleton';
import { MonthPicker } from '@/components/ui/MonthPicker';
import { getAchievementColors, formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import useSWR from 'swr';

type Period = 'mtd' | 'qtd' | 'ytd';

interface PerformanceOverviewProps {
    agentId: string;
}

export const PerformanceOverview: React.FC<PerformanceOverviewProps> = ({ agentId: initialAgentId }) => {
    const [selectedAgentId, setSelectedAgentId] = useState<string>('all');
    const [selectedMonth, setSelectedMonth] = useState<string>(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
    const [activePeriod, setActivePeriod] = useState<Period>('mtd');

    const fetcher = async () => {
        const [yearStr, monthStr] = selectedMonth.split('-');
        const baseDate = new Date(Number(yearStr), Number(monthStr) - 1, 1);

        const [agentList, fullPerf, lb] = await Promise.all([
            getAgents(),
            getFullAgentPerformance(selectedAgentId, baseDate),
            getTeamLeaderboard(baseDate)
        ]);
        return { agents: agentList, perfData: fullPerf, leaderboard: lb };
    };

    const { data, isLoading, mutate } = useSWR(`perf-${selectedAgentId}-${selectedMonth}`, fetcher, {
        revalidateOnFocus: false,
        revalidateIfStale: true,
    });

    const agents: Profile[] = data?.agents || [];
    const perfData: FullPerformanceData | null = data?.perfData || null;
    const leaderboard: LeaderboardEntry[] = data?.leaderboard || [];

    const handleSuccess = () => {
        mutate();
    };

    if (isLoading && agents.length === 0) {
        return <PerformanceSkeleton />;
    }

    const [yearStr, monthStr] = selectedMonth.split('-');
    const now = new Date(Number(yearStr), Number(monthStr) - 1, 1);
    const monthName = now.toLocaleString('en-US', { month: 'long' });
    const qNum = Math.floor(now.getMonth() / 3) + 1;

    const periodLabel: Record<Period, string> = {
        mtd: monthName,
        qtd: `Q${qNum} ${now.getFullYear()}`,
        ytd: `${now.getFullYear()} Annual`,
    };

    const currentMetrics: PeriodMetrics | null = perfData ? perfData[activePeriod] : null;

    return (
        <div className="pb-12 animate-in fade-in duration-700 space-y-8">
            {/* Command Header Area */}
            <div className="flex flex-col gap-6">
                <div className="flex items-end justify-between px-2">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter">Performance</h1>
                        <p className="text-[10px] md:text-sm text-gray-400 font-black mt-1 uppercase tracking-[0.2em] flex items-center gap-2">
                            <TrendingUp size={14} className="text-panze-purple" /> {periodLabel[activePeriod]} Review
                        </p>
                    </div>
                </div>

                <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 bg-white/50 backdrop-blur-xl p-2 rounded-[32px] border border-white shadow-sm">
                    {/* Filter Strip */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <div className="flex items-center bg-gray-100/50 px-4 py-2 rounded-2xl border border-gray-200/20 group">
                            <Users size={16} className="text-gray-400" />
                            <select
                                className="bg-transparent pl-3 pr-8 text-[11px] font-black uppercase tracking-widest text-gray-700 outline-none appearance-none cursor-pointer"
                                value={selectedAgentId}
                                onChange={(e) => setSelectedAgentId(e.target.value)}
                            >
                                <option value="all">Company Wide</option>
                                {agents.map((a: Profile) => (
                                    <option key={a.id} value={a.id}>{a.full_name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center">
                            <MonthPicker
                                variant="ghost"
                                value={selectedMonth}
                                onChange={(val) => setSelectedMonth(val)}
                            />
                        </div>

                        <div className="hidden sm:block w-px h-8 bg-gray-200 mx-2" />

                        <div className="flex items-center bg-gray-200/30 p-1 rounded-[20px]">
                            {(['mtd', 'qtd', 'ytd'] as Period[]).map(p => (
                                <button
                                    key={p}
                                    onClick={() => setActivePeriod(p)}
                                    className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activePeriod === p
                                        ? 'bg-white text-panze-purple shadow-sm ring-1 ring-black/5'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2 sm:px-2">
                        <button
                            onClick={() => setIsAgentModalOpen(true)}
                            className="flex-1 sm:flex-none h-12 px-6 rounded-2xl bg-white border border-gray-200 text-gray-500 font-black text-[10px] uppercase tracking-widest hover:text-panze-purple transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                            <UserPlus size={16} />
                            Add Agent
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex-[2] sm:flex-none h-12 px-8 rounded-2xl bg-panze-gradient text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-purple-500/20 flex items-center justify-center gap-3 active:scale-[0.98] hover:brightness-110 transition-all"
                        >
                            <Target size={18} />
                            Set Quota
                        </button>
                    </div>
                </div>
            </div>

            <TargetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={handleSuccess} agents={agents} />
            <AddAgentModal isOpen={isAgentModalOpen} onClose={() => setIsAgentModalOpen(false)} onSuccess={handleSuccess} />

            {/* Metrics Dashboard */}
            {currentMetrics && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Primary Focus Card (Revenue) */}
                    <div className="bg-white rounded-[40px] border border-gray-100 p-8 md:p-10 shadow-sm shadow-gray-200/50 overflow-hidden relative group">
                        {/* Abstract background elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/50 rounded-full blur-3xl -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                        <div className="flex items-start justify-between relative z-10">
                            <div>
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-2 block">Revenue Collected</span>
                                <h2 className="text-4xl md:text-6xl font-black text-emerald-600 tabular-nums tracking-tighter">
                                    {formatCurrency(currentMetrics.collections)}
                                </h2>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className={`px-4 py-2 rounded-2xl font-black tabular-nums transition-all ${getAchievementColors(currentMetrics.achievement).bgMuted} ${getAchievementColors(currentMetrics.achievement).text}`}>
                                    {currentMetrics.achievement.toFixed(1)}%
                                </div>
                                <span className="text-[9px] font-bold text-gray-400 mt-2 uppercase tracking-widest">Achieved</span>
                            </div>
                        </div>

                        {currentMetrics.target > 0 && (
                            <div className="mt-12 relative z-10">
                                <div className="h-4 bg-gray-100/80 rounded-full overflow-hidden p-1 shadow-inner">
                                    <div
                                        className={`h-full rounded-full transition-all duration-[2000ms] shadow-lg ${getAchievementColors(currentMetrics.achievement).bg}`}
                                        style={{ width: `${Math.min(currentMetrics.achievement, 100)}%` }}
                                    />
                                </div>

                                <div className="mt-8 flex justify-between gap-4 p-6 rounded-[32px] bg-gray-50 border border-gray-100">
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Goal</span>
                                        <span className="text-lg font-black text-gray-900 tabular-nums">{formatCurrency(currentMetrics.target)}</span>
                                    </div>
                                    <div className="text-right space-y-1">
                                        {currentMetrics.target > currentMetrics.collections ? (
                                            <>
                                                <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest block">Deficit</span>
                                                <span className="text-lg font-black text-orange-600 tabular-nums">{formatCurrency(currentMetrics.target - currentMetrics.collections)}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-[9px] font-black text-panze-purple uppercase tracking-widest block">Surplus</span>
                                                <span className="text-lg font-black text-panze-purple tabular-nums">+{formatCurrency(currentMetrics.collections - currentMetrics.target)}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Secondary Metrics Card */}
                    <div className="bg-white rounded-[40px] border border-gray-100 p-8 md:p-10 shadow-sm shadow-gray-200/50 flex flex-col justify-between group overflow-hidden relative">
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-50/50 rounded-full blur-3xl -ml-32 -mb-32 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                        <div className="relative z-10">
                            <span className="text-[10px] font-black text-panze-purple uppercase tracking-[0.2em] mb-2 block">Contractual Sales</span>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tabular-nums tracking-tighter">
                                {formatCurrency(currentMetrics.sales)}
                            </h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-2 tracking-widest flex items-center gap-2">
                                <Trophy size={14} className="opacity-40" /> {currentMetrics.projectCount} Signed Projects
                            </p>
                        </div>

                        <div className="mt-12 pt-8 border-t border-gray-100 relative z-10 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                                    <DollarSign size={20} />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Avg Deal Size</span>
                                    <span className="text-base font-black text-gray-900 tabular-nums">
                                        {currentMetrics.projectCount > 0 ? formatCurrency(currentMetrics.sales / currentMetrics.projectCount) : '$0'}
                                    </span>
                                </div>
                            </div>
                            <ArrowUpRight size={24} className="text-gray-100 group-hover:text-panze-purple group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                        </div>
                    </div>
                </div>
            )}

            {/* Leaderboard Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Rank & Participation</h3>
                </div>

                <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm shadow-gray-200/50 overflow-hidden hover:shadow-xl transition-all duration-700">
                    <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Trophy size={18} className="text-amber-500" />
                            <span className="text-[11px] font-black text-gray-800 uppercase tracking-widest">Active Leaderboard</span>
                        </div>
                        <span className="px-3 py-1 bg-gray-200/50 rounded-full text-[9px] font-black text-gray-500 tracking-widest">{leaderboard.length} TEAMS</span>
                    </div>

                    {isLoading ? (
                        <div className="p-20 flex justify-center">
                            <Loader2 className="w-8 h-8 text-panze-purple/30 animate-spin" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto overflow-y-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/30 border-b border-gray-100/50">
                                        <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest w-20">Rank</th>
                                        <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Partner</th>
                                        <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Collected</th>
                                        <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Progress</th>
                                        <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50/50">
                                    {leaderboard.map((entry: LeaderboardEntry, idx: number) => (
                                        <tr
                                            key={entry.agent.id}
                                            className="hover:bg-gray-50 transition-all group/row"
                                        >
                                            <td className="px-8 py-5 text-sm font-black text-gray-300 tabular-nums">
                                                {entry.mtdAchievement >= 100 ? '👑' : `#${idx + 1}`}
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center font-black text-gray-400 text-xs shadow-sm group-hover/row:bg-panze-purple group-hover/row:text-white transition-all">
                                                        {entry.agent.full_name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-gray-800 tracking-tight">{entry.agent.full_name}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sales Partner</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <span className={`text-sm font-black text-emerald-600 tabular-nums`}>
                                                    {formatCurrency(entry.mtdCollected)}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <div className="w-32 bg-gray-100 rounded-full h-1.5 overflow-hidden shadow-inner">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-1000 ${getAchievementColors(entry.mtdAchievement).bg}`}
                                                            style={{ width: `${Math.min(entry.mtdAchievement, 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className={`text-[10px] font-black tabular-nums ${getAchievementColors(entry.mtdAchievement).text}`}>
                                                        {entry.mtdAchievement.toFixed(0)}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <Link
                                                    href={`/performance/agent/${entry.agent.id}`}
                                                    className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gray-50 text-gray-300 hover:bg-panze-purple hover:text-white transition-all active:scale-90"
                                                >
                                                    <ChevronRight size={18} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
