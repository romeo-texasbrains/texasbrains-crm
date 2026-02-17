
import { supabase } from '@/lib/supabase';
import {
    ClientWithAgent,
    ClientProject,
    ClientPayment,
    ClientSummaryStats,
} from '@/lib/types';

export async function getClientDetail(clientId: string): Promise<ClientWithAgent> {
    const { data, error } = await supabase
        .from('clients')
        .select(`
      *,
      assigned_agent:profiles!clients_assigned_agent_id_fkey (full_name)
    `)
        .eq('id', clientId)
        .single();

    if (error) throw error;
    return data as ClientWithAgent;
}

export async function getClientProjects(clientId: string): Promise<ClientProject[]> {
    const { data: projects, error } = await supabase
        .from('projects')
        .select(`
      *,
      payments (amount),
      agent:profiles!projects_agent_id_fkey (full_name)
    `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return (projects || []).map((p: any) => {
        const paid = (p.payments || []).reduce((sum: number, pay: any) => sum + Number(pay.amount), 0);
        return {
            ...p,
            paid_amount: paid,
            remaining_amount: Number(p.total_amount) - paid,
            payment_count: (p.payments || []).length,
            payments: undefined,
        };
    }) as ClientProject[];
}

export async function getClientPayments(clientId: string): Promise<ClientPayment[]> {
    const { data, error } = await supabase
        .from('payments')
        .select(`
      *,
      projects!inner (name, client_id)
    `)
        .eq('projects.client_id', clientId)
        .order('payment_date', { ascending: false });

    if (error) throw error;

    return (data || []).map((p: any) => ({
        ...p,
        project_name: p.projects?.name || 'Unknown Project',
        projects: undefined,
    })) as ClientPayment[];
}

export async function getClientSummary(clientId: string): Promise<ClientSummaryStats> {
    const projects = await getClientProjects(clientId);
    const payments = await getClientPayments(clientId);

    return {
        total_projects: projects.length,
        active_projects: projects.filter(p => p.status === 'active').length,
        total_contract_value: projects.reduce((sum, p) => sum + Number(p.total_amount), 0),
        total_paid: payments.reduce((sum, p) => sum + Number(p.amount), 0),
        total_outstanding: projects.reduce((sum, p) => sum + p.remaining_amount, 0),
        total_payments: payments.length,
    };
}

export async function updateClient(
    clientId: string,
    updates: Partial<{
        name: string;
        email: string | null;
        phone: string | null;
        address: string | null;
        company: string | null;
        industry: string | null;
        source: string | null;
        assigned_agent_id: string | null;
        status: 'active' | 'inactive' | 'churned';
        notes: string | null;
    }>
) {
    const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', clientId)
        .select()
        .single();

    if (error) throw error;
    return data;
}
