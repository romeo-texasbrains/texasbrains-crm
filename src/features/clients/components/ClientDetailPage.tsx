
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
    getClientDetail,
    getClientProjects,
    getClientPayments,
    getClientSummary,
    updateClient,
} from '../client-detail-api';
import { getAgents } from '@/features/performance/api';
import {
    ClientWithAgent,
    ClientProject,
    ClientPayment,
    ClientSummaryStats,
    Profile,
} from '@/lib/types';
import {
    ArrowLeft, Building2, Mail, Phone, MapPin, User,
    Calendar, Briefcase, CreditCard, DollarSign,
    Plus, Edit3, Check, X, Loader2, ChevronDown,
    Clock, CheckCircle, AlertCircle, Tag
} from 'lucide-react';
import { AddProjectModal } from '@/features/ledger/components/AddProjectModal';
import { AddPaymentModal } from '@/features/income/components/AddPaymentModal';

type Tab = 'overview' | 'projects' | 'payments';

interface ClientDetailPageProps {
    clientId: string;
}

export const ClientDetailPage: React.FC<ClientDetailPageProps> = ({ clientId }) => {
    const [client, setClient] = useState<ClientWithAgent | null>(null);
    const [projects, setProjects] = useState<ClientProject[]>([]);
    const [payments, setPayments] = useState<ClientPayment[]>([]);
    const [summary, setSummary] = useState<ClientSummaryStats | null>(null);
    const [agents, setAgents] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Partial<ClientWithAgent>>({});
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const [c, p, pay, s, a] = await Promise.all([
                getClientDetail(clientId),
                getClientProjects(clientId),
                getClientPayments(clientId),
                getClientSummary(clientId),
                getAgents(),
            ]);
            setClient(c);
            setProjects(p);
            setPayments(pay);
            setSummary(s);
            setAgents(a);
        } catch (err) {
            console.error('Failed to load client detail:', err);
        } finally {
            setLoading(false);
        }
    }, [clientId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSave = async () => {
        if (!client) return;
        setSaving(true);
        try {
            await updateClient(client.id, {
                name: editForm.name || client.name,
                email: editForm.email ?? client.email,
                phone: editForm.phone ?? client.phone,
                company: editForm.company ?? client.company,
                industry: editForm.industry ?? client.industry,
                source: editForm.source ?? client.source,
                address: editForm.address ?? client.address,
                assigned_agent_id: editForm.assigned_agent_id ?? client.assigned_agent_id,
                notes: editForm.notes ?? client.notes,
                status: editForm.status ?? client.status,
            });
            await loadData();
            setIsEditing(false);
        } catch (err) {
            console.error('Failed to update client', err);
        } finally {
            setSaving(false);
        }
    };

    const startEditing = () => {
        if (client) {
            setEditForm({ ...client });
            setIsEditing(true);
        }
    };

    if (loading) {
        return (
            <div className="h-[600px] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-panze-purple animate-spin" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Loading Client Intelligence</p>
            </div>
        );
    }

    if (!client) {
        return (
            <div className="h-[400px] flex flex-col items-center justify-center gap-4">
                <AlertCircle className="w-12 h-12 text-gray-300" />
                <p className="text-sm font-bold text-gray-400">Client not found</p>
                <Link href="/clients" className="panze-btn-secondary text-xs">← Back to Clients</Link>
            </div>
        );
    }

    const statusColors: Record<string, string> = {
        active: 'panze-badge-success',
        inactive: 'panze-badge-warning',
        churned: 'bg-red-100 text-red-700',
    };

    const projectStatusColors: Record<string, string> = {
        active: 'panze-badge-success',
        completed: 'panze-badge-info',
        cancelled: 'bg-red-100 text-red-700',
        on_hold: 'panze-badge-warning',
    };

    const tabs: { key: Tab; label: string; count?: number }[] = [
        { key: 'overview', label: 'Overview' },
        { key: 'projects', label: 'Projects', count: projects.length },
        { key: 'payments', label: 'Payments', count: payments.length },
    ];

    return (
        <div className="space-y-5 md:space-y-8 animate-in fade-in duration-700">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
                <Link href="/clients" className="text-gray-400 hover:text-panze-purple transition-colors font-bold flex items-center gap-1">
                    <ArrowLeft size={14} />
                    Clients
                </Link>
                <span className="text-gray-300">/</span>
                <span className="text-gray-700 font-bold">{client.name}</span>
            </div>

            {/* ── Client Header Card ── */}
            <div className="bg-white rounded-xl md:rounded-[32px] border border-gray-100 shadow-sm p-4 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-panze-gradient" />

                {!isEditing ? (
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                        {/* Left: Client info */}
                        <div className="flex items-start gap-3 md:gap-5">
                            <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-panze-gradient flex items-center justify-center text-white font-black text-lg md:text-2xl shrink-0 shadow-lg shadow-purple-200">
                                {client.name.charAt(0)}
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-lg md:text-2xl font-black text-gray-800 tracking-tight">{client.name}</h1>
                                    <span className={`panze-badge ${statusColors[client.status] || 'panze-badge-info'}`}>
                                        {client.status}
                                    </span>
                                </div>
                                {client.company && (
                                    <div className="flex items-center gap-2 text-sm text-gray-500 font-semibold">
                                        <Building2 size={14} className="text-gray-400" />
                                        {client.company}
                                        {client.industry && <span className="text-gray-300">• {client.industry}</span>}
                                    </div>
                                )}
                                <div className="flex items-center gap-4 flex-wrap">
                                    {client.email && (
                                        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
                                            <Mail size={12} /> {client.email}
                                        </div>
                                    )}
                                    {client.phone && (
                                        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
                                            <Phone size={12} /> {client.phone}
                                        </div>
                                    )}
                                    {client.address && (
                                        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
                                            <MapPin size={12} /> {client.address}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 flex-wrap mt-1">
                                    {client.source && (
                                        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
                                            <Tag size={12} /> Source: {client.source}
                                        </div>
                                    )}
                                    {client.assigned_agent && (
                                        <div className="flex items-center gap-1.5 text-xs text-panze-purple font-bold">
                                            <User size={12} /> {client.assigned_agent.full_name}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
                                        <Calendar size={12} /> Since {new Date(client.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-3 shrink-0">
                            <button onClick={startEditing} className="panze-btn-secondary flex items-center gap-2">
                                <Edit3 size={14} /> <span>Edit</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    /* ── Inline Edit Form ── */
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-800">Edit Client</h3>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsEditing(false)} className="panze-btn-secondary flex items-center gap-2">
                                    <X size={14} /> <span>Cancel</span>
                                </button>
                                <button onClick={handleSave} disabled={saving} className="panze-btn-primary !min-h-[40px] !py-2 !px-6">
                                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                    <span>{saving ? 'Saving...' : 'Save'}</span>
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                                { key: 'name', label: 'Name', placeholder: 'Client name' },
                                { key: 'company', label: 'Company', placeholder: 'Company name' },
                                { key: 'email', label: 'Email', placeholder: 'email@example.com' },
                                { key: 'phone', label: 'Phone', placeholder: '+1 (555) 000-0000' },
                                { key: 'industry', label: 'Industry', placeholder: 'e.g. Technology' },
                                { key: 'source', label: 'Source', placeholder: 'e.g. Referral' },
                                { key: 'address', label: 'Address', placeholder: 'Street, City' },
                            ].map(field => (
                                <div key={field.key}>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">{field.label}</label>
                                    <input
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 outline-none focus:border-panze-purple focus:ring-1 focus:ring-panze-purple/20 transition-all"
                                        value={(editForm as any)[field.key] || ''}
                                        onChange={e => setEditForm(prev => ({ ...prev, [field.key]: e.target.value || null }))}
                                        placeholder={field.placeholder}
                                    />
                                </div>
                            ))}
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Status</label>
                                <select
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 outline-none focus:border-panze-purple transition-all"
                                    value={editForm.status || 'active'}
                                    onChange={e => setEditForm(prev => ({ ...prev, status: e.target.value as any }))}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="churned">Churned</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Assigned Agent</label>
                                <select
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 outline-none focus:border-panze-purple transition-all"
                                    value={editForm.assigned_agent_id || ''}
                                    onChange={e => setEditForm(prev => ({ ...prev, assigned_agent_id: e.target.value || null }))}
                                >
                                    <option value="">Unassigned</option>
                                    {agents.map(a => (
                                        <option key={a.id} value={a.id}>{a.full_name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Notes</label>
                            <textarea
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 outline-none focus:border-panze-purple focus:ring-1 focus:ring-panze-purple/20 transition-all"
                                rows={3}
                                value={editForm.notes || ''}
                                onChange={e => setEditForm(prev => ({ ...prev, notes: e.target.value || null }))}
                                placeholder="General notes about this client..."
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* ── Quick Action Bar ── */}
            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                <button onClick={() => setIsProjectModalOpen(true)} className="panze-btn-primary !min-h-[40px] !py-2 !px-4 md:!px-6">
                    <Plus size={14} /> <span>Add Project</span>
                </button>
                <button onClick={() => setIsPaymentModalOpen(true)} className="panze-btn-secondary flex items-center gap-2">
                    <CreditCard size={14} /> <span>Record Payment</span>
                </button>
            </div>

            {/* ── Tabs ── */}
            <div className="flex items-center gap-1 bg-gray-50 p-1 md:p-1.5 rounded-xl md:rounded-2xl border border-gray-100 w-fit overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-3 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[11px] md:text-xs font-bold transition-all flex items-center gap-1.5 md:gap-2 whitespace-nowrap ${activeTab === tab.key
                            ? 'bg-white shadow-sm border border-gray-100 text-gray-800'
                            : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        {tab.label}
                        {tab.count !== undefined && (
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${activeTab === tab.key ? 'bg-purple-100 text-panze-purple' : 'bg-gray-100 text-gray-400'
                                }`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── Tab Content ── */}
            <div className="animate-in fade-in duration-500">
                {activeTab === 'overview' && summary && (
                    <div className="space-y-8">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
                            {[
                                { label: 'Total Projects', value: summary.total_projects, icon: Briefcase, color: 'bg-blue-50 text-blue-600' },
                                { label: 'Active Projects', value: summary.active_projects, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
                                { label: 'Contract Value', value: `$${summary.total_contract_value.toLocaleString()}`, icon: DollarSign, color: 'bg-purple-50 text-panze-purple' },
                                { label: 'Total Paid', value: `$${summary.total_paid.toLocaleString()}`, icon: Check, color: 'bg-emerald-50 text-emerald-600' },
                                { label: 'Outstanding', value: `$${summary.total_outstanding.toLocaleString()}`, icon: Clock, color: 'bg-orange-50 text-orange-600' },
                                { label: 'Payments', value: summary.total_payments, icon: CreditCard, color: 'bg-indigo-50 text-indigo-600' },
                            ].map(stat => (
                                <div key={stat.label} className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-3 md:p-5 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300">
                                    <div className={`w-7 h-7 md:w-9 md:h-9 rounded-lg md:rounded-xl ${stat.color} flex items-center justify-center mb-2 md:mb-3`}>
                                        <stat.icon size={14} />
                                    </div>
                                    <p className="text-base md:text-xl font-black text-gray-800 tabular-nums">{stat.value}</p>
                                    <p className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Notes section */}
                        {client.notes && (
                            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Notes</h4>
                                <p className="text-sm text-gray-600 whitespace-pre-wrap">{client.notes}</p>
                            </div>
                        )}

                        {/* Recent Projects & Payments side by side */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                            {/* Recent Projects */}
                            <div className="bg-white rounded-xl md:rounded-[24px] border border-gray-100 p-4 md:p-6 overflow-hidden">
                                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-50">
                                    <h4 className="text-sm font-bold text-gray-800">Recent Projects</h4>
                                    {projects.length > 3 && (
                                        <button onClick={() => setActiveTab('projects')} className="text-[10px] font-black text-panze-purple uppercase tracking-widest">
                                            View All →
                                        </button>
                                    )}
                                </div>
                                {projects.slice(0, 3).map(p => (
                                    <div key={p.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                        <div>
                                            <p className="text-sm font-bold text-gray-700">{p.name}</p>
                                            <p className="text-[10px] font-bold text-gray-400">{p.agent?.full_name || 'Unassigned'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-gray-800">${Number(p.total_amount).toLocaleString()}</p>
                                            <span className={`panze-badge text-[10px] ${projectStatusColors[p.status]}`}>
                                                {p.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {projects.length === 0 && (
                                    <p className="text-xs text-gray-400 text-center py-8 font-bold uppercase tracking-widest">No projects yet</p>
                                )}
                            </div>

                            {/* Recent Payments */}
                            <div className="bg-white rounded-xl md:rounded-[24px] border border-gray-100 p-4 md:p-6 overflow-hidden">
                                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-50">
                                    <h4 className="text-sm font-bold text-gray-800">Recent Payments</h4>
                                    {payments.length > 3 && (
                                        <button onClick={() => setActiveTab('payments')} className="text-[10px] font-black text-panze-purple uppercase tracking-widest">
                                            View All →
                                        </button>
                                    )}
                                </div>
                                {payments.slice(0, 3).map(p => (
                                    <div key={p.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                        <div>
                                            <p className="text-sm font-bold text-gray-700">${Number(p.amount).toLocaleString()}</p>
                                            <p className="text-[10px] font-bold text-gray-400">{p.project_name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-gray-500">
                                                {new Date(p.payment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                            <span className={`panze-badge text-[10px] ${p.is_verified ? 'panze-badge-success' : 'panze-badge-warning'}`}>
                                                {p.is_verified ? 'Verified' : 'Pending'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {payments.length === 0 && (
                                    <p className="text-xs text-gray-400 text-center py-8 font-bold uppercase tracking-widest">No payments yet</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'projects' && (
                    <div className="bg-white rounded-xl md:rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                        {/* Mobile project cards */}
                        <div className="md:hidden divide-y divide-gray-50">
                            {projects.map(p => {
                                const paidPercent = Number(p.total_amount) > 0 ? (p.paid_amount / Number(p.total_amount)) * 100 : 0;
                                return (
                                    <div key={p.id} className="p-3">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-bold text-gray-700 truncate">{p.name}</p>
                                                <p className="text-[10px] text-gray-400">{p.agent?.full_name || 'Unassigned'}</p>
                                            </div>
                                            <span className={`panze-badge text-[9px] ${projectStatusColors[p.status]} shrink-0 ml-2`}>{p.status}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="flex-1 bg-gray-100 rounded-full h-1">
                                                <div className="bg-green-500 h-1 rounded-full" style={{ width: `${Math.min(paidPercent, 100)}%` }} />
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400 tabular-nums">{paidPercent.toFixed(0)}%</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-center">
                                            <div><p className="text-[8px] font-bold text-gray-400 uppercase">Contract</p><p className="text-xs font-bold text-gray-800 tabular-nums">${Number(p.total_amount).toLocaleString()}</p></div>
                                            <div><p className="text-[8px] font-bold text-gray-400 uppercase">Paid</p><p className="text-xs font-bold text-green-600 tabular-nums">${p.paid_amount.toLocaleString()}</p></div>
                                            <div><p className="text-[8px] font-bold text-gray-400 uppercase">Due</p><p className="text-xs font-bold text-orange-600 tabular-nums">${p.remaining_amount.toLocaleString()}</p></div>
                                        </div>
                                    </div>
                                );
                            })}
                            {projects.length === 0 && (
                                <div className="py-12 text-center text-xs text-gray-400 font-bold uppercase tracking-widest">No projects found</div>
                            )}
                        </div>
                        {/* Desktop project table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full min-w-[700px]">
                                <thead>
                                    <tr className="border-b border-gray-50 bg-gray-50/30">
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Project</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Agent</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Contract</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Paid</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Remaining</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {projects.map(p => {
                                        const paidPercent = Number(p.total_amount) > 0 ? (p.paid_amount / Number(p.total_amount)) * 100 : 0;
                                        return (
                                            <tr key={p.id} className="group hover:bg-gray-50/50 transition-all">
                                                <td className="px-6 py-4"><p className="text-sm font-bold text-gray-700">{p.name}</p><p className="text-[10px] text-gray-400 font-semibold">{new Date(p.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p></td>
                                                <td className="px-6 py-4 text-sm text-gray-500 font-medium">{p.agent?.full_name || '—'}</td>
                                                <td className="px-6 py-4 text-right text-sm font-black text-gray-800">${Number(p.total_amount).toLocaleString()}</td>
                                                <td className="px-6 py-4 text-right"><p className="text-sm font-bold text-green-600">${p.paid_amount.toLocaleString()}</p><div className="w-full bg-gray-100 rounded-full h-1 mt-1.5"><div className="bg-green-500 h-1 rounded-full transition-all" style={{ width: `${Math.min(paidPercent, 100)}%` }} /></div></td>
                                                <td className="px-6 py-4 text-right text-sm font-bold text-orange-600">${p.remaining_amount.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-right"><span className={`panze-badge ${projectStatusColors[p.status]}`}>{p.status}</span></td>
                                            </tr>
                                        );
                                    })}
                                    {projects.length === 0 && (<tr><td colSpan={6} className="px-6 py-16 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">No projects found for this client</td></tr>)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'payments' && (
                    <div className="bg-white rounded-xl md:rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                        {/* Mobile payment cards */}
                        <div className="md:hidden divide-y divide-gray-50">
                            {payments.map(p => (
                                <div key={p.id} className="p-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-gray-400 tabular-nums">{new Date(p.payment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}</span>
                                        <span className={`panze-badge text-[9px] ${p.is_verified ? 'panze-badge-success' : 'panze-badge-warning'}`}>{p.is_verified ? '✓ Verified' : 'Pending'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-gray-500 truncate flex-1">{p.project_name}</p>
                                        <p className="text-sm font-bold text-gray-800 tabular-nums ml-3">${Number(p.amount).toLocaleString()}</p>
                                    </div>
                                    {(p.payment_method || p.note) && (
                                        <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                                            {p.payment_method && <span className="capitalize">{p.payment_method}</span>}
                                            {p.note && <span className="truncate">{p.note}</span>}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {payments.length === 0 && (
                                <div className="py-12 text-center text-xs text-gray-400 font-bold uppercase tracking-widest">No payments found</div>
                            )}
                        </div>
                        {/* Desktop payment table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full min-w-[700px]">
                                <thead>
                                    <tr className="border-b border-gray-50 bg-gray-50/30">
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Project</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Method</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Note</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {payments.map(p => (
                                        <tr key={p.id} className="group hover:bg-gray-50/50 transition-all">
                                            <td className="px-6 py-4 text-sm font-bold text-gray-600">{new Date(p.payment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-700">{p.project_name}</td>
                                            <td className="px-6 py-4 text-right text-sm font-black text-gray-800">${Number(p.amount).toLocaleString()}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 font-medium">{p.payment_method || '—'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-400 truncate max-w-[200px]">{p.note || '—'}</td>
                                            <td className="px-6 py-4 text-right"><span className={`panze-badge ${p.is_verified ? 'panze-badge-success' : 'panze-badge-warning'}`}>{p.is_verified ? 'Verified' : 'Pending'}</span></td>
                                        </tr>
                                    ))}
                                    {payments.length === 0 && (<tr><td colSpan={6} className="px-6 py-16 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">No payments found for this client</td></tr>)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Modals ── */}
            <AddProjectModal
                isOpen={isProjectModalOpen}
                onClose={() => setIsProjectModalOpen(false)}
                onSuccess={loadData}
                preselectedClientId={clientId}
            />
            <AddPaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onSuccess={loadData}
                preselectedClientId={clientId}
            />
        </div>
    );
};
