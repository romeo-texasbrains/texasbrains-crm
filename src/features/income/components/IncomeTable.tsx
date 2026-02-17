
import React from 'react';
import Link from 'next/link';
import { IncomeRecord } from '@/lib/types';

interface IncomeTableProps {
    data: IncomeRecord[];
}

export const IncomeTable: React.FC<IncomeTableProps> = ({ data }) => {
    // Sort by date descending — flat view, no month grouping
    const sorted = [...data].sort((a, b) =>
        new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
    );

    return (
        <>
            {/* ─── Mobile Card View ─── */}
            <div className="md:hidden space-y-2 p-2">
                {sorted.map((item: IncomeRecord) => {
                    const clientName = item.projects?.client?.name;
                    return (
                        <div key={item.id} className="bg-gray-50/50 rounded-xl p-3 border border-gray-100/80">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs text-gray-400 tabular-nums">
                                    {new Date(item.payment_date).toLocaleDateString('en-US', {
                                        month: 'short', day: 'numeric', year: '2-digit'
                                    })}
                                </span>
                                {item.is_verified ? (
                                    <span className="text-[9px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded">✓ Verified</span>
                                ) : (
                                    <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">Pending</span>
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                    {clientName ? (
                                        <Link
                                            href={`/clients/${(item.projects as any)?.client_id || '#'}`}
                                            className="text-sm font-semibold text-gray-800 hover:text-panze-purple transition-colors truncate block"
                                        >
                                            {clientName}
                                        </Link>
                                    ) : (
                                        <span className="text-sm text-gray-300">—</span>
                                    )}
                                    <p className="text-[11px] text-gray-400 truncate">{item.projects?.name || '—'}</p>
                                </div>
                                <p className="text-sm font-bold text-gray-800 tabular-nums ml-3 shrink-0">
                                    ${Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                            <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400">
                                {item.payment_method && <span className="capitalize">{item.payment_method}</span>}
                                {item.bank_accounts?.name && <span>{item.bank_accounts.name}</span>}
                                {item.projects?.agent?.full_name && <span>{item.projects.agent.full_name}</span>}
                            </div>
                        </div>
                    );
                })}
                {sorted.length === 0 && (
                    <div className="py-16 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                        No payment records
                    </div>
                )}
            </div>

            {/* ─── Desktop Table View ─── */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50/50">
                            <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Date</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Client</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Project</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right whitespace-nowrap">Amount</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Method</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Bank</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Agent</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {sorted.map((item: IncomeRecord) => {
                            const clientName = item.projects?.client?.name;

                            return (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-4 py-3 text-sm text-gray-500 tabular-nums whitespace-nowrap">
                                        {new Date(item.payment_date).toLocaleDateString('en-US', {
                                            month: 'short', day: 'numeric', year: '2-digit'
                                        })}
                                    </td>
                                    <td className="px-4 py-3">
                                        {clientName ? (
                                            <Link
                                                href={`/clients/${(item.projects as any)?.client_id || '#'}`}
                                                className="text-sm font-semibold text-gray-800 hover:text-panze-purple transition-colors"
                                            >
                                                {clientName}
                                            </Link>
                                        ) : (
                                            <span className="text-sm text-gray-300">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {item.projects?.name || '—'}
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm font-bold text-gray-800 tabular-nums">
                                        ${Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500 capitalize">
                                        {item.payment_method || '—'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {item.bank_accounts?.name || '—'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {item.projects?.agent?.full_name || '—'}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {item.is_verified ? (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md">
                                                ✓ Verified
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                                                Pending
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {sorted.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-4 py-16 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    No payment records
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
};
