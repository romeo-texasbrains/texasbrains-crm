
import { supabase } from '@/lib/supabase';
import { BankAccount, IncomeCategory, Payment } from '@/lib/types';

export async function getBankAccounts() {
    const { data, error } = await supabase.from('bank_accounts').select('*').order('name');
    if (error) throw error;
    return data as BankAccount[];
}

export async function getIncomeCategories() {
    const { data, error } = await supabase.from('income_categories').select('*').order('name');
    if (error) throw error;
    return data as IncomeCategory[];
}

export async function getIncomeRecords() {
    const { data, error } = await supabase
        .from('payments')
        .select(`
      *,
      projects (
        name,
        client_id,
        client:clients (name),
        agent:profiles (full_name)
      ),
      bank_accounts (name),
      income_categories (name)
    `)
        .order('payment_date', { ascending: false });

    if (error) throw error;
    return data;
}

export async function createBankAccount(name: string) {
    const { data, error } = await supabase.from('bank_accounts').insert({ name }).select().single();
    if (error) throw error;
    return data as BankAccount;
}

export async function createIncomeCategory(name: string) {
    const { data, error } = await supabase.from('income_categories').insert({ name }).select().single();
    if (error) throw error;
    return data as IncomeCategory;
}

export async function createPayment(payment: {
    project_id: string;
    amount: number;
    payment_date: string;
    payment_method?: string;
    note?: string;
    bank_account_id?: string;
    category_id?: string;
    is_verified?: boolean;
}) {
    const { data, error } = await supabase
        .from('payments')
        .insert({
            id: crypto.randomUUID(),
            ...payment
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}
