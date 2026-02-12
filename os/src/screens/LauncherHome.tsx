import { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, SafeAreaView, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SpaceCard from '../components/SpaceCard';
import { useSpacesStore } from '../stores/spaces.store';
import { colors } from '../theme/tokens';
import type { Space } from '../spaces/types';
import type { AuthenticatedStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<AuthenticatedStackParamList>;

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function LauncherHome() {
  const nav = useNavigation<Nav>();
  const { spaces, loaded, loadSpaces } = useSpacesStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!loaded) loadSpaces();
  }, [loaded, loadSpaces]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSpaces();
    setRefreshing(false);
  }, [loadSpaces]);

  const openSpace = useCallback(
    (space: Space) => nav.navigate('Space', { spaceId: space.id }),
    [nav],
  );

  const renderCard = useCallback(
    ({ item }: { item: Space }) => (
      <SpaceCard
        space={item}
        onPress={() => openSpace(item)}
        onLongPress={() => nav.navigate('EditSpace', { spaceId: item.id })}
      />
    ),
    [openSpace, nav],
  );

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.brand}>FutureBuddy</Text>
      </View>

      <Text style={styles.greeting}>{getGreeting()}, Go.</Text>

      <FlatList
        data={spaces}
        keyExtractor={(s) => s.id}
        renderItem={renderCard}
        numColumns={2}
        contentContainerStyle={styles.grid}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
        ListFooterComponent={
          <Pressable
            style={({ pressed }) => [styles.createBtn, pressed && styles.createBtnPressed]}
            onPress={() => nav.navigate('CreateSpace')}
          >
            <Feather name="plus" size={20} color={colors.accent} />
            <Text style={styles.createText}>Create Space</Text>
          </Pressable>
        }
      />

      <View style={styles.bottomBar}>
        <Pressable style={styles.bottomBtn} onPress={() => nav.navigate('Tabs', { screen: 'Chat' })}>
          <Feather name="message-square" size={22} color={colors.textSecondary} />
          <Text style={styles.bottomLabel}>Chat</Text>
        </Pressable>
        <Pressable style={styles.bottomBtn} onPress={() => nav.navigate('Tabs', { screen: 'Settings' })}>
          <Feather name="settings" size={22} color={colors.textSecondary} />
          <Text style={styles.bottomLabel}>Settings</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  brand: {
    color: colors.accent,
    fontSize: 20,
    fontWeight: '700',
  },
  greeting: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '600',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  grid: {
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.bgSurface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    paddingVertical: 16,
    marginHorizontal: 6,
    marginTop: 4,
  },
  createBtnPressed: {
    backgroundColor: colors.bgHover,
  },
  createText: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '500',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bgSurface,
    paddingVertical: 10,
    paddingBottom: 16,
  },
  bottomBtn: {
    alignItems: 'center',
    gap: 2,
  },
  bottomLabel: {
    color: colors.textSecondary,
    fontSize: 11,
  },
});
