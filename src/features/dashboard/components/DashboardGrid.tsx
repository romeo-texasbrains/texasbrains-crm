
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { StatCard } from '@/components/ui/StatCard';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
    CreditCard, Layout, Wallet, Loader2, TrendingUp,
    UserPlus, DollarSign, AlertCircle, ChevronRight, Briefcase
} from 'lucide-react';
import {
    getDashboardStats,
    getRevenueChartData,
    getLatestRegistrations,
    getLatestTransactions,
    getOutstandingByClient,
    OutstandingClient,
} from '../api';
import { AddClientModal } from '@/features/clients/components/AddClientModal';
import { NewEntryModal } from './NewEntryModal';

export const DashboardGrid = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        activeProjects: 0,
        totalClients: 0,
        activeClients: 0,
        outstandingBalance: 0,
        mtdRevenue: 0,
        collectionRate: 0,
    });
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [outstanding, setOutstanding] = useState<OutstandingClient[]>([]);
    const [loading, setLoading] = useState(true);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);

    async function loadDashboard() {
        try {
            const [s, r, reg, tra, ost] = await Promise.all([
                getDashboardStats(),
                getRevenueChartData(),
                getLatestRegistrations(),
                getLatestTransactions(),
                getOutstandingByClient(),
            ]);
            setStats(s);
            setRevenueData(r);
            setRegistrations(reg);
            setTransactions(tra);
            setOutstanding(ost);
        } catch (err) {
            console.error('Failed to load dashboard data:', err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadDashboard();
    }, []);

    if (loading) {
        return (
            <div className="h-[600px] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-panze-purple animate-spin" />
                <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Loading Dashboard</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-1000">
            {/* Quick Actions */}
            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                <button onClick={() => setIsClientModalOpen(true)} className="panze-btn-primary !py-2 !px-5">
                    <UserPlus size={15} /> <span>New Client</span>
                </button>
                <button onClick={() => setIsEntryModalOpen(true)} className="panze-btn-secondary flex items-center gap-2">
                    <Briefcase size={15} /> <span>New Entry</span>
                </button>
            </div>

            {/* 4 Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Revenue"
                    value={`$${stats.totalRevenue.toLocaleString()}`}
                    trend={{ value: "All Time", isPositive: true }}
                    icon={CreditCard}
                    colorClass="bg-purple-100 text-purple-600"
                />
                <StatCard
                    title="MTD Revenue"
                    value={`$${stats.mtdRevenue.toLocaleString()}`}
                    trend={{ value: "This Month", isPositive: true }}
                    icon={DollarSign}
                    colorClass="bg-blue-100 text-blue-600"
                />
                <StatCard
                    title="Active Projects"
                    value={stats.activeProjects}
                    trend={{ value: `${stats.totalClients} clients`, isPositive: true }}
                    icon={Layout}
                    colorClass="bg-emerald-100 text-emerald-600"
                />
                <StatCard
                    title="Outstanding"
                    value={`$${stats.outstandingBalance.toLocaleString()}`}
                    trend={{ value: `${stats.collectionRate.toFixed(0)}% collected`, isPositive: stats.collectionRate >= 50 }}
                    icon={Wallet}
                    colorClass="bg-orange-100 text-orange-600"
                />
            </div>

            {/* Charts + Outstanding Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <TrendingUp size={16} className="text-panze-purple" />
                            <h3 className="text-sm font-bold text-gray-800">Revenue Flow</h3>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 tabular-nums">{new Date().getFullYear()}</span>
                    </div>
                    <div className="h-[200px] md:h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData}>
                                <defs>
                                    <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#7C3AED" />
                                        <stop offset="100%" stopColor="#A855F7" />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#9CA3AF' }} dy={8} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#9CA3AF' }} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(124, 58, 237, 0.05)' }}
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #F3F4F6', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', padding: '12px' }}
                                />
                                <Bar dataKey="revenue" fill="url(#purpleGradient)" radius={6} barSize={28} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Outstanding by Client */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-50">
                        <div className="flex items-center gap-2">
                            <AlertCircle size={16} className="text-orange-500" />
                            <h3 className="text-sm font-bold text-gray-800">Outstanding by Client</h3>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400">{outstanding.length} clients</span>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                        {outstanding.slice(0, 8).map(ost => {
                            const paidPct = ost.total_contract > 0 ? (ost.total_paid / ost.total_contract) * 100 : 0;
                            return (
                                <Link
                                    key={ost.client_id}
                                    href={`/clients/${ost.client_id}`}
                                    className="flex items-center justify-between px-6 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 font-bold text-xs">
                                            {ost.client_name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-700 group-hover:text-orange-600 transition-colors">{ost.client_name}</p>
                                            <p className="text-[10px] text-gray-400">{ost.project_count} project{ost.project_count !== 1 ? 's' : ''}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-orange-600 tabular-nums">${ost.outstanding.toLocaleString()}</p>
                                            <div className="w-16 bg-gray-100 rounded-full h-1 mt-1">
                                                <div className="bg-green-500 h-1 rounded-full" style={{ width: `${Math.min(paidPct, 100)}%` }} />
                                            </div>
                                        </div>
                                        <ChevronRight size={14} className="text-gray-300 group-hover:text-orange-500 transition-colors" />
                                    </div>
                                </Link>
                            );
                        })}
                        {outstanding.length === 0 && (
                            <p className="text-center text-xs text-gray-400 font-bold py-12">No outstanding balances 🎉</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Tables Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Latest Onboarding */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-50">
                        <h3 className="text-sm font-bold text-gray-800">Recent Clients</h3>
                        <Link href="/clients" className="text-[10px] font-bold text-panze-purple uppercase tracking-widest hover:underline">
                            View All →
                        </Link>
                    </div>
                    <div className="overflow-x-auto"><table className="w-full min-w-[500px]">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-50">
                                <th className="px-6 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Name</th>
                                <th className="px-6 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact</th>
                                <th className="px-6 py-2.5 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {registrations.map((row, i) => (
                                <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-3">
                                        <Link href={`/clients/${row.id}`} className="text-sm font-semibold text-gray-700 hover:text-panze-purple transition-colors">
                                            {row.name}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-3 text-xs text-gray-400">{row.email || row.phone || '—'}</td>
                                    <td className="px-6 py-3 text-right text-xs font-medium text-gray-500 tabular-nums">
                                        {new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </td>
                                </tr>
                            ))}
                            {registrations.length === 0 && (
                                <tr><td colSpan={3} className="py-8 text-center text-xs text-gray-400">No clients</td></tr>
                            )}
                        </tbody>
                    </table></div>
                </div>

                {/* Recent Payments */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-50">
                        <h3 className="text-sm font-bold text-gray-800">Recent Payments</h3>
                        <Link href="/income" className="text-[10px] font-bold text-panze-purple uppercase tracking-widest hover:underline">
                            View Ledger →
                        </Link>
                    </div>
                    <div className="overflow-x-auto"><table className="w-full min-w-[500px]">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-50">
                                <th className="px-6 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Project</th>
                                <th className="px-6 py-2.5 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                                <th className="px-6 py-2.5 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {transactions.map((row, i) => (
                                <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-3">
                                        <p className="text-sm font-semibold text-gray-700">{row.projects?.name}</p>
                                        {row.projects?.clients?.name && (
                                            <Link href={`/clients/${row.projects?.client_id}`} className="text-[10px] text-panze-purple hover:underline">
                                                {row.projects.clients.name}
                                            </Link>
                                        )}
                                    </td>
                                    <td className="px-6 py-3 text-right text-sm font-bold text-gray-800 tabular-nums">${Number(row.amount).toLocaleString()}</td>
                                    <td className="px-6 py-3 text-right">
                                        <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-md ${row.is_verified ? 'text-green-700 bg-green-50' : 'text-amber-700 bg-amber-50'
                                            }`}>
                                            {row.is_verified ? '✓ Verified' : 'Pending'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {transactions.length === 0 && (
                                <tr><td colSpan={3} className="py-8 text-center text-xs text-gray-400">No transactions</td></tr>
                            )}
                        </tbody>
                    </table></div>
                </div>
            </div>

            {/* Modals */}
            <AddClientModal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} onSuccess={loadDashboard} />
            <NewEntryModal isOpen={isEntryModalOpen} onClose={() => setIsEntryModalOpen(false)} onSuccess={loadDashboard} />
        </div>
    );
};
