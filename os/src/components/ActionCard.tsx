import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Btn from './Btn';
import * as Haptics from 'expo-haptics';
import TierBadge from './TierBadge';
import type { Action } from '../types/models';
import { colors } from '../theme/tokens';

interface ActionCardProps {
  action: Action;
  onApprove: (id: string) => Promise<unknown>;
  onDeny: (id: string) => Promise<unknown>;
}

export default function ActionCard({ action, onApprove, onDeny }: ActionCardProps) {
  const [loading, setLoading] = useState<'approve' | 'deny' | null>(null);

  async function handleApprove() {
    setLoading('approve');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await onApprove(action.id);
    setLoading(null);
  }

  async function handleDeny() {
    setLoading('deny');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await onDeny(action.id);
    setLoading(null);
  }

  const time = new Date(action.created_at);
  const timeStr = time.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <TierBadge tier={action.tier} />
          <Text style={styles.typeText}>{action.type}</Text>
        </View>
        <Text style={styles.typeText}>{timeStr}</Text>
      </View>

      <Text style={styles.title}>{action.title}</Text>

      {action.description && (
        <Text style={styles.description} numberOfLines={3}>
          {action.description}
        </Text>
      )}

      <View style={styles.actionsRow}>
        <Btn
          size="sm"
          backgroundColor={colors.bgElevated}
          color={colors.error}
          borderColor={colors.error}
          borderWidth={1}
          icon={<Feather name="x" size={16} color={colors.error} />}
          onPress={handleDeny}
          disabled={loading !== null}
          opacity={loading === 'deny' ? 0.6 : 1}
        >
          Deny
        </Btn>
        <Btn
          size="sm"
          backgroundColor={colors.success}
          color="white"
          icon={<Feather name="check" size={16} color="white" />}
          onPress={handleApprove}
          disabled={loading !== null}
          opacity={loading === 'approve' ? 0.6 : 1}
        >
          Approve
        </Btn>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  typeText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  description: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
});
