import { View, Text, StyleSheet } from 'react-native';
import type { ModelInfo } from '../types/models';
import { colors } from '../theme/tokens';

interface ModelCardProps {
  model: ModelInfo;
  isSlotted?: boolean;
}

export default function ModelCard({ model, isSlotted }: ModelCardProps) {
  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.name}>
          {model.name}
          {model.size ? ` (${model.size})` : ''}
        </Text>
        <View style={styles.caps}>
          {model.capabilities.map((cap) => (
            <Text key={cap} style={styles.cap}>
              {cap}
            </Text>
          ))}
        </View>
      </View>
      {isSlotted && <Text style={styles.active}>ACTIVE</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
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
  caps: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  cap: {
    color: colors.accent,
    fontSize: 11,
  },
  active: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '600',
  },
});
