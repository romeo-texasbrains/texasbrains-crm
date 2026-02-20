'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getClients } from '../api';
import { Client } from '@/lib/types';
import { UserPlus, Mail, Phone, Calendar, Loader2, Building2, Search, ChevronRight, User, DollarSign } from 'lucide-react';
import { AddClientModal } from './AddClientModal';
import { formatCurrency } from '@/lib/utils';

import useSWR from 'swr';

export const ClientsList = () => {
    const { data: clientsData, isLoading, mutate } = useSWR('clients-list', getClients, {
        revalidateOnFocus: false,
        revalidateIfStale: true,
    });
    const clients = clientsData || [];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredClients = clients.filter(c => {
        const q = searchQuery.toLowerCase();
        return (
            c.name.toLowerCase().includes(q) ||
            (c.company || '').toLowerCase().includes(q) ||
            (c.email || '').toLowerCase().includes(q) ||
            (c.phone || '').toLowerCase().includes(q) ||
            (c.industry || '').toLowerCase().includes(q)
        );
    });

    if (isLoading && clients.length === 0) {
        return (
            <div className="h-[400px] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 text-panze-purple animate-spin" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Synchronizing Contacts</p>
            </div>
        );
    }

    return (
        <div className="space-y-5 md:space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-xl md:text-2xl font-black text-gray-800 tracking-tight text-panze-primary">Client Directory</h3>
                        <div className="w-1.5 h-1.5 rounded-full bg-panze-primary animate-pulse" />
                    </div>
                    <p className="text-xs md:text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Management Console</p>
                </div>
                <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-[140px] max-w-[240px]">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search clients..."
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 text-sm font-medium text-gray-700 outline-none focus:border-panze-purple focus:bg-white transition-all"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="panze-btn-primary"
                    >
                        <UserPlus size={16} />
                        <span className="hidden sm:inline">Onboard Client</span>
                        <span className="sm:hidden">Add</span>
                    </button>
                </div>
            </div>

            <AddClientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => mutate()}
            />

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {filteredClients.map((client) => (
                    <Link
                        key={client.id}
                        href={`/clients/${client.id}`}
                        className="block bg-white rounded-xl border border-gray-100 p-4 hover:border-panze-purple/30 transition-all active:scale-[0.98]"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-panze-purple font-black text-sm shrink-0">
                                    {(client as any).name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-800 truncate">{client.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {(client as any).assigned_agent && (
                                            <Link
                                                href={`/performance/agent/${(client as any).assigned_agent.id}`}
                                                className="text-[9px] font-black text-panze-purple uppercase tracking-widest bg-purple-50 px-1.5 py-0.5 rounded-md hover:bg-panze-purple hover:text-white transition-colors"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {(client as any).assigned_agent.full_name}
                                            </Link>
                                        )}
                                        {(client as any).company && (
                                            <p className="text-[10px] text-gray-400 flex items-center gap-1 truncate">
                                                <Building2 size={10} /> {(client as any).company}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`panze-badge text-[9px] ${client.status === 'active' ? 'panze-badge-success' :
                                    client.status === 'inactive' ? 'panze-badge-warning' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                    {client.status}
                                </span>
                                <ChevronRight size={14} className="text-gray-300" />
                            </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-gray-50 pt-3">
                            <div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">CLTV (Life)</p>
                                <p className="text-xs font-bold text-gray-800">{formatCurrency(client.cltv || 0)}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Remaining</p>
                                <p className={`text-xs font-bold ${(client.remaining_balance || 0) > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                                    {formatCurrency(client.remaining_balance || 0)}
                                </p>
                            </div>
                        </div>

                        <div className="mt-2 flex items-center justify-between text-[10px] text-gray-400">
                            {client.email && (
                                <span className="flex items-center gap-1 truncate max-w-[140px]">
                                    <Mail size={10} /> {client.email}
                                </span>
                            )}
                            {client.phone && (
                                <span className="flex items-center gap-1">
                                    <Phone size={10} /> {client.phone}
                                </span>
                            )}
                        </div>
                    </Link>
                ))}
                {filteredClients.length === 0 && (
                    <div className="flex flex-col items-center gap-4 py-16 opacity-30">
                        <UserPlus size={48} className="text-gray-400" />
                        <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
                            {searchQuery ? 'No clients match your search' : 'No Clients Onboarded'}
                        </p>
                    </div>
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="border-b border-gray-50 bg-gray-50/30">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Client</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Industry</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Assigned Agent</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">CLTV Value</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Remaining</th>
                                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredClients.map((client) => (
                                <tr key={client.id} className="group hover:bg-gray-50/50 transition-all duration-300">
                                    <td className="px-8 py-5">
                                        <Link href={`/clients/${client.id}`} className="flex items-center gap-4">
                                            <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center text-panze-purple group-hover:bg-panze-purple group-hover:text-white transition-all duration-300 font-black text-base shrink-0">
                                                {client.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800 group-hover:text-panze-purple transition-colors">{client.name}</p>
                                                {client.company && (
                                                    <p className="text-[10px] font-semibold text-gray-400 flex items-center gap-1">
                                                        <Building2 size={10} /> {client.company}
                                                    </p>
                                                )}
                                                {!client.company && (
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                                        <Calendar size={10} /> Since {new Date(client.created_at).getFullYear()}
                                                    </p>
                                                )}
                                            </div>
                                        </Link>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                                <Mail size={12} className="text-gray-300" />
                                                {client.email || '—'}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                                                <Phone size={12} className="text-gray-200" />
                                                {client.phone || '—'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-sm text-gray-500 font-medium">
                                        {client.industry || '—'}
                                    </td>
                                    <td className="px-8 py-5">
                                        {(client as any).assigned_agent ? (
                                            <Link
                                                href={`/performance/agent/${(client as any).assigned_agent.id}`}
                                                className="flex items-center gap-2 group/agent"
                                            >
                                                <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover/agent:bg-purple-50 group-hover/agent:text-panze-purple transition-colors">
                                                    <User size={12} />
                                                </div>
                                                <span className="text-xs font-black text-gray-700 group-hover/agent:text-panze-purple transition-colors">
                                                    {(client as any).assigned_agent.full_name?.toUpperCase()}
                                                </span>
                                            </Link>
                                        ) : (
                                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.1em]">Unassigned</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-800">{formatCurrency(client.cltv || 0)}</span>
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Life Value</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className={`text-sm font-bold ${(client.remaining_balance || 0) > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                                                {formatCurrency(client.remaining_balance || 0)}
                                            </span>
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Outstanding</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className={`panze-badge ${client.status === 'active' ? 'panze-badge-success' :
                                                client.status === 'inactive' ? 'panze-badge-warning' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {client.status}
                                            </span>
                                            <Link href={`/clients/${client.id}`}>
                                                <ChevronRight size={16} className="text-gray-300 group-hover:text-panze-purple transition-colors" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredClients.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-10 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <UserPlus size={48} className="text-gray-400" />
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
                                                {searchQuery ? 'No clients match your search' : 'No Clients Onboarded'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
