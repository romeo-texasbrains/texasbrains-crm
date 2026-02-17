
import { supabase } from '@/lib/supabase';

export async function getDashboardStats() {
    const { data: payments, error: pError } = await supabase.from('payments').select('amount, payment_date');
    const { count: projectCount, error: prError } = await supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'active');
    const { count: clientCount, error: cError } = await supabase.from('clients').select('*', { count: 'exact', head: true });
    const { count: activeClientCount, error: acError } = await supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'active');
    const { data: projects, error: allPrError } = await supabase.from('projects').select('total_amount');

    if (pError || prError || cError || allPrError || acError) {
        console.error('Dashboard Stats Error:', { pError, prError, cError, allPrError, acError });
        return {
            totalRevenue: 0,
            activeProjects: 0,
            totalClients: 0,
            activeClients: 0,
            outstandingBalance: 0,
            mtdRevenue: 0,
            collectionRate: 0,
        };
    }

    const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    const totalProjectValue = projects?.reduce((sum, p) => sum + Number(p.total_amount), 0) || 0;
    const outstandingBalance = totalProjectValue - totalRevenue;
    const collectionRate = totalProjectValue > 0 ? (totalRevenue / totalProjectValue) * 100 : 0;

    // MTD Revenue
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const mtdRevenue = (payments || [])
        .filter(p => p.payment_date >= startOfMonth)
        .reduce((sum, p) => sum + Number(p.amount), 0);

    return {
        totalRevenue,
        activeProjects: projectCount || 0,
        totalClients: clientCount || 0,
        activeClients: activeClientCount || 0,
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

export async function getLatestRegistrations() {
    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) throw error;
    return data;
}

export async function getLatestTransactions() {
    const { data, error } = await supabase
        .from('payments')
        .select(`
            *,
            projects (name, client_id, clients (name))
        `)
        .order('payment_date', { ascending: false })
        .limit(5);

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
