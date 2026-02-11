import { useState, useCallback } from 'react';
import * as api from '../services/api';

export function useConfig() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    const res = await api.getConfig();
    if (res.ok) {
      setConfig(res.data as Record<string, string>);
    }
    setLoading(false);
  }, []);

  const updateConfig = useCallback(async (key: string, value: string) => {
    const res = await api.setConfig({ key, value });
    if (res.ok) {
      setConfig((prev) => ({ ...prev, [key]: value }));
    }
    return res;
  }, []);

  return { config, loading, fetchConfig, updateConfig };
}
