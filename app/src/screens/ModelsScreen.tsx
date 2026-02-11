import { useEffect } from 'react';
import { View, Text, SectionList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import ModelCard from '../components/ModelCard';
import { useModels } from '../hooks/useModels';
import { colors } from '../theme/tokens';
import type { ModelInfo } from '../types/models';

interface Props {
  onBack: () => void;
}

export default function ModelsScreen({ onBack }: Props) {
  const { grouped, slots, loading, fetchModels } = useModels();

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  // Convert grouped to SectionList data
  const sections = Object.entries(grouped).map(([provider, models]) => ({
    title: provider,
    data: models,
  }));

  function isSlotted(model: ModelInfo): boolean {
    if (!slots) return false;
    return Object.values(slots).some(
      (s) => s?.provider === model.provider && s?.model === model.id,
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable onPress={onBack}>
            <Feather name="arrow-left" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Models</Text>
        </View>

        <SectionList
          sections={sections}
          keyExtractor={(item) => `${item.provider}-${item.id}`}
          renderItem={({ item }) => (
            <ModelCard model={item} isSlotted={isSlotted(item)} />
          )}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                {loading ? 'Loading models...' : 'No models available'}
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
  },
  sectionHeader: {
    backgroundColor: colors.bgSurface,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  empty: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
  },
});
