import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSpacesStore } from '../stores/spaces.store';
import { colors } from '../theme/tokens';
import type { AuthenticatedStackParamList } from '../navigation/RootNavigator';

type Route = RouteProp<AuthenticatedStackParamList, 'EditSpace'>;
type Nav = NativeStackNavigationProp<AuthenticatedStackParamList>;

export default function EditSpaceScreen() {
  const { params } = useRoute<Route>();
  const nav = useNavigation<Nav>();
  const spaces = useSpacesStore((s) => s.spaces);
  const editSpace = useSpacesStore((s) => s.editSpace);
  const removeSpace = useSpacesStore((s) => s.removeSpace);
  const space = spaces.find((s) => s.id === params.spaceId);

  const [name, setName] = useState(space?.name ?? '');
  const [personality, setPersonality] = useState(space?.buddy.personality ?? '');

  if (!space) return null;

  const handleSave = async () => {
    await editSpace(space.id, {
      name: name.trim() || space.name,
      buddy: { ...space.buddy, personality: personality.trim() || space.buddy.personality },
    });
    nav.goBack();
  };

  const handleDelete = () => {
    Alert.alert('Delete Space', `Delete "${space.name}" and all its data?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await removeSpace(space.id);
          nav.goBack();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => nav.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Edit {space.name}</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.label}>Space Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>Buddy Personality</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={personality}
          onChangeText={setPersonality}
          multiline
          numberOfLines={4}
          placeholderTextColor={colors.textMuted}
        />

        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </Pressable>

        <Pressable style={styles.deleteBtn} onPress={handleDelete}>
          <Feather name="trash-2" size={18} color={colors.error} />
          <Text style={styles.deleteBtnText}>Delete Space</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { padding: 4 },
  title: { color: colors.text, fontSize: 20, fontWeight: '700' },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 8, paddingBottom: 40 },
  label: { color: colors.textSecondary, fontSize: 13, fontWeight: '500', marginTop: 8 },
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
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  saveBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  saveBtnText: { color: colors.text, fontSize: 16, fontWeight: '600' },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginTop: 12,
  },
  deleteBtnText: { color: colors.error, fontSize: 15 },
});
