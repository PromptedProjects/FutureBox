import { useEffect } from 'react';
import { useAuthStore } from '../stores/auth.store';
import { useConnectionStore } from '../stores/connection.store';
import { wsManager } from '../services/ws';

/**
 * Manages WS connection lifecycle.
 * Connect when authenticated, disconnect when not.
 */
export function useConnection() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const wsState = useConnectionStore((s) => s.wsState);

  useEffect(() => {
    if (isAuthenticated) {
      wsManager.connect();
    } else {
      wsManager.disconnect();
    }
    return () => {
      wsManager.disconnect();
    };
  }, [isAuthenticated]);

  return { wsState, isConnected: wsState === 'connected' };
}
