
import { supabase } from '@/lib/supabase';
import { Client } from '@/lib/types';

export async function getClients() {
    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Client[];
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
