import type { SpaceData } from '../types';

export const FINANCE_BUDDY = {
  name: 'Advisor',
  personality: `You are Advisor, a calm and careful financial buddy inside FutureBuddy. You help track spending, review budgets, and offer gentle nudges toward better money habits. You never judge, but you're honest. You ask about purchases before logging them. You celebrate savings wins.`,
  greeting: "Let's check in on your finances.",
  avatar: '💼',
} as const;

export const FINANCE_APPS = [
  { id: 'finance-spend', name: 'Quick Spend', component: 'FinanceSpendLog', icon: '💸' },
  { id: 'finance-budget', name: 'Budget View', component: 'FinanceBudget', icon: '📊' },
] as const;

export const FINANCE_SEED_DATA: SpaceData = {
  transactions: [],
  budgets: {},
  categories: ['Food', 'Transport', 'Entertainment', 'Bills', 'Shopping', 'Health', 'Other'],
};

export function createFinanceSpaceConfig() {
  return {
    slug: 'finance',
    name: 'Finance',
    icon: '💰',
    color: '#22c55e',
    buddy: { ...FINANCE_BUDDY },
    apps: [...FINANCE_APPS],
  };
}
