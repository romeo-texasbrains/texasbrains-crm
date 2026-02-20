export function getAchievementColors(val: number) {
    if (val < 50) return { text: 'text-red-500', bg: 'bg-red-500', shadow: 'shadow-red-500/20', bgMuted: 'bg-red-50', border: 'border-red-100', textMuted: 'text-red-600' };
    if (val < 80) return { text: 'text-yellow-500', bg: 'bg-yellow-500', shadow: 'shadow-yellow-500/20', bgMuted: 'bg-yellow-50', border: 'border-yellow-100', textMuted: 'text-yellow-600' };
    if (val <= 100) return { text: 'text-green-500', bg: 'bg-green-500', shadow: 'shadow-green-500/20', bgMuted: 'bg-green-50', border: 'border-green-100', textMuted: 'text-green-600' };
    return { text: 'text-blue-500', bg: 'bg-blue-500', shadow: 'shadow-blue-500/20', bgMuted: 'bg-blue-50', border: 'border-blue-100', textMuted: 'text-blue-600' };
}

/**
 * Universally formats currency values across the app (e.g. $1,500.00). 
 * Defaults to omitting fractions if zero, unless exact=true.
 */
export function formatCurrency(amount: number, exact: boolean = false): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: exact ? 2 : 0,
        maximumFractionDigits: exact ? 2 : 0,
    }).format(amount);
}

/**
 * Universally formats dates across the app.
 * short: "Nov 5, 2023" or similar
 * long: "November 5, 2023"
 */
export function formatDate(dateStr: string | Date, format: 'short' | 'long' | 'month-year' = 'short'): string {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);

    if (format === 'month-year') {
        return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }

    return d.toLocaleDateString('en-US', {
        month: format === 'short' ? 'short' : 'long',
        day: 'numeric',
        year: 'numeric' // Adding year universally as safe default for CRM
    });
}

/**
 * Calculates percentage safely (returns 0 instead of NaN or Infinity)
 */
export function calculatePercentage(value: number, total: number): number {
    if (total <= 0) return 0;
    return (value / total) * 100;
}
