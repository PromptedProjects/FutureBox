import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Btn from './Btn';
import { colors } from '../theme/tokens';

interface ConfigRowProps {
  configKey: string;
  value: string;
  onSave: (key: string, value: string) => Promise<unknown>;
}

export default function ConfigRow({ configKey, value, onSave }: ConfigRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave(configKey, draft);
    setSaving(false);
    setEditing(false);
  }

  // Pretty-print the key
  const label = configKey.replace(/\./g, ' > ').replace(/_/g, ' ');

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      {editing ? (
        <View style={styles.editRow}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            autoFocus
          />
          <Btn
            size="sm"
            backgroundColor={colors.accent}
            color="white"
            icon={<Feather name="check" size={14} color="white" />}
            onPress={handleSave}
            disabled={saving}
          >
            Save
          </Btn>
        </View>
      ) : (
        <Pressable
          onPress={() => {
            setDraft(value);
            setEditing(true);
          }}
        >
          <Text style={styles.value}>{value || '(not set)'}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    textTransform: 'capitalize',
  },
  editRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.bgElevated,
    color: colors.text,
    borderColor: colors.borderLight,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  value: {
    color: colors.text,
    fontSize: 14,
    marginTop: 4,
  },
});
