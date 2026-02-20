
import { supabase } from '@/lib/supabase';
import { ProjectLedger, Project, Payment } from '@/lib/types';


export async function getLedger() {
    // Fetch projects with related client and all payments
    const { data, error } = await supabase
        .from('projects')
        .select(`
            id,
            name,
            status,
            total_amount,
            created_at,
            client_id,
            agent_id,
            profiles:profiles!agent_id (
                full_name
            ),
            clients (name),
            payments (amount)
        `)
        .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform to ProjectLedger structure
    return data.map((p: any) => {
        const paid_amount = (p.payments || []).reduce((sum: number, pay: any) => sum + Number(pay.amount), 0);
        return {
            project_id: p.id,
            project_name: p.name,
            client_id: p.client_id,
            client_name: p.clients?.name || 'Unknown Client',
            status: p.status,
            total_amount: p.total_amount,
            paid_amount,
            remaining_amount: p.total_amount - paid_amount,
            agent_id: p.agent_id,
            agent_name: p.profiles?.full_name,
            created_at: p.created_at
        };
    }) as ProjectLedger[];
}

export async function createProject(project: {
    client_id: string;
    agent_id?: string;
    name: string;
    total_amount: number;
    status: string;
    start_date?: string;
}) {
    const { data, error } = await supabase
        .from('projects')
        .insert({
            id: crypto.randomUUID(),
            ...project
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function addProject(project: Omit<Project, 'id' | 'created_at'>) {
    const { data, error } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single();

    if (error) throw error;
    return data as Project;
}

export async function addPayment(payment: Omit<Payment, 'id' | 'created_at'>) {
    const { data, error } = await supabase
        .from('payments')
        .insert(payment)
        .select()
        .single();

    if (error) throw error;
    return data as Payment;
}

export async function getProjectDetails(projectId: string) {
    const { data: project, error: pError } = await supabase
        .from('projects')
        .select('*, payments(*)')
        .eq('id', projectId)
        .single();

    if (pError) throw pError;
    return project;
}
