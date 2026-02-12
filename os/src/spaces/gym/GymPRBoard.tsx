import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { getSpaceData } from '../space-manager';
import { colors } from '../../theme/tokens';

interface PREntry {
  exercise: string;
  weight: number;
}

export default function GymPRBoard({ spaceId }: { spaceId: string }) {
  const [prs, setPrs] = useState<PREntry[]>([]);

  useEffect(() => {
    loadPRs();
  }, []);

  const loadPRs = async () => {
    const data = await getSpaceData(spaceId);
    const prMap = (data.prs as Record<string, number>) || {};
    const entries = Object.entries(prMap)
      .map(([exercise, weight]) => ({ exercise, weight }))
      .sort((a, b) => b.weight - a.weight);
    setPrs(entries);
  };

  const renderPR = ({ item, index }: { item: PREntry; index: number }) => (
    <View style={styles.row}>
      <View style={styles.rank}>
        <Text style={styles.rankText}>
          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
        </Text>
      </View>
      <Text style={styles.exerciseName}>{item.exercise}</Text>
      <Text style={styles.weight}>{item.weight} lbs</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Personal Records</Text>
      <FlatList
        data={prs}
        keyExtractor={(p) => p.exercise}
        renderItem={renderPR}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No PRs yet. Start logging workouts to track your records!
          </Text>
        }
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    padding: 12,
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  list: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSurface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  rank: {
    width: 32,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 18,
    color: colors.text,
  },
  exerciseName: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  weight: {
    color: colors.warning,
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 30,
    fontSize: 14,
  },
});
