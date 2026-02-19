
import { supabase } from '@/lib/supabase';
import { SalesTarget, Profile } from '@/lib/types';

export async function getAgentTargets(agentId: string) {
    const { data, error } = await supabase
        .from('sales_targets')
        .select('*')
        .eq('agent_id', agentId)
        .order('start_date', { ascending: false });

    if (error) throw error;
    return data as SalesTarget[];
}

export async function getAgents() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'sales_agent')
        .order('full_name');

    if (error) throw error;
    return data as Profile[];
}

export async function setSalesTarget(target: Omit<SalesTarget, 'id' | 'created_at'>) {
    const { data, error } = await supabase
        .from('sales_targets')
        .insert(target)
        .select()
        .single();

    if (error) throw error;
    return data as SalesTarget;
}

export async function createAgent(agent: { full_name: string; role: 'sales_agent' }) {
    const { data, error } = await supabase
        .from('profiles')
        .insert({
            id: crypto.randomUUID(),
            ...agent
        })
        .select()
        .single();

    if (error) throw error;
    return data as Profile;
}

interface PerformancePayment {
    amount: number;
    project_id: string;
}

export async function getAgentPerformance(agentId: string, startDate: string, endDate: string) {
    let projectsQuery = supabase
        .from('projects')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

    if (agentId !== 'all') {
        projectsQuery = projectsQuery.eq('agent_id', agentId);
    }

    const { data: projects, error: projectsError } = await projectsQuery;

    if (projectsError) throw projectsError;

    let paymentsQuery = supabase
        .from('payments')
        .select('amount, project_id, projects!inner(agent_id)')
        .gte('payment_date', startDate)
        .lte('payment_date', endDate);

    if (agentId !== 'all') {
        paymentsQuery = paymentsQuery.eq('projects.agent_id', agentId);
    }

    const { data: payments, error: paymentsError } = await paymentsQuery;

    if (paymentsError) throw paymentsError;

    const typedPayments = payments as unknown as PerformancePayment[];

    const totalSales = projects.reduce((sum, p) => sum + Number(p.total_amount), 0);
    const totalCollections = (typedPayments || []).reduce((sum: number, p: PerformancePayment) => sum + Number(p.amount), 0);

    return {
        totalSales,
        totalCollections,
        count: projects.length
    };
}

// ── MTD / QTD / YTD Calculations ──

function getMonthRange(year: number, month: number) {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
    return { start: start.toISOString(), end: end.toISOString() };
}

function getQuarterMonths(month: number): number[] {
    const q = Math.floor(month / 3);
    return [q * 3, q * 3 + 1, q * 3 + 2];
}

export interface PeriodMetrics {
    sales: number;
    collections: number;
    projectCount: number;
    target: number;
    achievement: number; // percentage
}

export interface FullPerformanceData {
    mtd: PeriodMetrics;
    qtd: PeriodMetrics;
    ytd: PeriodMetrics;
}

export async function getFullAgentPerformance(agentId: string, baseDate?: Date): Promise<FullPerformanceData> {
    const now = baseDate || new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // Get all targets for this agent this year
    const yearStart = new Date(year, 0, 1).toISOString();
    const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999).toISOString();

    let targetsQuery = supabase
        .from('sales_targets')
        .select('*')
        .gte('start_date', yearStart)
        .lte('start_date', yearEnd)
        .order('start_date');

    if (agentId !== 'all') {
        targetsQuery = targetsQuery.eq('agent_id', agentId);
    }

    const { data: allTargets } = await targetsQuery;

    const targets = (allTargets || []) as SalesTarget[];

    // If "All Agents", aggregate targets for all active agents
    const aggregateTargetForMonth = (m: number) => {
        if (agentId !== 'all') {
            return targets.find(t => {
                const tStart = new Date(t.start_date);
                return t.period_type === 'monthly' && tStart.getFullYear() === year && tStart.getMonth() === m;
            })?.target_amount || 0;
        }

        // For 'all' agents, sum up targets for everyone
        return targets.filter(t => {
            const tStart = new Date(t.start_date);
            return t.period_type === 'monthly' && tStart.getFullYear() === year && tStart.getMonth() === m;
        }).reduce((sum, t) => sum + (t.target_amount || 0), 0);
    };

    // Get the current month's performance (MTD)
    const mtdRange = getMonthRange(year, month);
    const mtdPerf = await getAgentPerformance(agentId, mtdRange.start, mtdRange.end);

    // Find monthly target for current month
    const mtdTarget = aggregateTargetForMonth(month);

    // QTD: sum all months in this quarter
    const quarterMonths = getQuarterMonths(month);
    let qtdSales = 0, qtdCollections = 0, qtdProjects = 0, qtdTarget = 0;

    for (const m of quarterMonths) {
        if (m > month) break; // Only count months up to current
        const range = getMonthRange(year, m);
        const perf = await getAgentPerformance(agentId, range.start, range.end);
        qtdSales += perf.totalSales;
        qtdCollections += perf.totalCollections;
        qtdProjects += perf.count;

        // Sum monthly targets for QTD
        const mTarget = aggregateTargetForMonth(m);
        qtdTarget += mTarget || mtdTarget; // Fall back to current month target if not set
    }

    // YTD: sum all months Jan → current
    let ytdSales = 0, ytdCollections = 0, ytdProjects = 0, ytdTarget = 0;

    for (let m = 0; m <= month; m++) {
        // Reuse QTD data for months already calculated
        if (quarterMonths.includes(m)) {
            // Already counted in QTD loop — skip to avoid double-fetching
            continue;
        }
        const range = getMonthRange(year, m);
        const perf = await getAgentPerformance(agentId, range.start, range.end);
        ytdSales += perf.totalSales;
        ytdCollections += perf.totalCollections;
        ytdProjects += perf.count;

        const mTarget = aggregateTargetForMonth(m);
        ytdTarget += mTarget || mtdTarget;
    }

    // Add QTD totals to YTD
    ytdSales += qtdSales;
    ytdCollections += qtdCollections;
    ytdProjects += qtdProjects;
    ytdTarget += qtdTarget;

    return {
        mtd: {
            sales: mtdPerf.totalSales,
            collections: mtdPerf.totalCollections,
            projectCount: mtdPerf.count,
            target: mtdTarget,
            achievement: mtdTarget > 0 ? (mtdPerf.totalCollections / mtdTarget) * 100 : 0,
        },
        qtd: {
            sales: qtdSales,
            collections: qtdCollections,
            projectCount: qtdProjects,
            target: qtdTarget,
            achievement: qtdTarget > 0 ? (qtdCollections / qtdTarget) * 100 : 0,
        },
        ytd: {
            sales: ytdSales,
            collections: ytdCollections,
            projectCount: ytdProjects,
            target: ytdTarget,
            achievement: ytdTarget > 0 ? (ytdCollections / ytdTarget) * 100 : 0,
        },
    };
}

// ── Team Leaderboard ──

export interface LeaderboardEntry {
    agent: Profile;
    mtdCollected: number;
    mtdTarget: number;
    mtdAchievement: number;
    projectCount: number;
}

export async function getTeamLeaderboard(baseDate?: Date): Promise<LeaderboardEntry[]> {
    const agents = await getAgents();
    const now = baseDate || new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const mtdRange = getMonthRange(year, month);

    const entries: LeaderboardEntry[] = [];

    for (const agent of agents) {
        const perf = await getAgentPerformance(agent.id, mtdRange.start, mtdRange.end);

        const { data: tData } = await supabase
            .from('sales_targets')
            .select('target_amount')
            .eq('agent_id', agent.id)
            .eq('period_type', 'monthly')
            .gte('start_date', mtdRange.start)
            .lte('start_date', mtdRange.end)
            .limit(1)
            .single();

        const target = tData?.target_amount || 0;

        entries.push({
            agent,
            mtdCollected: perf.totalCollections,
            mtdTarget: target,
            mtdAchievement: target > 0 ? (perf.totalCollections / target) * 100 : 0,
            projectCount: perf.count,
        });
    }

    // Sort by achievement descending
    entries.sort((a, b) => b.mtdAchievement - a.mtdAchievement);
    return entries;
}
