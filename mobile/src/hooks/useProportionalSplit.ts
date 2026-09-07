import { useMemo } from 'react';
import { useIncomes } from './useIncomes';

export interface SplitMember {
  name: string;
  totalIncome: number;
  percent: number;
}

export interface SplitResult {
  name: string;
  value: number;
}

export interface ProportionalSplitHook {
  members: SplitMember[];
  totalIncome: number;
  split: (amount: number) => SplitResult[];
  isConfigured: boolean;
}

export function useProportionalSplit(): ProportionalSplitHook {
  const { incomes } = useIncomes();

  const members = useMemo(() => {
    const map: Record<string, number> = {};
    for (const income of incomes) {
      map[income.person_name] = (map[income.person_name] ?? 0) + income.amount;
    }

    const entries = Object.entries(map).filter(([, amount]) => amount > 0);
    const total = entries.reduce((sum, [, amount]) => sum + amount, 0);

    if (total <= 0) return [];

    return entries
      .map(([name, totalIncome]) => ({
        name,
        totalIncome,
        percent: (totalIncome / total) * 100,
      }))
      .sort((a, b) => b.totalIncome - a.totalIncome);
  }, [incomes]);

  const totalIncome = useMemo(
    () => members.reduce((sum, m) => sum + m.totalIncome, 0),
    [members],
  );

  const isConfigured = members.length >= 2;

  const split = useMemo(() => {
    return (amount: number): SplitResult[] => {
      if (!isConfigured || totalIncome <= 0) return [];

      let remaining = amount;
      const results: SplitResult[] = [];

      for (let i = 0; i < members.length; i++) {
        if (i === members.length - 1) {
          // Last member gets the remainder to avoid rounding issues
          results.push({
            name: members[i].name,
            value: Math.round(remaining * 100) / 100,
          });
        } else {
          const value = Math.round((amount * members[i].percent) / 100 * 100) / 100;
          results.push({ name: members[i].name, value });
          remaining -= value;
        }
      }

      return results;
    };
  }, [members, totalIncome, isConfigured]);

  return { members, totalIncome, split, isConfigured };
}
