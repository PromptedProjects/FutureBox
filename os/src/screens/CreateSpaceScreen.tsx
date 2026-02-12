import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSpacesStore } from '../stores/spaces.store';
import { colors } from '../theme/tokens';
import type { AuthenticatedStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<AuthenticatedStackParamList>;

const PRESET_COLORS = ['#6366f1', '#ef4444', '#22c55e', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6'];
const PRESET_ICONS = ['🏋️', '💰', '✝️', '🥗', '📚', '💻', '🎵', '🎮', '🧘', '🏠', '🚗', '🐕'];

export default function CreateSpaceScreen() {
  const nav = useNavigation<Nav>();
  const addSpace = useSpacesStore((s) => s.addSpace);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📌');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [buddyName, setBuddyName] = useState('');
  const [personality, setPersonality] = useState('');
  const [greeting, setGreeting] = useState('');
  const [buddyAvatar, setBuddyAvatar] = useState('🤖');

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Give your space a name.');
      return;
    }
    if (!buddyName.trim()) {
      Alert.alert('Buddy name required', 'Name your buddy.');
      return;
    }

    await addSpace({
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      name: name.trim(),
      icon,
      color: selectedColor,
      buddy: {
        name: buddyName.trim(),
        personality: personality.trim() || `You are ${buddyName}, a helpful AI buddy.`,
        greeting: greeting.trim() || `Hey! I'm ${buddyName}.`,
        avatar: buddyAvatar,
      },
      apps: [],
    });
    nav.goBack();
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => nav.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Create Space</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Space name */}
        <Text style={styles.label}>Space Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Gym, Finance, Faith"
          placeholderTextColor={colors.textMuted}
        />

        {/* Icon picker */}
        <Text style={styles.label}>Icon</Text>
        <View style={styles.iconRow}>
          {PRESET_ICONS.map((ic) => (
            <Pressable
              key={ic}
              style={[styles.iconOption, icon === ic && styles.iconSelected]}
              onPress={() => setIcon(ic)}
            >
              <Text style={styles.iconText}>{ic}</Text>
            </Pressable>
          ))}
        </View>

        {/* Color picker */}
        <Text style={styles.label}>Accent Color</Text>
        <View style={styles.colorRow}>
          {PRESET_COLORS.map((c) => (
            <Pressable
              key={c}
              style={[styles.colorDot, { backgroundColor: c }, selectedColor === c && styles.colorSelected]}
              onPress={() => setSelectedColor(c)}
            />
          ))}
        </View>

        {/* Buddy config */}
        <Text style={styles.sectionTitle}>Buddy</Text>

        <Text style={styles.label}>Buddy Name</Text>
        <TextInput
          style={styles.input}
          value={buddyName}
          onChangeText={setBuddyName}
          placeholder="e.g. Coach, Advisor, Guide"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>Buddy Avatar</Text>
        <View style={styles.iconRow}>
          {['🤖', '🏋️', '💼', '🧙', '👨‍🏫', '🦸', '🐱', '🎯'].map((a) => (
            <Pressable
              key={a}
              style={[styles.iconOption, buddyAvatar === a && styles.iconSelected]}
              onPress={() => setBuddyAvatar(a)}
            >
              <Text style={styles.iconText}>{a}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Personality (system prompt)</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={personality}
          onChangeText={setPersonality}
          placeholder="Describe how this buddy should behave..."
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Greeting</Text>
        <TextInput
          style={styles.input}
          value={greeting}
          onChangeText={setGreeting}
          placeholder="What the buddy says when you open the space"
          placeholderTextColor={colors.textMuted}
        />

        <Pressable
          style={[styles.createBtn, { backgroundColor: selectedColor }]}
          onPress={handleCreate}
        >
          <Feather name="plus" size={20} color={colors.text} />
          <Text style={styles.createBtnText}>Create Space</Text>
        </Pressable>
      </ScrollView>
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
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    padding: 4,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 8,
    paddingBottom: 40,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    marginTop: 8,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.bgSurface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 4,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconSelected: {
    borderColor: colors.accent,
    borderWidth: 2,
    backgroundColor: colors.bgElevated,
  },
  iconText: {
    fontSize: 22,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSelected: {
    borderColor: colors.text,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  createBtnText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
