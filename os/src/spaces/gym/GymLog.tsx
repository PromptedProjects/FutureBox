import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, FlatList, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getSpaceData, mergeSpaceData } from '../space-manager';
import { colors } from '../../theme/tokens';
import { GYM_SEED_DATA } from './gym-seed';

interface SetEntry {
  reps: number;
  weight: number;
}

interface WorkoutExercise {
  name: string;
  sets: SetEntry[];
}

interface Workout {
  date: string;
  exercises: WorkoutExercise[];
}

export default function GymLog({ spaceId }: { spaceId: string }) {
  const [exercises, setExercises] = useState<string[]>([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [todayLog, setTodayLog] = useState<WorkoutExercise[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getSpaceData(spaceId);
    const exList = (data.exercises as string[]) || (GYM_SEED_DATA.exercises as string[]);
    setExercises(exList);
    if (exList.length > 0 && !selectedExercise) setSelectedExercise(exList[0]);

    // Load today's workout
    const workouts = (data.workouts as Workout[]) || [];
    const today = new Date().toISOString().split('T')[0];
    const todayWorkout = workouts.find((w) => w.date === today);
    if (todayWorkout) setTodayLog(todayWorkout.exercises);
  };

  const logSet = useCallback(async () => {
    const r = parseInt(reps, 10);
    const w = parseFloat(weight);
    if (!selectedExercise || isNaN(r) || r <= 0) {
      Alert.alert('Invalid', 'Enter reps (and optionally weight).');
      return;
    }

    const newSet: SetEntry = { reps: r, weight: isNaN(w) ? 0 : w };
    const today = new Date().toISOString().split('T')[0];
    const data = await getSpaceData(spaceId);
    const workouts = (data.workouts as Workout[]) || [];
    let todayWorkout = workouts.find((wd) => wd.date === today);

    if (!todayWorkout) {
      todayWorkout = { date: today, exercises: [] };
      workouts.push(todayWorkout);
    }

    let exercise = todayWorkout.exercises.find((e) => e.name === selectedExercise);
    if (!exercise) {
      exercise = { name: selectedExercise, sets: [] };
      todayWorkout.exercises.push(exercise);
    }
    exercise.sets.push(newSet);

    // Update PRs
    const prs = (data.prs as Record<string, number>) || {};
    if (!isNaN(w) && w > (prs[selectedExercise] || 0)) {
      prs[selectedExercise] = w;
    }

    await mergeSpaceData(spaceId, { workouts, prs });
    setTodayLog([...todayWorkout.exercises]);
    setReps('');
    setWeight('');
  }, [selectedExercise, reps, weight, spaceId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Log</Text>

      {/* Exercise picker */}
      <FlatList
        data={exercises}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(e) => e}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.exerciseChip, selectedExercise === item && styles.chipActive]}
            onPress={() => setSelectedExercise(item)}
          >
            <Text style={[styles.chipText, selectedExercise === item && styles.chipTextActive]}>
              {item}
            </Text>
          </Pressable>
        )}
        contentContainerStyle={styles.chipRow}
      />

      {/* Input row */}
      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Reps</Text>
          <TextInput
            style={styles.input}
            value={reps}
            onChangeText={setReps}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Weight (lbs)</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <Pressable style={styles.logBtn} onPress={logSet}>
          <Feather name="plus" size={22} color={colors.text} />
        </Pressable>
      </View>

      {/* Today's log */}
      {todayLog.length > 0 && (
        <View style={styles.todaySection}>
          <Text style={styles.todayTitle}>Today</Text>
          {todayLog.map((ex) => (
            <View key={ex.name} style={styles.exerciseRow}>
              <Text style={styles.exerciseName}>{ex.name}</Text>
              <Text style={styles.setsText}>
                {ex.sets.map((s, i) => `${s.reps}x${s.weight}`).join('  ')}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    padding: 12,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  chipRow: {
    gap: 8,
    paddingVertical: 4,
  },
  exerciseChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  chipTextActive: {
    color: colors.text,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-end',
  },
  inputGroup: {
    flex: 1,
    gap: 4,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  input: {
    backgroundColor: colors.bgSurface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlign: 'center',
  },
  logBtn: {
    backgroundColor: colors.success,
    borderRadius: 10,
    padding: 12,
  },
  todaySection: {
    marginTop: 8,
    gap: 6,
  },
  todayTitle: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.bgSurface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  exerciseName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  setsText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
});
