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

export async function getDashboardStats(filter: DateFilter = 'all') {
    const range = getDateRange(filter);

    let paymentsQuery = supabase.from('payments').select('amount, payment_date');
    let clientsQuery = supabase.from('clients').select('created_at', { count: 'exact' });
    let projectsQuery = supabase.from('projects').select('created_at', { count: 'exact' }).eq('status', 'active');

    if (range) {
        paymentsQuery = paymentsQuery.gte('payment_date', range.start).lte('payment_date', range.end);
        clientsQuery = clientsQuery.gte('created_at', range.start).lte('created_at', range.end);
        projectsQuery = projectsQuery.gte('created_at', range.start).lte('created_at', range.end);
    }

    const { data: periodPayments, error: pError } = await paymentsQuery;
    const { count: periodProjects, error: prError } = await projectsQuery;
    const { count: periodClients, error: cError } = await clientsQuery;

    // For outstanding balance and MTD, we still need some all-time or specific data
    const { data: allProjects } = await supabase.from('projects').select('total_amount').eq('status', 'active');
    const { data: allPayments } = await supabase.from('payments').select('amount, payment_date');
    const { count: totalActiveClients } = await supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'active');

    if (pError || prError || cError) {
        console.error('Dashboard Stats Error:', { pError, prError, cError });
        return {
            periodRevenue: 0,
            periodProjects: 0,
            periodClients: 0,
            totalActiveClients: 0,
            outstandingBalance: 0,
            mtdRevenue: 0,
            collectionRate: 0,
        };
    }

    const periodRevenue = (periodPayments || []).reduce((sum, p) => sum + Number(p.amount), 0);

    // Outstanding balance (All Time)
    const totalAllTimeRevenue = (allPayments || []).reduce((sum, p) => sum + Number(p.amount), 0);
    const totalProjectValue = (allProjects || []).reduce((sum, p) => sum + Number(p.total_amount), 0);
    const outstandingBalance = totalProjectValue - totalAllTimeRevenue;
    const collectionRate = totalProjectValue > 0 ? (totalAllTimeRevenue / totalProjectValue) * 100 : 0;

    // MTD Revenue
    // MTD Revenue
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const mtdRevenue = (allPayments || [])
        .filter((p: any) => p.payment_date && p.payment_date >= startOfMonth)
        .reduce((sum: number, p: any) => sum + Number(p.amount), 0);

    return {
        periodRevenue,
        periodProjects: periodProjects || 0,
        periodClients: periodClients || 0,
        totalActiveClients: totalActiveClients || 0,
        outstandingBalance,
        mtdRevenue,
        collectionRate,
    };
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

export async function getLatestRegistrations(filter: DateFilter = 'all') {
    const range = getDateRange(filter);
    let query = supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (range) {
        query = query.gte('created_at', range.start).lte('created_at', range.end);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
}

export async function getLatestTransactions(filter: DateFilter = 'all') {
    const range = getDateRange(filter);
    let query = supabase
        .from('payments')
        .select(`
            *,
            projects (name, client_id, clients (name))
        `)
        .order('payment_date', { ascending: false })
        .limit(5);

    if (range) {
        query = query.gte('payment_date', range.start).lte('payment_date', range.end);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
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
