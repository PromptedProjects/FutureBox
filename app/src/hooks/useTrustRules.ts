import { useState, useCallback } from 'react';
import * as api from '../services/api';
import type { TrustRule, TrustDecision } from '../types/models';

export function useTrustRules() {
  const [rules, setRules] = useState<TrustRule[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    const res = await api.getTrustRules();
    if (res.ok) setRules(res.data.rules);
    setLoading(false);
  }, []);

  const createRule = useCallback(
    async (service: string, action: string, decision: TrustDecision) => {
      const res = await api.createTrustRule({ service, action, decision });
      if (res.ok) {
        await fetchRules();
      }
      return res;
    },
    [fetchRules],
  );

  const deleteRule = useCallback(
    async (id: string) => {
      const res = await api.deleteTrustRule(id);
      if (res.ok) {
        setRules((prev) => prev.filter((r) => r.id !== id));
      }
      return res;
    },
    [],
  );

  return { rules, loading, fetchRules, createRule, deleteRule };
}
