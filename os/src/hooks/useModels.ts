import { useState, useCallback } from 'react';
import * as api from '../services/api';
import type { ModelInfo, ModelSlots } from '../types/models';

export function useModels() {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [slots, setSlots] = useState<ModelSlots['slots'] | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchModels = useCallback(async () => {
    setLoading(true);
    const [modelsRes, slotsRes] = await Promise.all([
      api.getModels(),
      api.getModelSlots(),
    ]);
    if (modelsRes.ok) setModels(modelsRes.data.models);
    if (slotsRes.ok) setSlots(slotsRes.data.slots);
    setLoading(false);
  }, []);

  // Group models by provider
  const grouped = models.reduce<Record<string, ModelInfo[]>>((acc, m) => {
    (acc[m.provider] ??= []).push(m);
    return acc;
  }, {});

  return { models, grouped, slots, loading, fetchModels };
}
