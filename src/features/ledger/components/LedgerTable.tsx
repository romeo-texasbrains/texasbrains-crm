
import React from 'react';
import Link from 'next/link';
import { ProjectLedger } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DataTable } from '@/components/ui/DataTable';

interface LedgerTableProps {
    data: ProjectLedger[];
}

export const LedgerTable: React.FC<LedgerTableProps> = ({ data }) => {
    return (
        <>
            {/* ─── Mobile Card View ─── */}
            <div className="md:hidden space-y-3 p-2">
                {data.map((item) => {
                    const total = Number(item.total_amount);
                    const paid = Number(item.paid_amount);
                    const remaining = Number(item.remaining_amount);
                    const pct = total > 0 ? (paid / total) * 100 : 0;

                    return (
                        <div key={item.project_id} className="bg-gray-50/50 rounded-xl p-3 border border-gray-100/80">
                            <div className="flex items-center justify-between mb-2">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-gray-800 truncate">{item.project_name}</p>
                                    <Link
                                        href={`/clients/${item.client_id}`}
                                        className="text-[11px] text-gray-400 hover:text-panze-purple transition-colors"
                                    >
                                        {item.client_name}
                                    </Link>
                                </div>
                                <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${item.status === 'active' ? 'text-blue-700 bg-blue-50' :
                                        item.status === 'completed' ? 'text-green-700 bg-green-50' :
                                            'text-amber-700 bg-amber-50'
                                        }`}>
                                        {item.status}
                                    </span>
                                    {item.agent_name && (
                                        <Link
                                            href={`/performance/agent/${item.agent_id}`}
                                            className="text-[8px] font-black text-panze-purple uppercase tracking-tight hover:underline"
                                        >
                                            {item.agent_name}
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Payment progress */}
                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                                    <div
                                        className={`h-1.5 rounded-full transition-all ${pct >= 100 ? 'bg-green-500' :
                                            pct >= 50 ? 'bg-blue-500' : 'bg-orange-400'
                                            }`}
                                        style={{ width: `${Math.min(pct, 100)}%` }}
                                    />
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 tabular-nums">{pct.toFixed(0)}%</span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase">Contract</p>
                                    <p className="text-xs font-bold text-gray-800 tabular-nums">{formatCurrency(total)}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase">Paid</p>
                                    <p className="text-xs font-bold text-green-600 tabular-nums">{formatCurrency(paid)}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase">Remaining</p>
                                    <p className={`text-xs font-bold tabular-nums ${remaining > 0 ? 'text-red-500' : 'text-gray-300'}`}>
                                        {formatCurrency(remaining)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {data.length === 0 && (
                    <div className="py-16 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                        No projects found
                    </div>
                )}
            </div>

            {/* ─── Desktop Table View ─── */}
            <DataTable<ProjectLedger>
                columns={[
                    {
                        header: 'Project',
                        className: 'text-sm font-semibold text-gray-800',
                        accessorKey: 'project_name'
                    },
                    {
                        header: 'Client',
                        cell: (item) => (
                            <Link
                                href={`/clients/${item.client_id}`}
                                className="text-sm text-gray-600 hover:text-panze-purple font-medium transition-colors"
                            >
                                {item.client_name}
                            </Link>
                        )
                    },
                    {
                        header: 'Status',
                        cell: (item) => (
                            <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-md ${item.status === 'active' ? 'text-blue-700 bg-blue-50' :
                                item.status === 'completed' ? 'text-green-700 bg-green-50' :
                                    'text-amber-700 bg-amber-50'
                                }`}>
                                {item.status}
                            </span>
                        )
                    },
                    {
                        header: 'Agent',
                        cell: (item) => item.agent_name ? (
                            <Link
                                href={`/performance/agent/${item.agent_id}`}
                                className="text-[11px] font-black text-panze-purple hover:underline transition-colors uppercase tracking-widest"
                            >
                                {item.agent_name}
                            </Link>
                        ) : (
                            <span className="text-[10px] font-black text-gray-200 uppercase tracking-widest">Unassigned</span>
                        )
                    },
                    {
                        header: 'Date',
                        headerClassName: 'whitespace-nowrap',
                        className: 'text-sm text-gray-500 tabular-nums whitespace-nowrap',
                        cell: (item) => formatDate(item.created_at)
                    },
                    {
                        header: 'Contract',
                        headerClassName: 'text-right',
                        className: 'text-right text-sm font-bold text-gray-800 tabular-nums',
                        cell: (item) => formatCurrency(Number(item.total_amount))
                    },
                    {
                        header: 'Paid',
                        headerClassName: 'text-right',
                        className: 'text-right text-sm font-medium text-green-600 tabular-nums',
                        cell: (item) => formatCurrency(Number(item.paid_amount))
                    },
                    {
                        header: 'Remaining',
                        headerClassName: 'text-right',
                        className: 'text-right',
                        cell: (item) => {
                            const remaining = Number(item.remaining_amount);
                            return (
                                <span className={`text-sm font-bold tabular-nums ${remaining > 0 ? 'text-red-500' : 'text-gray-300'}`}>
                                    {formatCurrency(remaining)}
                                </span>
                            );
                        }
                    },
                    {
                        header: 'Progress',
                        headerClassName: 'text-center w-28',
                        cell: (item) => {
                            const total = Number(item.total_amount);
                            const pct = total > 0 ? (Number(item.paid_amount) / total) * 100 : 0;
                            return (
                                <div className="flex items-center gap-2 justify-center">
                                    <div className="w-14 bg-gray-100 rounded-full h-1.5">
                                        <div
                                            className={`h-1.5 rounded-full transition-all ${pct >= 100 ? 'bg-green-500' :
                                                pct >= 50 ? 'bg-blue-500' : 'bg-orange-400'
                                                }`}
                                            style={{ width: `${Math.min(pct, 100)}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 tabular-nums min-w-[28px] text-right">
                                        {pct.toFixed(0)}%
                                    </span>
                                </div>
                            );
                        }
                    }
                ]}
                data={data}
                emptyMessage="No projects found"
            />
        </>
    );
};
