
import { supabase } from '@/lib/supabase';
import { Client } from '@/lib/types';

export async function getClients() {
    const { data, error } = await supabase
        .from('clients')
        .select(`
            *,
            assigned_agent:profiles!assigned_agent_id (
                id,
                full_name
            ),
            projects:projects (
                total_amount,
                payments:payments (
                    amount
                )
            )
        `)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((client: any) => {
        let cltv = 0;
        let totalPaid = 0;

        // Use explicit naming from the alias
        const projects = client.projects || [];

        projects.forEach((project: any) => {
            const contractVal = parseFloat(project.total_amount) || 0;
            cltv += contractVal;

            const payments = project.payments || [];
            payments.forEach((payment: any) => {
                totalPaid += parseFloat(payment.amount) || 0;
            });
        });

        return {
            ...client,
            cltv,
            remaining_balance: cltv - totalPaid
        } as Client;
    });
}

export async function createClient(client: Omit<Client, 'id' | 'created_at'>) {
    const { data, error } = await supabase
        .from('clients')
        .insert(client)
        .select()
        .single();

    if (error) throw error;
    return data as Client;
}
