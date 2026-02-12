import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/tokens';

const PRESETS = [30, 60, 90, 120];

export default function GymTimer({ spaceId }: { spaceId: string }) {
  const [seconds, setSeconds] = useState(60);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            setRunning(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, remaining]);

  const start = () => {
    setRemaining(seconds);
    setRunning(true);
  };

  const stop = () => {
    setRunning(false);
    setRemaining(0);
  };

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rest Timer</Text>

      <Text style={styles.timer}>
        {mins}:{secs.toString().padStart(2, '0')}
      </Text>

      <View style={styles.presets}>
        {PRESETS.map((p) => (
          <Pressable
            key={p}
            style={[styles.preset, seconds === p && styles.presetActive]}
            onPress={() => {
              setSeconds(p);
              if (!running) setRemaining(p);
            }}
          >
            <Text style={[styles.presetText, seconds === p && styles.presetTextActive]}>
              {p}s
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={[styles.mainBtn, running && styles.stopBtn]}
        onPress={running ? stop : start}
      >
        <Text style={styles.mainBtnText}>{running ? 'Stop' : 'Start'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 16,
    padding: 16,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  timer: {
    color: colors.text,
    fontSize: 64,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  presets: {
    flexDirection: 'row',
    gap: 10,
  },
  preset: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  presetText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  presetTextActive: {
    color: colors.text,
  },
  mainBtn: {
    backgroundColor: colors.success,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
  },
  stopBtn: {
    backgroundColor: colors.error,
  },
  mainBtnText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
});
