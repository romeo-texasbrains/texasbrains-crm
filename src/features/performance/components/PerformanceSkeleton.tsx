import React from 'react';

export const PerformanceSkeleton = () => {
    return (
        <div className="space-y-5 md:space-y-8 animate-in fade-in duration-700 w-full">
            {/* Header Skeleton */}
            <div className="flex flex-col gap-4">
                <div>
                    <div className="h-8 md:h-10 w-48 bg-gray-100 rounded-lg animate-pulse" />
                    <div className="h-4 w-32 bg-gray-50 rounded-md animate-pulse mt-2" />
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                    <div className="h-10 md:h-11 w-40 bg-gray-100 rounded-xl animate-pulse" />
                    <div className="h-10 md:h-11 w-12 bg-gray-100 rounded-xl animate-pulse" />
                    <div className="h-10 md:h-11 w-32 bg-gray-100 rounded-xl animate-pulse" />
                </div>
            </div>

            {/* Period Tabs Skeleton */}
            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl w-fit">
                <div className="h-8 md:h-9 w-16 bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-8 md:h-9 w-16 bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-8 md:h-9 w-16 bg-gray-100 rounded-lg animate-pulse" />
            </div>

            {/* 3 Metric Cards Skeleton */}
            <div className="grid grid-cols-3 gap-2 md:gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-3 md:p-5">
                        <div className="flex items-center justify-between mb-2 md:mb-3">
                            <div className="h-4 w-16 bg-gray-100 rounded-md animate-pulse" />
                            {i === 1 && <div className="h-4 w-8 bg-gray-100 rounded-md animate-pulse" />}
                        </div>
                        <div className="h-6 md:h-8 w-24 bg-gray-100 rounded-lg animate-pulse" />
                        <div className="h-2 w-full bg-gray-50 rounded-full animate-pulse mt-3 md:mt-4" />
                        <div className="h-3 w-3/4 bg-gray-50 rounded-md animate-pulse mt-1 md:mt-2" />
                    </div>
                ))}
            </div>

            {/* Leaderboard Table Skeleton */}
            <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-4 md:p-6 pb-0 overflow-hidden">
                <div className="h-5 w-48 bg-gray-100 rounded-md animate-pulse mb-6" />

                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center justify-between pb-4 border-b border-gray-50 last:border-0">
                            <div className="flex items-center gap-4">
                                <div className="h-4 w-4 bg-gray-100 rounded animate-pulse" />
                                <div className="h-8 w-8 rounded-full bg-gray-100 animate-pulse" />
                                <div className="h-4 w-32 bg-gray-100 rounded-md animate-pulse" />
                            </div>
                            <div className="h-4 w-24 bg-gray-100 rounded-md animate-pulse hidden md:block" />
                            <div className="h-4 w-24 bg-gray-100 rounded-md animate-pulse hidden md:block" />
                            <div className="h-4 w-40 bg-gray-100 rounded-md animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
