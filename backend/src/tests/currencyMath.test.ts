import { describe, it, expect } from 'vitest';
import {
  toPaise,
  toRupees,
  formatINR,
  calcGrossProfit,
  calcGrossMarginPercent,
  calcMarkupPercent,
  formatPercent,
} from '../shared/utils/currency.js';

describe('Currency & Financial Arithmetic Engine', () => {
  it('accurately converts Rupees to integer Paise minor units', () => {
    expect(toPaise(4999)).toBe(499900);
    expect(toPaise(12999.50)).toBe(1299950);
    expect(toPaise(0)).toBe(0);
    expect(toPaise(-100)).toBe(-10000);
  });

  it('accurately converts Paise to Rupees', () => {
    expect(toRupees(499900)).toBe(4999);
    expect(toRupees(1299950)).toBe(12999.50);
    expect(toRupees(0)).toBe(0);
  });

  it('formats Indian Rupee currency strings properly', () => {
    expect(formatINR(499900)).toBe('₹4,999');
    expect(formatINR(2999900)).toBe('₹29,999');
    expect(formatINR(10000000)).toBe('₹1,00,000');
  });

  it('calculates gross profit correctly (Revenue - Direct Cost)', () => {
    const revenuePaise = 10000000; // ₹1,00,000
    const directCostPaise = 4500000; // ₹45,000
    const profit = calcGrossProfit(revenuePaise, directCostPaise);
    expect(profit).toBe(5500000); // ₹55,000
  });

  it('calculates gross margin percentage accurately: (Profit / Revenue) * 100', () => {
    const revenuePaise = 10000000; // ₹1,00,000
    const directCostPaise = 4500000; // ₹45,000
    const margin = calcGrossMarginPercent(revenuePaise, directCostPaise);
    expect(margin).toBe(55.0); // 55%
  });

  it('calculates markup percentage accurately: (Profit / Direct Cost) * 100', () => {
    const revenuePaise = 10000000; // ₹1,00,000
    const directCostPaise = 4500000; // ₹45,000
    const markup = calcMarkupPercent(revenuePaise, directCostPaise);
    expect(markup).toBe(122.2); // (55,000 / 45,000) * 100 = 122.2%
  });

  it('safely handles zero revenue without dividing by zero', () => {
    const margin = calcGrossMarginPercent(0, 500000);
    expect(margin).toBeNull();
    expect(formatPercent(margin)).toBe('N/A');
  });

  it('safely handles zero direct cost without dividing by zero', () => {
    const markup = calcMarkupPercent(500000, 0);
    expect(markup).toBeNull();
    expect(formatPercent(markup)).toBe('N/A');
  });
});
