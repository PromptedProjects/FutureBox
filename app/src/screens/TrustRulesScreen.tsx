import { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Btn from '../components/Btn';
import TrustRuleRow from '../components/TrustRuleRow';
import { useTrustRules } from '../hooks/useTrustRules';
import { colors } from '../theme/tokens';
import type { TrustDecision, TrustRule } from '../types/models';

interface Props {
  onBack: () => void;
}

export default function TrustRulesScreen({ onBack }: Props) {
  const { rules, loading, fetchRules, createRule, deleteRule } = useTrustRules();
  const [showCreate, setShowCreate] = useState(false);
  const [service, setService] = useState('');
  const [action, setAction] = useState('');
  const [decision, setDecision] = useState<TrustDecision>('ask');

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  async function handleCreate() {
    if (!service.trim() || !action.trim()) return;
    await createRule(service.trim(), action.trim(), decision);
    setService('');
    setAction('');
    setShowCreate(false);
  }

  function handleDelete(id: string) {
    Alert.alert('Delete Rule', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteRule(id) },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable onPress={onBack}>
            <Feather name="arrow-left" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Trust Rules</Text>
          <Pressable onPress={() => setShowCreate((v) => !v)}>
            <Feather name="plus" size={24} color={colors.accent} />
          </Pressable>
        </View>

        {showCreate && (
          <View style={styles.createForm}>
            <TextInput
              style={styles.input}
              placeholder="Service (e.g. shell)"
              placeholderTextColor={colors.textMuted}
              value={service}
              onChangeText={setService}
            />
            <TextInput
              style={styles.input}
              placeholder="Action (e.g. exec)"
              placeholderTextColor={colors.textMuted}
              value={action}
              onChangeText={setAction}
            />
            <View style={styles.decisionRow}>
              {(['auto_approve', 'auto_deny', 'ask'] as TrustDecision[]).map((d) => (
                <Btn
                  key={d}
                  size="sm"
                  backgroundColor={decision === d ? colors.accent : colors.bgElevated}
                  color={decision === d ? 'white' : colors.textSecondary}
                  onPress={() => setDecision(d)}
                >
                  {d.replace(/_/g, ' ')}
                </Btn>
              ))}
            </View>
            <Btn backgroundColor={colors.accent} color="white" onPress={handleCreate}>
              Create Rule
            </Btn>
          </View>
        )}

        <FlatList
          data={rules}
          keyExtractor={(item) => item.id}
          renderItem={({ item }: { item: TrustRule }) => (
            <TrustRuleRow rule={item} onDelete={handleDelete} />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                {loading ? 'Loading...' : 'No trust rules configured'}
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
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
  },
  createForm: {
    padding: 16,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  input: {
    backgroundColor: colors.bgElevated,
    color: colors.text,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  decisionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  empty: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
  },
});
