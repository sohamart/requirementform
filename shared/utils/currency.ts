/**
 * Currency & Financial Arithmetic Utility
 * 
 * Rules:
 * - All monetary values are handled and stored in integer minor units (paise).
 * - 1 INR (₹) = 100 paise.
 * - Revenue = Approved project amount (excluding tax).
 * - Total Direct Cost = Sum of applicable recorded direct costs.
 * - Gross Profit = Revenue - Total Direct Cost.
 * - Gross Margin % = (Gross Profit / Revenue) * 100 (null if Revenue <= 0).
 * - Markup % = (Gross Profit / Total Direct Cost) * 100 (null if Direct Cost <= 0).
 */

export function toPaise(rupees: number): number {
  if (isNaN(rupees) || !isFinite(rupees)) return 0;
  return Math.round(rupees * 100);
}

export function toRupees(paise: number): number {
  if (isNaN(paise) || !isFinite(paise)) return 0;
  return Math.round(paise) / 100;
}

export function formatINR(paise: number, includeSymbol: boolean = true): string {
  const rupees = toRupees(paise);
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(rupees);

  return includeSymbol ? `₹${formatted}` : formatted;
}

export function calcGrossProfit(revenuePaise: number, directCostPaise: number): number {
  return Math.round(revenuePaise - directCostPaise);
}

export function calcGrossMarginPercent(revenuePaise: number, directCostPaise: number): number | null {
  if (revenuePaise <= 0) return null;
  const profit = calcGrossProfit(revenuePaise, directCostPaise);
  const margin = (profit / revenuePaise) * 100;
  return Math.round(margin * 10) / 10; // 1 decimal place e.g. 52.4%
}

export function calcMarkupPercent(revenuePaise: number, directCostPaise: number): number | null {
  if (directCostPaise <= 0) return null;
  const profit = calcGrossProfit(revenuePaise, directCostPaise);
  const markup = (profit / directCostPaise) * 100;
  return Math.round(markup * 10) / 10; // 1 decimal place e.g. 110.5%
}

export function formatPercent(value: number | null): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  return `${value.toFixed(1)}%`;
}
