
import React from 'react';
import Link from 'next/link';
import { ProjectLedger } from '@/lib/types';

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
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ml-2 ${item.status === 'active' ? 'text-blue-700 bg-blue-50' :
                                        item.status === 'completed' ? 'text-green-700 bg-green-50' :
                                            'text-amber-700 bg-amber-50'
                                    }`}>
                                    {item.status}
                                </span>
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
                                    <p className="text-xs font-bold text-gray-800 tabular-nums">${total.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase">Paid</p>
                                    <p className="text-xs font-bold text-green-600 tabular-nums">${paid.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase">Remaining</p>
                                    <p className={`text-xs font-bold tabular-nums ${remaining > 0 ? 'text-red-500' : 'text-gray-300'}`}>
                                        ${remaining.toLocaleString()}
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
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50/50">
                            <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Project</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Client</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Date</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Contract</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Paid</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Remaining</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center w-28">Progress</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {data.map((item) => {
                            const total = Number(item.total_amount);
                            const paid = Number(item.paid_amount);
                            const remaining = Number(item.remaining_amount);
                            const pct = total > 0 ? (paid / total) * 100 : 0;

                            return (
                                <tr key={item.project_id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                                        {item.project_name}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link
                                            href={`/clients/${item.client_id}`}
                                            className="text-sm text-gray-600 hover:text-panze-purple font-medium transition-colors"
                                        >
                                            {item.client_name}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-md ${item.status === 'active' ? 'text-blue-700 bg-blue-50' :
                                            item.status === 'completed' ? 'text-green-700 bg-green-50' :
                                                'text-amber-700 bg-amber-50'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500 tabular-nums whitespace-nowrap">
                                        {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm font-bold text-gray-800 tabular-nums">
                                        ${total.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm font-medium text-green-600 tabular-nums">
                                        ${paid.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span className={`text-sm font-bold tabular-nums ${remaining > 0 ? 'text-red-500' : 'text-gray-300'}`}>
                                            ${remaining.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
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
                                    </td>
                                </tr>
                            );
                        })}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-4 py-16 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    No projects found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
};
