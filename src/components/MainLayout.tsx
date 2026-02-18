
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    User,
    CreditCard,
    FileText,
    BarChart3,
    ChevronRight,
    Settings
} from 'lucide-react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia('(display-mode: standalone)');
        setIsStandalone(mq.matches);
        const handler = (e: MediaQueryListEvent) => setIsStandalone(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    const navItems = [
        { name: 'Overview', href: '/', icon: LayoutDashboard },
        { name: 'Clients', href: '/clients', icon: User },
        { name: 'Income Ledger', href: '/income', icon: CreditCard },
        { name: 'Project Ledger', href: '/ledger', icon: FileText },
        { name: 'Performance', href: '/performance', icon: BarChart3 },
    ];

    return (
        <div className="flex h-screen md:h-auto md:min-h-screen bg-background text-foreground font-sans overflow-hidden md:overflow-visible">
            {/* Desktop Sidebar — hidden on mobile */}
            <aside className="hidden md:flex w-72 bg-white border-r border-gray-100 fixed h-full z-20 flex-col">
                <div className="px-8 py-10">
                    <div className="flex items-center gap-2 mb-12">
                        <div className="text-panze-purple flex items-center gap-1">
                            <span className="text-2xl font-black italic tracking-tighter">.texas</span>
                            <span className="text-xs font-bold text-gray-400 mt-2">brains.</span>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`panze-sidebar-item ${isActive ? 'active' : ''}`}
                                >
                                    <Icon size={18} />
                                    <span className="flex-1">{item.name}</span>
                                    {!isActive && <ChevronRight size={14} className="text-gray-300" />}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto px-8 py-10">
                    <div className="panze-sidebar-item hover:bg-gray-50 cursor-pointer">
                        <Settings size={18} />
                        <span>System Settings</span>
                    </div>
                </div>
            </aside>

            {/* Content Area */}
            <main className="flex-1 md:ml-72 h-dvh md:h-auto overflow-y-auto md:overflow-visible bg-background relative pb-16 md:pb-0 overflow-x-hidden">
                {/* Desktop Header — hidden on mobile */}
                <header className="hidden md:flex h-20 px-12 items-center justify-between absolute top-0 left-0 right-0 z-10 text-gray-800">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">
                            {navItems.find(item => item.href === pathname)?.name || 'Overview'}
                        </h1>
                    </div>
                </header>

                {/* Mobile Header */}
                <header className="md:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100/50 px-4 flex items-center justify-between"
                    style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
                >
                    <div className="text-panze-purple flex items-center gap-1 py-3">
                        <span className="text-lg font-black italic tracking-tighter">.texas</span>
                        <span className="text-[10px] font-bold text-gray-400 mt-1">brains.</span>
                    </div>
                    <h1 className="text-sm font-bold text-gray-700 py-3">
                        {navItems.find(item => item.href === pathname)?.name || 'Overview'}
                    </h1>
                </header>

                {/* Main Content — responsive padding */}
                <div className="pt-4 px-4 pb-4 md:pt-24 md:px-12 md:pb-12">
                    <div className="bg-white rounded-2xl md:rounded-[40px] border border-gray-100 p-4 md:p-10 min-h-[calc(100dvh-180px)] md:min-h-[calc(100vh-136px)] shadow-xl shadow-purple-500/5">
                        {children}
                    </div>
                </div>
            </main>

            {/* Mobile Bottom Tab Bar */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-gray-200/50"
                style={{ paddingBottom: 'env(safe-area-inset-bottom, 12px)' }}
            >
                <div className="flex items-center justify-around px-2 pt-2 pb-0">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[56px] ${isActive
                                    ? 'text-panze-purple'
                                    : 'text-gray-400'
                                    }`}
                            >
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                                <span className={`text-[9px] font-bold truncate max-w-[56px] ${isActive ? 'text-panze-purple' : 'text-gray-400'}`}>
                                    {item.name === 'Income Ledger' ? 'Income' :
                                        item.name === 'Project Ledger' ? 'Ledger' : item.name}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
