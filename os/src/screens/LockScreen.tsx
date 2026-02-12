import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Btn from '../components/Btn';
import { colors } from '../theme/tokens';

interface LockScreenProps {
  onUnlock: () => void;
}

export default function LockScreen({ onUnlock }: LockScreenProps) {
  return (
    <View style={styles.container}>
      <Feather name="lock" size={64} color={colors.accent} />
      <Text style={styles.title}>FutureBuddy Locked</Text>
      <Text style={styles.subtitle}>Authenticate to unlock the app.</Text>
      <Btn
        backgroundColor={colors.accent}
        color="white"
        size="lg"
        onPress={onUnlock}
      >
        Unlock
      </Btn>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 48,
  },
});
