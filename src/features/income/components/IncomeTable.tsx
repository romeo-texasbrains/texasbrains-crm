
import React from 'react';
import Link from 'next/link';
import { IncomeRecord } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DataTable } from '@/components/ui/DataTable';

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
                                    {formatDate(item.payment_date)}
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
                                {formatCurrency(Number(item.amount), true)}
                            </div>
                            <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400">
                                {item.payment_method && <span className="capitalize">{item.payment_method}</span>}
                                {item.bank_accounts?.name && <span>{item.bank_accounts.name}</span>}
                                {item.projects?.agent?.full_name && (
                                    <Link
                                        href={`/performance/agent/${(item.projects as any).agent_id}`}
                                        className="text-panze-purple font-bold hover:underline"
                                    >
                                        {item.projects.agent.full_name}
                                    </Link>
                                )}
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
            <DataTable<IncomeRecord>
                columns={[
                    {
                        header: 'Date',
                        headerClassName: 'whitespace-nowrap',
                        className: 'text-sm text-gray-500 tabular-nums whitespace-nowrap',
                        cell: (item) => formatDate(item.payment_date)
                    },
                    {
                        header: 'Client',
                        cell: (item) => item.projects?.client?.name ? (
                            <Link
                                href={`/clients/${(item.projects as any)?.client_id || '#'}`}
                                className="text-sm font-semibold text-gray-800 hover:text-panze-purple transition-colors"
                            >
                                {item.projects.client.name}
                            </Link>
                        ) : (
                            <span className="text-sm text-gray-300">—</span>
                        )
                    },
                    {
                        header: 'Project',
                        className: 'text-sm text-gray-600',
                        cell: (item) => item.projects?.name || '—'
                    },
                    {
                        header: 'Amount',
                        headerClassName: 'text-right whitespace-nowrap',
                        className: 'text-right text-sm font-bold text-gray-800 tabular-nums',
                        cell: (item) => formatCurrency(Number(item.amount), true)
                    },
                    {
                        header: 'Method',
                        className: 'text-sm text-gray-500 capitalize',
                        cell: (item) => item.payment_method || '—'
                    },
                    {
                        header: 'Bank',
                        className: 'text-sm text-gray-500',
                        cell: (item) => item.bank_accounts?.name || '—'
                    },
                    {
                        header: 'Agent',
                        className: 'text-sm text-gray-500',
                        cell: (item) => item.projects?.agent?.full_name ? (
                            <Link
                                href={`/performance/agent/${(item.projects as any).agent_id}`}
                                className="hover:text-panze-purple hover:underline transition-colors"
                            >
                                {item.projects.agent.full_name}
                            </Link>
                        ) : '—'
                    },
                    {
                        header: 'Status',
                        headerClassName: 'text-center',
                        className: 'text-center',
                        cell: (item) => item.is_verified ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md">
                                ✓ Verified
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                                Pending
                            </span>
                        )
                    }
                ]}
                data={sorted}
                emptyMessage="No payment records"
            />
        </>
    );
};
