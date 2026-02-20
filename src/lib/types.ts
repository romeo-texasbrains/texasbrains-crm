
export type Profile = {
  id: string;
  full_name: string | null;
  role: 'admin' | 'sales_agent';
  created_at: string;
};

export type Client = {
  id: string;
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
  cltv?: number;
  remaining_balance?: number;
  created_at: string;
};

export type Project = {
  id: string;
  client_id: string;
  agent_id: string | null;
  name: string;
  description: string | null;
  total_amount: number;
  status: 'active' | 'completed' | 'cancelled' | 'on_hold';
  start_date: string;
  end_date: string | null;
  created_at: string;
};

export type Payment = {
  id: string;
  project_id: string;
  amount: number;
  payment_date: string;
  payment_method: string | null;
  bank_account_id: string | null;
  category_id: string | null;
  is_verified: boolean;
  note: string | null;
  created_at: string;
};

export type BankAccount = {
  id: string;
  name: string;
};

export type IncomeCategory = {
  id: string;
  name: string;
};

export type SalesTarget = {
  id: string;
  agent_id: string;
  period_type: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date: string;
  target_amount: number;
  created_at: string;
};

export type ProjectLedger = {
  project_id: string;
  project_name: string;
  client_id: string;
  client_name: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  agent_id: string | null;
  agent_name?: string | null;
  status: string;
  created_at: string;
};

export type IncomeRecord = Payment & {
  projects: {
    name: string;
    client: { name: string } | null;
    agent: { full_name: string | null } | null;
  } | null;
  bank_accounts: {
    name: string;
  } | null;
  income_categories: {
    name: string;
  } | null;
};

// ── Client 360° types ──

export type ClientWithAgent = Client & {
  assigned_agent: { full_name: string | null } | null;
};

export type ClientProject = Project & {
  paid_amount: number;
  remaining_amount: number;
  payment_count: number;
  agent: { full_name: string | null } | null;
};

export type ClientPayment = Payment & {
  project_name: string;
};

export type ClientSummaryStats = {
  total_projects: number;
  active_projects: number;
  total_contract_value: number;
  total_paid: number;
  total_outstanding: number;
  total_payments: number;
};
