import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, Alert, AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import ActionCard from '../components/ActionCard';
import { useActions } from '../hooks/useActions';
import { requestNotificationPermissions } from '../services/notifications';
import { colors } from '../theme/tokens';
import type { Action } from '../types/models';

export default function ActionsScreen() {
  const { actions, fetchPending, approve, deny } = useActions();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPending();
    requestNotificationPermissions();
  }, [fetchPending]);

  // Refresh when app comes back to foreground or tab is re-focused
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') fetchPending();
    });
    return () => sub.remove();
  }, [fetchPending]);

  // Poll for fresh data while screen is mounted
  useEffect(() => {
    const interval = setInterval(fetchPending, 10_000);
    return () => clearInterval(interval);
  }, [fetchPending]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPending();
    setRefreshing(false);
  }, [fetchPending]);

  const handleApprove = useCallback(async (id: string) => {
    const res = await approve(id);
    if (!res.ok) {
      const err = 'error' in res ? (res as any).error : 'Unknown error';
      Alert.alert('Approve failed', String(err));
      fetchPending();
    }
  }, [approve, fetchPending]);

  const handleDeny = useCallback(async (id: string) => {
    const res = await deny(id);
    if (!res.ok) {
      const err = 'error' in res ? (res as any).error : 'Unknown error';
      Alert.alert('Deny failed', String(err));
      fetchPending();
    }
  }, [deny, fetchPending]);

  function renderItem({ item }: { item: Action }) {
    return <ActionCard action={item} onApprove={handleApprove} onDeny={handleDeny} />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Pending Actions</Text>
        </View>

        <FlatList
          data={actions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textMuted} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="shield-off" size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No pending actions</Text>
              <Text style={styles.emptySubtitle}>
                Actions will appear here when FutureBox needs your approval.
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  list: { padding: 16 },
  separator: { height: 12 },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    color: colors.textMuted,
    fontSize: 15,
  },
  emptySubtitle: {
    color: colors.textMuted,
    fontSize: 13,
  },
});
