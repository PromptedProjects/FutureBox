import { useState, useEffect, useCallback, useRef } from 'react';
import { getStatus } from '../services/api';
import type { SystemStatus } from '../types/models';

export function useStatus(pollIntervalMs = 10_000) {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const fetch = useCallback(async () => {
    const res = await getStatus();
    if (res.ok) {
      setStatus(res.data as SystemStatus);
      setError(null);
    } else {
      setError(res.error);
    }
  }, []);

  useEffect(() => {
    fetch();
    intervalRef.current = setInterval(fetch, pollIntervalMs);
    return () => clearInterval(intervalRef.current);
  }, [fetch, pollIntervalMs]);

  return { status, error, refresh: fetch };
}
