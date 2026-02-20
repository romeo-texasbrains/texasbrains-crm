
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

export async function getAgent(agentId: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', agentId)
        .single();

    if (error) throw error;
    return data as Profile;
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
    if (target.period_type === 'monthly') {
        // Enforce YYYY-MM-01 format to prevent duplicate targets in the same month
        const [y, mStr] = target.start_date.split('-');
        const m = Number(mStr);
        const endDay = new Date(Number(y), m, 0).getDate();
        target.start_date = `${y}-${mStr}-01`;
        target.end_date = `${y}-${mStr}-${endDay}`;
    }

    const { data, error } = await supabase
        .from('sales_targets')
        .upsert(target, { onConflict: 'agent_id,period_type,start_date' })
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
    let targetsQuery = supabase
        .from('sales_targets')
        .select('*')
        .gte('start_date', `${year}-01-01`)
        .lte('start_date', `${year}-12-31`)
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
                const [tYear, tMonth] = t.start_date.split('-');
                return t.period_type === 'monthly' && Number(tYear) === year && (Number(tMonth) - 1) === m;
            })?.target_amount || 0;
        }

        // For 'all' agents, sum up targets for everyone
        return targets.filter(t => {
            const [tYear, tMonth] = t.start_date.split('-');
            return t.period_type === 'monthly' && Number(tYear) === year && (Number(tMonth) - 1) === m;
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
        const mTarget = aggregateTargetForMonth(m);
        qtdTarget += mTarget || mtdTarget; // Fall back to current month target if not set

        // Performance should only be counted up to the current month to avoid future dummy data
        if (m <= month) {
            const range = getMonthRange(year, m);
            const perf = await getAgentPerformance(agentId, range.start, range.end);
            qtdSales += perf.totalSales;
            qtdCollections += perf.totalCollections;
            qtdProjects += perf.count;
        }
    }

    // YTD: sum all months Jan → current
    let ytdSales = 0, ytdCollections = 0, ytdProjects = 0, ytdTarget = 0;

    for (let m = 0; m < 12; m++) {
        const mTarget = aggregateTargetForMonth(m);
        ytdTarget += mTarget || mtdTarget;

        // Reuse QTD data for months already calculated (if they are prior to or equal to current month)
        if (m <= month) {
            if (quarterMonths.includes(m)) {
                // Already counted in QTD loop — skip to avoid double-fetching
                continue;
            }
            const range = getMonthRange(year, m);
            const perf = await getAgentPerformance(agentId, range.start, range.end);
            ytdSales += perf.totalSales;
            ytdCollections += perf.totalCollections;
            ytdProjects += perf.count;
        }
    }

    // Add QTD performance totals to YTD
    ytdSales += qtdSales;
    ytdCollections += qtdCollections;
    ytdProjects += qtdProjects;
    // Do NOT add qtdTarget to ytdTarget since the loop already sums all 12 months of targets

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
    const monthStr = String(month + 1).padStart(2, '0');

    const endDay = new Date(year, month + 1, 0).getDate();
    // Fetch all targets for this month, for all agents, to avoid N+1 querying
    const { data: targetsData } = await supabase
        .from('sales_targets')
        .select('agent_id, target_amount')
        .eq('period_type', 'monthly')
        .gte('start_date', `${year}-${monthStr}-01`)
        .lte('start_date', `${year}-${monthStr}-${endDay}`);

    const targetMap = new Map((targetsData || []).map(t => [t.agent_id, Number(t.target_amount)]));

    const entries: LeaderboardEntry[] = [];

    for (const agent of agents) {
        const perf = await getAgentPerformance(agent.id, mtdRange.start, mtdRange.end);
        const target = targetMap.get(agent.id) || 0;

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

export interface MonthlyBreakdownEntry {
    monthName: string;
    monthKey: string; // 'YYYY-MM'
    sales: number;
    collections: number;
    target: number;
    achievement: number;
    lag: number;
}

export async function getAgentYearlyBreakdown(agentId: string, year: number): Promise<MonthlyBreakdownEntry[]> {
    const startDate = `${year}-01-01T00:00:00Z`;
    const endDate = `${year}-12-31T23:59:59Z`;

    // 1. Fetch projects
    let projectsQuery = supabase.from('projects').select('total_amount, created_at').eq('agent_id', agentId).gte('created_at', startDate).lte('created_at', endDate);
    const { data: projects } = await projectsQuery;

    // 2. Fetch payments
    let paymentsQuery = supabase.from('payments').select('amount, payment_date, projects!inner(agent_id)').eq('projects.agent_id', agentId).gte('payment_date', startDate).lte('payment_date', endDate);
    const { data: payments } = await paymentsQuery;

    // 3. Fetch targets (use gte/lte to avoid TZ offsets stripping Jan targets)
    const { data: targets } = await supabase.from('sales_targets').select('*').eq('agent_id', agentId).eq('period_type', 'monthly').gte('start_date', `${year}-01-01`).lte('start_date', `${year}-12-31`);

    const breakdown: MonthlyBreakdownEntry[] = [];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    for (let m = 0; m < 12; m++) {
        const monthKey = `${year}-${String(m + 1).padStart(2, '0')}`;
        const monthProjects = (projects || []).filter(p => Number(p.created_at.split('-')[1]) - 1 === m);
        const monthPayments = (payments || []).filter(p => Number(p.payment_date.split('-')[1]) - 1 === m);
        const monthTarget = (targets || []).find(t => Number(t.start_date.split('-')[1]) - 1 === m)?.target_amount || 0;

        const sales = monthProjects.reduce((sum, p) => sum + Number(p.total_amount), 0);
        const collections = monthPayments.reduce((sum, p) => sum + Number(p.amount), 0);

        breakdown.push({
            monthName: months[m],
            monthKey,
            sales,
            collections,
            target: monthTarget,
            achievement: monthTarget > 0 ? (collections / monthTarget) * 100 : 0,
            lag: monthTarget > collections ? monthTarget - collections : 0
        });
    }

    return breakdown;
}

export async function updateAgentTarget(agentId: string, monthKey: string, amount: number, scope: 'specific' | 'future') {
    const [year, month] = monthKey.split('-').map(Number);

    // Create UTC-safe date strings for DB
    const getSafeDates = (y: number, m: number) => {
        const sMonth = String(m).padStart(2, '0');
        // last day of month trick
        const endDay = new Date(y, m, 0).getDate();
        return {
            start: `${y}-${sMonth}-01`,
            end: `${y}-${sMonth}-${endDay}`
        };
    };

    if (scope === 'specific') {
        const d = getSafeDates(year, month);
        // Upsert for specific month
        const { error } = await supabase.from('sales_targets').upsert({
            agent_id: agentId,
            period_type: 'monthly',
            start_date: d.start,
            end_date: d.end,
            target_amount: amount
        }, { onConflict: 'agent_id,period_type,start_date' });
        if (error) throw error;
    } else {
        // Future scope: update current and all remaining months of the year
        const promises = [];
        for (let m = month; m <= 12; m++) {
            const d = getSafeDates(year, m);
            promises.push(
                supabase.from('sales_targets').upsert({
                    agent_id: agentId,
                    period_type: 'monthly',
                    start_date: d.start,
                    end_date: d.end,
                    target_amount: amount
                }, { onConflict: 'agent_id,period_type,start_date' })
            );
        }
        await Promise.all(promises);
    }
}

