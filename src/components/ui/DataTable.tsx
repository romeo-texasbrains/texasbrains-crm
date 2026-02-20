import React from 'react';

export interface ColumnDef<T> {
    header: string | React.ReactNode;
    accessorKey?: keyof T;
    cell?: (row: T) => React.ReactNode;
    className?: string;
    headerClassName?: string;
}

export interface DataTableProps<T> {
    columns: ColumnDef<T>[];
    data: T[];
    emptyMessage?: string;
    minWidth?: string;
}

export function DataTable<T>({ columns, data, emptyMessage = 'No records found', minWidth = 'min-w-[700px]' }: DataTableProps<T>) {
    return (
        <div className="hidden md:block overflow-x-auto">
            <table className={`w-full text-left border-collapse ${minWidth}`}>
                <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/50">
                        {columns.map((col, idx) => (
                            <th
                                key={idx}
                                className={`px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest ${col.headerClassName || ''}`}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-gray-50/50 transition-colors group">
                            {columns.map((col, colIndex) => (
                                <td
                                    key={colIndex}
                                    className={`px-4 py-3 ${col.className || ''}`}
                                >
                                    {col.cell
                                        ? col.cell(row)
                                        : col.accessorKey
                                            ? (row[col.accessorKey] as React.ReactNode) || '—'
                                            : null}
                                </td>
                            ))}
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="px-4 py-16 text-center text-xs font-bold text-gray-400 uppercase tracking-widest"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
