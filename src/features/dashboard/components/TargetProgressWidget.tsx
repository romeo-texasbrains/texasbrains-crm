'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Target, AlertCircle, Loader2, TrendingUp, Trophy } from 'lucide-react';
import { getFullAgentPerformance, FullPerformanceData, PeriodMetrics } from '@/features/performance/api';
import { getAchievementColors, formatCurrency } from '@/lib/utils';

type Period = 'mtd' | 'qtd' | 'ytd';

export const TargetProgressWidget = () => {
    const [activePeriod, setActivePeriod] = useState<Period>('mtd');
    const [perfData, setPerfData] = useState<FullPerformanceData | null>(null);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getFullAgentPerformance('all');
            setPerfData(data);
        } catch (err) {
            console.error('Failed to load company performance', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    if (loading) {
        return (
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-card p-6 flex flex-col items-center justify-center min-h-[300px] animate-pulse">
                <Loader2 className="w-8 h-8 text-panze-purple/20 animate-spin mb-4" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Analyzing targets...</p>
            </div>
        );
    }

    if (!perfData) return null;

    const currentMetrics: PeriodMetrics = perfData[activePeriod];
    const lagAmount = Math.max(0, currentMetrics.target - currentMetrics.collections);
    const hasTarget = currentMetrics.target > 0;

    const achievement = currentMetrics.achievement;
    const isSuccess = achievement >= 100;
    const achievementString = achievement.toFixed(1);

    const colors = getAchievementColors(achievement);

    return (
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm shadow-gray-200/50 overflow-hidden flex flex-col h-full hover:shadow-md hover:shadow-purple-500/5 transition-all duration-500 group">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-5 md:px-7 py-5 border-b border-gray-100 gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-panze-purple group-hover:scale-110 transition-transform duration-500">
                        <Target size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-gray-800 tracking-tight">Sales Targets</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Company Wide</p>
                    </div>
                </div>

                {/* Period Toggle */}
                <div className="flex items-center gap-1 bg-gray-50 p-1.5 rounded-2xl w-full sm:w-auto border border-gray-100">
                    {(['mtd', 'qtd', 'ytd'] as Period[]).map((p) => (
                        <button
                            key={p}
                            onClick={() => setActivePeriod(p)}
                            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activePeriod === p
                                ? 'bg-white text-gray-800 shadow-sm shadow-purple-500/10'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {p === 'mtd' ? 'Month' : p === 'qtd' ? 'Quarter' : 'Year'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-5 md:px-7 py-7 flex-1 flex flex-col gap-8">
                {hasTarget ? (
                    <>
                        {/* Hero Stats */}
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <span className={`text-5xl md:text-6xl font-black tracking-tighter tabular-nums leading-none transition-colors duration-500 ${colors.text}`}>
                                    {achievementString}%
                                </span>
                                <div className="flex items-center gap-2 pt-1">
                                    {isSuccess ? (
                                        <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs bg-blue-50 px-3 py-1 rounded-full">
                                            <Trophy size={14} /> <span>Exceeding Goals</span>
                                        </div>
                                    ) : achievement >= 80 ? (
                                        <div className="flex items-center gap-1.5 text-green-600 font-bold text-xs bg-green-50 px-3 py-1 rounded-full">
                                            <Trophy size={14} /> <span>Near Target</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-orange-600 font-bold text-xs bg-orange-50 px-3 py-1 rounded-full animate-in fade-in slide-in-from-left-2 duration-500">
                                            <TrendingUp size={14} /> <span>Running at {achievementString}%</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="text-right flex flex-col justify-center">
                                {isSuccess ? (
                                    <div className="p-3 rounded-2xl bg-blue-50 border-2 border-blue-100">
                                        <p className="text-[10px] font-black text-blue-600/60 uppercase tracking-widest mb-1">Surplus</p>
                                        <p className="text-xl font-black text-blue-600 tabular-nums">+{formatCurrency(Math.abs(lagAmount))}</p>
                                    </div>
                                ) : (
                                    <div className="p-3 rounded-2xl bg-orange-50 border-2 border-orange-100 flex flex-col items-end">
                                        <div className="text-[10px] font-black text-orange-600/60 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                            <span>Lag Gap</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <AlertCircle size={14} className="text-orange-500" />
                                            <p className="text-xl font-black text-orange-600 tabular-nums">{formatCurrency(lagAmount)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Large Progress Bar */}
                        <div className="space-y-4">
                            <div className="relative">
                                <div className="w-full bg-gray-200/50 rounded-full h-4 overflow-hidden border border-gray-100 shadow-inner">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ease-out relative shadow-sm ${colors.bg} ${colors.shadow}`}
                                        style={{
                                            width: `${Math.min(achievement, 100)}%`,
                                            backgroundColor: achievement < 50 ? '#ef4444' : achievement < 80 ? '#eab308' : achievement < 100 ? '#22c55e' : '#3b82f6'
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-white/10 block w-full h-full animate-shimmer" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)', backgroundSize: '1000px 100%', animation: 'shimmer 3s infinite linear' }} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100/50 hover:bg-white transition-colors duration-300">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Collection</p>
                                    <p className="text-lg font-black text-gray-800 tabular-nums">{formatCurrency(currentMetrics.collections)}</p>
                                </div>
                                <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100/50 hover:bg-white transition-colors duration-300">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Target Goal</p>
                                    <p className="text-lg font-black text-gray-800/40 tabular-nums">{formatCurrency(currentMetrics.target)}</p>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-200 mb-4">
                            <Target size={32} />
                        </div>
                        <p className="text-sm font-black text-gray-800">Target Initialization Required</p>
                        <p className="text-xs text-gray-400 mt-2 max-w-[220px] leading-relaxed font-medium">
                            No active targets found for the {activePeriod === 'mtd' ? 'month' : activePeriod === 'qtd' ? 'quarter' : 'year'}. Navigate to Performance to set goals.
                        </p>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes shimmer {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 3s infinite linear;
                }
            `}</style>
        </div>
    );
};
