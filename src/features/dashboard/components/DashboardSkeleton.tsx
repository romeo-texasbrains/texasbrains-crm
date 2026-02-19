import React from 'react';

export const DashboardSkeleton = () => {
    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
            {/* Quick Actions Skeleton */}
            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                <div className="h-9 w-32 bg-gray-100 rounded-xl animate-pulse"></div>
                <div className="h-9 w-32 bg-gray-100 rounded-xl animate-pulse"></div>
            </div>

            {/* 4 Stat Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 border border-gray-50 flex items-center justify-between shadow-sm">
                        <div className="space-y-3 w-full">
                            <div className="flex justify-between items-center w-full">
                                <div className="h-4 w-20 bg-gray-100 rounded animate-pulse"></div>
                                <div className="h-8 w-8 bg-gray-100 rounded-[10px] animate-pulse"></div>
                            </div>
                            <div className="h-8 w-32 bg-gray-100 rounded-lg animate-pulse"></div>
                            <div className="h-3 w-24 bg-gray-50 rounded animate-pulse mt-1"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts + Outstanding Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-[290px] md:h-[370px] animate-pulse flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                        <div className="h-5 w-32 bg-gray-100 rounded"></div>
                        <div className="h-4 w-12 bg-gray-100 rounded"></div>
                    </div>
                    <div className="w-full flex items-end justify-between h-[200px] mt-6 gap-2">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="bg-gray-100 rounded-t-lg w-full" style={{ height: `${Math.random() * 60 + 20}%` }}></div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-[290px] md:h-[370px]">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-50">
                        <div className="h-5 w-40 bg-gray-100 rounded animate-pulse"></div>
                        <div className="h-4 w-16 bg-gray-100 rounded animate-pulse"></div>
                    </div>
                    <div className="p-0">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 animate-pulse"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 w-24 bg-gray-100 rounded animate-pulse"></div>
                                        <div className="h-3 w-16 bg-gray-50 rounded animate-pulse"></div>
                                    </div>
                                </div>
                                <div className="space-y-2 text-right flex flex-col items-end">
                                    <div className="h-4 w-20 bg-gray-100 rounded animate-pulse"></div>
                                    <div className="h-1 w-16 bg-gray-50 rounded-full animate-pulse"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tables Row Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-50">
                        <div className="h-5 w-32 bg-gray-100 rounded animate-pulse"></div>
                        <div className="h-3 w-16 bg-gray-100 rounded animate-pulse"></div>
                    </div>
                    <div className="p-0">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex justify-between items-center px-6 py-4 border-b border-gray-50">
                                <div className="h-4 w-28 bg-gray-100 rounded animate-pulse"></div>
                                <div className="h-4 w-20 bg-gray-100 rounded animate-pulse"></div>
                                <div className="h-4 w-16 bg-gray-100 rounded animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-50">
                        <div className="h-5 w-32 bg-gray-100 rounded animate-pulse"></div>
                        <div className="h-3 w-16 bg-gray-100 rounded animate-pulse"></div>
                    </div>
                    <div className="p-0">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex justify-between items-center px-6 py-4 border-b border-gray-50">
                                <div className="h-4 w-32 bg-gray-100 rounded animate-pulse"></div>
                                <div className="h-4 w-20 bg-gray-100 rounded animate-pulse"></div>
                                <div className="h-4 w-16 bg-gray-100 rounded animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
