import { supabase } from '@/lib/supabase';

export type DateFilter = 'all' | 'this_month' | 'last_month' | 'ytd';

export function getDateRange(filter: DateFilter): { start: string, end: string } | null {
    if (filter === 'all') return null;
    const now = new Date();

    if (filter === 'this_month') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        return { start: start.toISOString(), end: end.toISOString() };
    }

    if (filter === 'last_month') {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        return { start: start.toISOString(), end: end.toISOString() };
    }

    if (filter === 'ytd') {
        const start = new Date(now.getFullYear(), 0, 1);
        const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        return { start: start.toISOString(), end: end.toISOString() };
    }

    return null;
}

export async function getRevenueChartData() {
    const { data, error } = await supabase
        .from('payments')
        .select('amount, payment_date')
        .order('payment_date', { ascending: true });

    if (error) throw error;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();

    const chartData = months.map(month => ({ name: month, revenue: 0 }));

    data?.forEach(payment => {
        const date = new Date(payment.payment_date);
        if (date.getFullYear() === currentYear) {
            const monthIdx = date.getMonth();
            chartData[monthIdx].revenue += Number(payment.amount);
        }
    });

    return chartData;
}

export async function getComprehensiveDashboardData() {
    const now = new Date();

    // 1. Fetch ALL base data (base lists of projects, payments, clients for full year/all time)
    // We limit registrations and transactions to reasonable numbers for dashboard visibility
    const [
        { data: allPayments, error: pError },
        { data: allProjects, error: prError },
        { data: allClients, error: cError },
        { data: registrations, error: regError },
        { data: transactions, error: traError }
    ] = await Promise.all([
        supabase.from('payments').select('amount, payment_date'),
        supabase.from('projects').select('total_amount, created_at').eq('status', 'active'),
        supabase.from('clients').select('created_at, status'),
        supabase.from('clients').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('payments').select('*, projects(name, client_id, clients(name))').order('payment_date', { ascending: false }).limit(20)
    ]);

    if (pError || prError || cError) {
        throw new Error("Failed to fetch dashboard base data");
    }

    const periods: DateFilter[] = ['all', 'ytd', 'last_month', 'this_month'];
    const stats: Record<DateFilter, any> = {} as any;
    const periodLists: Record<DateFilter, { registrations: any[], transactions: any[] }> = {} as any;

    // Pre-calculate ranges
    const ranges = periods.reduce((acc, p) => {
        acc[p] = getDateRange(p);
        return acc;
    }, {} as any);

    // Calculate common "All Time" metrics first
    const totalAllTimeRevenue = (allPayments || []).reduce((sum, p) => sum + Number(p.amount), 0);
    const totalProjectValue = (allProjects || []).reduce((sum, p) => sum + Number(p.total_amount), 0);
    const outstandingBalance = totalProjectValue - totalAllTimeRevenue;
    const collectionRate = totalProjectValue > 0 ? (totalAllTimeRevenue / totalProjectValue) * 100 : 0;

    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const mtdRevenue = (allPayments || [])
        .filter((p: any) => p.payment_date && p.payment_date >= startOfCurrentMonth)
        .reduce((sum: number, p: any) => sum + Number(p.amount), 0);

    const activeClientsCount = (allClients || []).filter(c => c.status === 'active').length;

    // Helper to filter data by range
    const filterByRange = (data: any[], dateField: string, range: { start: string, end: string } | null) => {
        if (!range) return data;
        return data.filter(item => item[dateField] >= range.start && item[dateField] <= range.end);
    };

    periods.forEach(p => {
        const range = ranges[p];

        // Filter payments, projects, clients for this range
        const pPayments = filterByRange(allPayments || [], 'payment_date', range);
        const pProjects = filterByRange(allProjects || [], 'created_at', range);
        const pClients = filterByRange(allClients || [], 'created_at', range);

        stats[p] = {
            periodRevenue: pPayments.reduce((sum, pay) => sum + Number(pay.amount), 0),
            periodProjects: pProjects.length,
            periodClients: pClients.length,
            totalActiveClients: activeClientsCount,
            outstandingBalance,
            mtdRevenue,
            collectionRate,
        };

        // Filter lists (use the limited 20 fetched earlier)
        periodLists[p] = {
            registrations: filterByRange(registrations || [], 'created_at', range).slice(0, 5),
            transactions: filterByRange(transactions || [], 'payment_date', range).slice(0, 5),
        };
    });

    const revenueChartData = await getRevenueChartData();
    const outstandingByClient = await getOutstandingByClient();

    return {
        stats,
        periodLists,
        revenueChartData,
        outstandingByClient
    };
}

// ── Outstanding by Client ──

export interface OutstandingClient {
    client_id: string;
    client_name: string;
    total_contract: number;
    total_paid: number;
    outstanding: number;
    project_count: number;
}

export async function getOutstandingByClient(): Promise<OutstandingClient[]> {
    const { data: projects, error } = await supabase
        .from('projects')
        .select(`
            id,
            total_amount,
            client_id,
            clients!inner (name),
            payments (amount)
        `)
        .eq('status', 'active');

    if (error) throw error;

    const clientMap = new Map<string, OutstandingClient>();

    (projects || []).forEach((p: any) => {
        const clientId = p.client_id;
        const clientName = p.clients?.name || 'Unknown';
        const totalContract = Number(p.total_amount);
        const totalPaid = (p.payments || []).reduce((sum: number, pay: any) => sum + Number(pay.amount), 0);

        if (!clientMap.has(clientId)) {
            clientMap.set(clientId, {
                client_id: clientId,
                client_name: clientName,
                total_contract: 0,
                total_paid: 0,
                outstanding: 0,
                project_count: 0,
            });
        }

        const entry = clientMap.get(clientId)!;
        entry.total_contract += totalContract;
        entry.total_paid += totalPaid;
        entry.outstanding += (totalContract - totalPaid);
        entry.project_count += 1;
    });

    return Array.from(clientMap.values())
        .filter(c => c.outstanding > 0)
        .sort((a, b) => b.outstanding - a.outstanding);
}
