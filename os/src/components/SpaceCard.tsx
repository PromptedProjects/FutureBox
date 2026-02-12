import { Pressable, Text, StyleSheet, View } from 'react-native';
import { colors } from '../theme/tokens';
import type { Space } from '../spaces/types';

interface Props {
  space: Space;
  onPress: () => void;
  onLongPress?: () => void;
}

export default function SpaceCard({ space, onPress, onLongPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { borderColor: space.color + '40' },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <Text style={styles.icon}>{space.icon}</Text>
      <Text style={styles.name}>{space.name}</Text>
      <View style={[styles.buddyRow]}>
        <Text style={styles.buddyAvatar}>{space.buddy.avatar}</Text>
        <Text style={styles.buddyName}>{space.buddy.name}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.bgSurface,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    margin: 6,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  pressed: {
    backgroundColor: colors.bgHover,
    transform: [{ scale: 0.97 }],
  },
  icon: {
    fontSize: 32,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  buddyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  buddyAvatar: {
    fontSize: 14,
  },
  buddyName: {
    color: colors.textSecondary,
    fontSize: 13,
  },
});
