import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { TrustRule } from '../types/models';
import { colors } from '../theme/tokens';

const decisionColors: Record<string, string> = {
  auto_approve: colors.success,
  auto_deny: colors.error,
  ask: colors.warning,
};

interface TrustRuleRowProps {
  rule: TrustRule;
  onDelete: (id: string) => void;
}

export default function TrustRuleRow({ rule, onDelete }: TrustRuleRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.name}>
          {rule.service} / {rule.action}
        </Text>
        <Text
          style={[
            styles.decision,
            { color: decisionColors[rule.decision] ?? colors.textMuted },
          ]}
        >
          {rule.decision.replace(/_/g, ' ')}
        </Text>
      </View>
      <Pressable onPress={() => onDelete(rule.id)} style={styles.deleteBtn}>
        <Feather name="trash-2" size={16} color={colors.error} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: colors.text,
    fontSize: 14,
  },
  decision: {
    fontSize: 12,
    fontWeight: '600',
  },
  deleteBtn: {
    padding: 8,
  },
});
