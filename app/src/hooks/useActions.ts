import { useEffect, useCallback } from 'react';
import { AppState } from 'react-native';
import { useActionsStore } from '../stores/actions.store';
import { useConnectionStore } from '../stores/connection.store';
import { wsManager } from '../services/ws';
import * as api from '../services/api';
import { sendLocalNotification } from '../services/notifications';
import type { NotificationActionPayload, NotificationInfoPayload } from '../types/ws';
import type { Action } from '../types/models';

export function useActions() {
  const { actions, setActions, addAction, removeAction } = useActionsStore();
  const setPendingBadgeCount = useConnectionStore((s) => s.setPendingBadgeCount);

  const fetchPending = useCallback(async () => {
    const res = await api.getPendingActions();
    if (res.ok) {
      setActions(res.data.actions);
      setPendingBadgeCount(res.data.actions.length);
    }
  }, [setActions, setPendingBadgeCount]);

  // Subscribe to WS action notifications
  useEffect(() => {
    const unsubs = [
      wsManager.on<NotificationActionPayload>('notification.action', (payload) => {
        const action: Action = {
          id: payload.action_id,
          conversation_id: null,
          type: payload.type,
          tier: payload.tier,
          title: payload.title,
          description: payload.description ?? null,
          payload: null,
          status: 'pending',
          created_at: new Date().toISOString(),
          resolved_at: null,
        };
        addAction(action);
        useConnectionStore.getState().incrementBadge();

        // Send local notification if app is backgrounded
        if (AppState.currentState !== 'active') {
          const tierLabel = payload.tier === 'red' ? 'HIGH' : payload.tier === 'yellow' ? 'MED' : 'LOW';
          sendLocalNotification(
            `[${tierLabel}] Action Required`,
            payload.title,
            { action_id: payload.action_id },
          );
        }
      }),
      wsManager.on<NotificationInfoPayload>('notification.info', (_payload) => {
        // Refresh to sync state after approve/deny
        fetchPending();
      }),
    ];

    return () => unsubs.forEach((unsub) => unsub());
  }, [addAction, fetchPending]);

  const approve = useCallback(
    async (id: string) => {
      const res = await api.approveAction(id);
      if (res.ok) {
        removeAction(id);
        useConnectionStore.getState().decrementBadge();
      }
      return res;
    },
    [removeAction],
  );

  const deny = useCallback(
    async (id: string) => {
      const res = await api.denyAction(id);
      if (res.ok) {
        removeAction(id);
        useConnectionStore.getState().decrementBadge();
      }
      return res;
    },
    [removeAction],
  );

  return { actions, fetchPending, approve, deny };
}
