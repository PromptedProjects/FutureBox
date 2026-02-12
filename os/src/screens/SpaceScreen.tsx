import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, FlatList, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSpacesStore } from '../stores/spaces.store';
import { buildBuddyPrompt } from '../spaces/buddy-engine';
import { colors } from '../theme/tokens';
import type { AuthenticatedStackParamList } from '../navigation/RootNavigator';
import type { SpaceApp } from '../spaces/types';

// Gym app components (lazy registry)
import GymTimer from '../spaces/gym/GymTimer';
import GymLog from '../spaces/gym/GymLog';
import GymPRBoard from '../spaces/gym/GymPRBoard';

const APP_REGISTRY: Record<string, React.ComponentType<{ spaceId: string }>> = {
  GymTimer,
  GymLog,
  GymPRBoard,
};

type Route = RouteProp<AuthenticatedStackParamList, 'Space'>;
type Nav = NativeStackNavigationProp<AuthenticatedStackParamList>;

type Tab = 'chat' | 'apps';

export default function SpaceScreen() {
  const { params } = useRoute<Route>();
  const nav = useNavigation<Nav>();
  const spaces = useSpacesStore((s) => s.spaces);
  const space = spaces.find((s) => s.id === params.spaceId);

  const [tab, setTab] = useState<Tab>('chat');
  const [greeted, setGreeted] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<'go' | 'browse' | 'skip' | null>(null);

  if (!space) {
    return (
      <SafeAreaView style={styles.root}>
        <Text style={styles.errorText}>Space not found</Text>
      </SafeAreaView>
    );
  }

  const handleEntryChoice = (choice: 'go' | 'browse' | 'skip') => {
    setSelectedEntry(choice);
    setGreeted(true);
    if (choice === 'go' || choice === 'browse') {
      setTab('chat');
      nav.navigate('SpaceChat', {
        spaceId: space.id,
        entryChoice: choice,
      });
    }
  };

  const openApp = (app: SpaceApp) => {
    const Component = APP_REGISTRY[app.component];
    if (!Component) {
      Alert.alert('Not available', `App "${app.name}" is not registered.`);
    }
    // Apps render inline below
  };

  const [activeApp, setActiveApp] = useState<string | null>(null);

  const renderAppCard = ({ item }: { item: SpaceApp }) => (
    <Pressable
      style={({ pressed }) => [styles.appCard, pressed && styles.appCardPressed]}
      onPress={() => setActiveApp(activeApp === item.component ? null : item.component)}
    >
      <Text style={styles.appIcon}>{item.icon}</Text>
      <Text style={styles.appName}>{item.name}</Text>
    </Pressable>
  );

  const ActiveAppComponent = activeApp ? APP_REGISTRY[activeApp] : null;

  return (
    <SafeAreaView style={[styles.root, { borderTopColor: space.color }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => nav.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.icon}>{space.icon}</Text>
        <Text style={styles.title}>{space.name}</Text>
      </View>

      {/* Entry greeting */}
      {!greeted && (
        <View style={styles.greetingBox}>
          <Text style={styles.buddyAvatar}>{space.buddy.avatar}</Text>
          <Text style={styles.greetingText}>{space.buddy.greeting}</Text>
          <View style={styles.entryButtons}>
            <Pressable
              style={[styles.entryBtn, { backgroundColor: space.color }]}
              onPress={() => handleEntryChoice('go')}
            >
              <Text style={styles.entryBtnText}>Let's Go</Text>
            </Pressable>
            <Pressable style={styles.entryBtnOutline} onPress={() => handleEntryChoice('browse')}>
              <Text style={[styles.entryBtnText, { color: colors.textSecondary }]}>Just Browsing</Text>
            </Pressable>
            <Pressable style={styles.entryBtnOutline} onPress={() => handleEntryChoice('skip')}>
              <Text style={[styles.entryBtnText, { color: colors.textSecondary }]}>Not Today</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Tabs */}
      {greeted && (
        <>
          <View style={styles.tabBar}>
            <Pressable
              style={[styles.tabBtn, tab === 'chat' && styles.tabActive]}
              onPress={() =>
                nav.navigate('SpaceChat', { spaceId: space.id, entryChoice: selectedEntry ?? 'browse' })
              }
            >
              <Feather name="message-circle" size={18} color={tab === 'chat' ? space.color : colors.textMuted} />
              <Text style={[styles.tabText, tab === 'chat' && { color: space.color }]}>Chat</Text>
            </Pressable>
            <Pressable style={[styles.tabBtn, tab === 'apps' && styles.tabActive]} onPress={() => setTab('apps')}>
              <Feather name="grid" size={18} color={tab === 'apps' ? space.color : colors.textMuted} />
              <Text style={[styles.tabText, tab === 'apps' && { color: space.color }]}>Apps</Text>
            </Pressable>
          </View>

          {tab === 'apps' && (
            <View style={styles.appsContainer}>
              <FlatList
                data={space.apps}
                keyExtractor={(a) => a.id}
                renderItem={renderAppCard}
                numColumns={3}
                contentContainerStyle={styles.appGrid}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No apps in this space yet.</Text>
                }
              />
              {ActiveAppComponent && (
                <View style={styles.activeAppWrap}>
                  <ActiveAppComponent spaceId={space.id} />
                </View>
              )}
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    borderTopWidth: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    padding: 4,
  },
  icon: {
    fontSize: 24,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  greetingBox: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
    gap: 12,
  },
  buddyAvatar: {
    fontSize: 48,
  },
  greetingText: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  entryButtons: {
    gap: 10,
    marginTop: 16,
    width: '100%',
  },
  entryBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  entryBtnOutline: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  entryBtnText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
  },
  tabText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  appsContainer: {
    flex: 1,
  },
  appGrid: {
    padding: 12,
  },
  appCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.bgSurface,
    borderRadius: 12,
    padding: 16,
    margin: 4,
    gap: 6,
  },
  appCardPressed: {
    backgroundColor: colors.bgHover,
  },
  appIcon: {
    fontSize: 28,
  },
  appName: {
    color: colors.text,
    fontSize: 12,
    textAlign: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 40,
  },
  activeAppWrap: {
    flex: 1,
    padding: 12,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
});
