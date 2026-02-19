
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
    Settings2, Loader2, Users, Trophy,
} from 'lucide-react';
import { TargetModal } from './TargetModal';
import { AddAgentModal } from './AddAgentModal';
import { PerformanceSkeleton } from './PerformanceSkeleton';
import { MonthPicker } from '@/components/ui/MonthPicker';

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
    const [agents, setAgents] = useState<Profile[]>([]);
    const [perfData, setPerfData] = useState<FullPerformanceData | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [lbLoading, setLbLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
    const [activePeriod, setActivePeriod] = useState<Period>('mtd');

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [yearStr, monthStr] = selectedMonth.split('-');
            const baseDate = new Date(Number(yearStr), Number(monthStr) - 1, 1);

            const [agentList, fullPerf] = await Promise.all([
                getAgents(),
                getFullAgentPerformance(selectedAgentId, baseDate),
            ]);
            setAgents(agentList);
            setPerfData(fullPerf);
        } catch (err) {
            console.error('Failed to load performance data', err);
        } finally {
            setLoading(false);
        }
    }, [selectedAgentId, selectedMonth]);

    const loadLeaderboard = useCallback(async () => {
        setLbLoading(true);
        try {
            const [yearStr, monthStr] = selectedMonth.split('-');
            const baseDate = new Date(Number(yearStr), Number(monthStr) - 1, 1);

            const lb = await getTeamLeaderboard(baseDate);
            setLeaderboard(lb);
        } catch (err) {
            console.error('Failed to load leaderboard', err);
        } finally {
            setLbLoading(false);
        }
    }, [selectedMonth]);

    useEffect(() => {
        loadData();
        loadLeaderboard();
    }, [loadData, loadLeaderboard]);

    const handleSuccess = () => {
        loadData();
        loadLeaderboard();
    };

    if (loading && agents.length === 0) {
        return <PerformanceSkeleton />;
    }

    const [yearStr, monthStr] = selectedMonth.split('-');
    const now = new Date(Number(yearStr), Number(monthStr) - 1, 1);
    const monthName = now.toLocaleString('en-US', { month: 'long' });
    const qNum = Math.floor(now.getMonth() / 3) + 1;

    const periodLabel: Record<Period, string> = {
        mtd: monthName,
        qtd: `Q${qNum} ${now.getFullYear()}`,
        ytd: `${now.getFullYear()} Year-to-Date`,
    };

    const currentMetrics: PeriodMetrics | null = perfData ? perfData[activePeriod] : null;

    return (
        <div className="space-y-5 md:space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <header className="flex flex-col gap-4">
                <div>
                    <h1 className="text-xl md:text-3xl font-black text-gray-800 tracking-tight">Performance</h1>
                    <p className="text-xs md:text-sm text-gray-400 font-bold mt-1">{periodLabel[activePeriod]}</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3">
                    <div className="flex items-center gap-2 w-full sm:w-auto sm:flex-1">
                        <div className="relative flex-1 max-w-[220px]">
                            <select
                                className="w-full bg-white border border-gray-200 rounded-xl px-3 md:px-4 py-2 md:py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-panze-purple transition-all appearance-none pr-8"
                                value={selectedAgentId}
                                onChange={(e) => setSelectedAgentId(e.target.value)}
                            >
                                <option value="all">All Agents</option>
                                {agents.map(a => (
                                    <option key={a.id} value={a.id}>{a.full_name}</option>
                                ))}
                            </select>
                            <Settings2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                        </div>

                        <div className="flex-1 max-w-[180px]">
                            <MonthPicker
                                value={selectedMonth}
                                onChange={(val) => setSelectedMonth(val)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button onClick={() => setIsAgentModalOpen(true)} className="panze-btn-secondary !py-2 !px-3 md:!px-4 flex-1 sm:flex-none justify-center">
                            <UserPlus size={14} />
                        </button>

                        <button onClick={() => setIsModalOpen(true)} className="panze-btn-primary !py-2 !px-3 md:!px-4 flex-[2] sm:flex-none justify-center">
                            <Target size={14} />
                            <span>Set Target</span>
                        </button>
                    </div>
                </div>
            </header>

            <TargetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={handleSuccess} agents={agents} />
            <AddAgentModal isOpen={isAgentModalOpen} onClose={() => setIsAgentModalOpen(false)} onSuccess={handleSuccess} />

            {/* Period Tabs */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit">
                {(['mtd', 'qtd', 'ytd'] as Period[]).map(p => (
                    <button
                        key={p}
                        onClick={() => setActivePeriod(p)}
                        className={`px-3 md:px-5 py-1.5 md:py-2 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all ${activePeriod === p
                            ? 'bg-white text-gray-800 shadow-sm'
                            : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        {p}
                    </button>
                ))}
            </div>

            {currentMetrics && (
                <div className="grid grid-cols-2 gap-2 md:gap-4">
                    {/* Revenue Collected */}
                    <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-3 md:p-5">
                        <div className="flex items-center justify-between mb-2 md:mb-3">
                            <div className="flex items-center gap-1.5 md:gap-2 text-gray-400">
                                <DollarSign size={12} className="md:w-[14px] md:h-[14px]" />
                                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest">Revenue Collected</span>
                            </div>
                            <span className={`text-[10px] md:text-xs font-bold ${currentMetrics.achievement >= 100 ? 'text-green-600' :
                                currentMetrics.achievement >= 50 ? 'text-orange-500' : 'text-red-500'
                                }`}>
                                {currentMetrics.achievement.toFixed(0)}%
                            </span>
                        </div>
                        <p className="text-lg md:text-2xl font-black text-gray-800 tabular-nums">${currentMetrics.collections.toLocaleString()}</p>

                        {currentMetrics.target > 0 ? (
                            <div className="mt-2 md:mt-3">
                                <div className="w-full bg-gray-100 rounded-full h-1 md:h-1.5">
                                    <div
                                        className={`h-1 md:h-1.5 rounded-full transition-all duration-700 ${currentMetrics.achievement >= 100 ? 'bg-green-500' :
                                            currentMetrics.achievement >= 50 ? 'bg-orange-500' : 'bg-red-400'
                                            }`}
                                        style={{ width: `${Math.min(currentMetrics.achievement, 100)}%` }}
                                    />
                                </div>
                                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between mt-2 gap-1 xl:gap-0">
                                    <p className="text-[9px] md:text-[10px] text-gray-500 font-medium tabular-nums">
                                        Target: <span className="font-bold text-gray-700">${currentMetrics.target.toLocaleString()}</span>
                                    </p>
                                    <p className="text-[9px] md:text-[10px] text-gray-400 font-medium tabular-nums">
                                        Contractual: <span className="text-gray-500">${currentMetrics.sales.toLocaleString()}</span>
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-[8px] md:text-[10px] text-gray-400 mt-2 md:mt-3 font-medium tabular-nums">
                                Contractual: ${currentMetrics.sales.toLocaleString()}
                            </p>
                        )}
                    </div>

                    {/* Projects */}
                    <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-3 md:p-5">
                        <div className="flex items-center gap-1.5 md:gap-2 text-gray-400 mb-2 md:mb-3">
                            <Target size={12} className="md:w-[14px] md:h-[14px]" />
                            <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest">Deals Closed</span>
                        </div>
                        <p className="text-lg md:text-2xl font-black text-gray-800 tabular-nums">{currentMetrics.projectCount}</p>
                        <p className="text-[8px] md:text-[10px] text-gray-400 mt-2 md:mt-3 font-medium hidden sm:block">Total projects signed in period</p>
                    </div>
                </div>
            )}

            {/* Team Leaderboard */}
            <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-3 md:px-5 py-3 md:py-4 border-b border-gray-50">
                    <div className="flex items-center gap-2 text-gray-800">
                        <Users size={16} className="text-panze-purple" />
                        <h3 className="text-xs md:text-sm font-bold">Team — {monthName} Rankings</h3>
                    </div>
                    <span className="text-[9px] md:text-[10px] font-bold text-gray-400 tabular-nums">{leaderboard.length} agents</span>
                </div>

                {lbLoading ? (
                    <div className="p-8 flex justify-center">
                        <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* ─── Mobile Leaderboard ─── */}
                        <div className="md:hidden divide-y divide-gray-50">
                            {leaderboard.map((entry, idx) => (
                                <div
                                    key={entry.agent.id}
                                    className={`flex items-center gap-3 px-3 py-3 ${entry.agent.id === selectedAgentId ? 'bg-purple-50/30' : ''}`}
                                >
                                    <span className="text-xs font-bold text-gray-400 w-5 text-center tabular-nums">
                                        {idx === 0 && entry.mtdAchievement > 0 ? '🏆' :
                                            idx === 1 && entry.mtdAchievement > 0 ? '🥈' :
                                                idx === 2 && entry.mtdAchievement > 0 ? '🥉' : idx + 1}
                                    </span>
                                    <div className="w-7 h-7 rounded-lg bg-panze-gradient flex items-center justify-center text-white text-[10px] font-black shrink-0">
                                        {entry.agent.full_name?.charAt(0) || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-gray-700 truncate">{entry.agent.full_name}</p>
                                        <p className="text-[10px] text-gray-400 tabular-nums">${entry.mtdCollected.toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <div className="w-10 bg-gray-100 rounded-full h-1">
                                            <div
                                                className={`h-1 rounded-full ${entry.mtdAchievement >= 100 ? 'bg-green-500' :
                                                    entry.mtdAchievement >= 50 ? 'bg-orange-500' : 'bg-red-400'
                                                    }`}
                                                style={{ width: `${Math.min(entry.mtdAchievement, 100)}%` }}
                                            />
                                        </div>
                                        <span className={`text-[10px] font-bold tabular-nums ${entry.mtdAchievement >= 100 ? 'text-green-600' :
                                            entry.mtdAchievement >= 50 ? 'text-orange-500' : 'text-red-500'
                                            }`}>
                                            {entry.mtdAchievement.toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {leaderboard.length === 0 && (
                                <div className="py-12 flex flex-col items-center justify-center text-center">
                                    <Trophy size={32} className="text-gray-200 mb-3" />
                                    <p className="text-xs font-bold text-gray-400">No agent rankings yet</p>
                                </div>
                            )}
                        </div>

                        {/* ─── Desktop Leaderboard Table ─── */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left min-w-[600px]">
                                <thead>
                                    <tr className="border-b border-gray-50 bg-gray-50/30">
                                        <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-10">#</th>
                                        <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Agent</th>
                                        <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Collected</th>
                                        <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Target</th>
                                        <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right w-40">Achievement</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {leaderboard.map((entry, idx) => (
                                        <tr
                                            key={entry.agent.id}
                                            className={`hover:bg-gray-50/50 transition-colors ${entry.agent.id === selectedAgentId ? 'bg-purple-50/30' : ''}`}
                                        >
                                            <td className="px-5 py-3 text-xs font-bold text-gray-400 tabular-nums">
                                                {idx === 0 && entry.mtdAchievement > 0 ? '🏆' :
                                                    idx === 1 && entry.mtdAchievement > 0 ? '🥈' :
                                                        idx === 2 && entry.mtdAchievement > 0 ? '🥉' : idx + 1}
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-lg bg-panze-gradient flex items-center justify-center text-white text-[10px] font-black shrink-0">
                                                        {entry.agent.full_name?.charAt(0) || '?'}
                                                    </div>
                                                    <span className="text-sm font-semibold text-gray-700">{entry.agent.full_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-right text-sm font-bold text-gray-800 tabular-nums">${entry.mtdCollected.toLocaleString()}</td>
                                            <td className="px-5 py-3 text-right text-sm text-gray-400 tabular-nums">${entry.mtdTarget.toLocaleString()}</td>
                                            <td className="px-5 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className="w-16 bg-gray-100 rounded-full h-1.5">
                                                        <div
                                                            className={`h-1.5 rounded-full transition-all ${entry.mtdAchievement >= 100 ? 'bg-green-500' :
                                                                entry.mtdAchievement >= 50 ? 'bg-orange-500' : 'bg-red-400'
                                                                }`}
                                                            style={{ width: `${Math.min(entry.mtdAchievement, 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className={`text-xs font-bold tabular-nums min-w-[32px] text-right ${entry.mtdAchievement >= 100 ? 'text-green-600' :
                                                        entry.mtdAchievement >= 50 ? 'text-orange-500' : 'text-red-500'
                                                        }`}>
                                                        {entry.mtdAchievement.toFixed(0)}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {leaderboard.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-16 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <Trophy size={48} className="text-gray-200 mb-4" />
                                                    <p className="text-sm font-bold text-gray-400">No agent rankings yet for this period</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
