import { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useShellTabs, type TermLine } from '../hooks/useShell';
import { colors } from '../theme/tokens';

const LINE_COLORS: Record<TermLine['type'], string> = {
  stdout: '#e2e8f0',
  stderr: colors.error,
  input: colors.accent,
  system: colors.textMuted,
};

function TermLineRow({ line }: { line: TermLine }) {
  return (
    <Text selectable style={[styles.lineText, { color: LINE_COLORS[line.type] }]}>
      {line.text}
    </Text>
  );
}

export default function TerminalScreen() {
  const {
    tabs,
    activeTab,
    activeTabId,
    setActiveTabId,
    exec,
    kill,
    sendInput,
    clearTab,
    addTab,
    closeTab,
  } = useShellTabs();

  const [input, setInput] = useState('');
  const listRef = useRef<FlatList<TermLine>>(null);

  // Auto-scroll to bottom when lines change
  useEffect(() => {
    if (activeTab.lines.length > 0) {
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 50);
    }
  }, [activeTab.lines.length]);

  function handleSubmit() {
    const cmd = input.trim();
    if (!cmd) return;
    if (activeTab.running) {
      sendInput(activeTabId, cmd + '\n');
    } else {
      exec(activeTabId, cmd);
    }
    setInput('');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Tab bar */}
        <View style={styles.tabBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabScroll}
          >
            {tabs.map((tab) => (
              <Pressable
                key={tab.id}
                onPress={() => setActiveTabId(tab.id)}
                style={[
                  styles.tab,
                  tab.id === activeTabId && styles.tabActive,
                ]}
              >
                {tab.running && (
                  <View style={styles.runningDot} />
                )}
                <Text
                  style={[
                    styles.tabText,
                    tab.id === activeTabId && styles.tabTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {tab.title}
                </Text>
                {tabs.length > 1 && (
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                    hitSlop={8}
                    style={styles.tabClose}
                  >
                    <Feather name="x" size={12} color={colors.textMuted} />
                  </Pressable>
                )}
              </Pressable>
            ))}
          </ScrollView>

          {/* New tab button */}
          <Pressable onPress={addTab} style={styles.addTabBtn}>
            <Feather name="plus" size={18} color={colors.textMuted} />
          </Pressable>

          {/* Actions */}
          <View style={styles.headerActions}>
            {activeTab.running && (
              <Pressable onPress={() => kill(activeTabId)} style={styles.headerBtn}>
                <Feather name="square" size={14} color={colors.error} />
              </Pressable>
            )}
            <Pressable onPress={() => clearTab(activeTabId)} style={styles.headerBtn}>
              <Feather name="trash-2" size={14} color={colors.textMuted} />
            </Pressable>
          </View>
        </View>

        {/* Output */}
        <FlatList
          ref={listRef}
          data={activeTab.lines}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <TermLineRow line={item} />}
          style={styles.output}
          contentContainerStyle={styles.outputContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Type a command below to run it on your FutureBox.
            </Text>
          }
        />

        {/* Input */}
        <View style={styles.inputRow}>
          <Text style={styles.prompt}>$</Text>
          <TextInput
            style={styles.input}
            placeholder="command..."
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSubmit}
            returnKeyType="send"
            autoCapitalize="none"
            autoCorrect={false}
            editable={true}
          />
          <Pressable
            onPress={activeTab.running ? () => kill(activeTabId) : handleSubmit}
            style={styles.sendBtn}
          >
            <Feather
              name={activeTab.running ? 'square' : 'play'}
              size={18}
              color={activeTab.running ? colors.error : colors.accent}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0c0c0c' },
  flex: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingRight: 4,
  },
  tabScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
    paddingVertical: 6,
    gap: 2,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#1e1e1e',
  },
  tabText: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  tabTextActive: {
    color: colors.text,
  },
  tabClose: {
    padding: 2,
  },
  runningDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  addTabBtn: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    marginLeft: 'auto',
    gap: 8,
    paddingRight: 8,
  },
  headerBtn: {
    padding: 4,
  },
  output: {
    flex: 1,
    backgroundColor: '#0c0c0c',
  },
  outputContent: {
    padding: 12,
    paddingBottom: 8,
  },
  lineText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    lineHeight: 20,
  },
  emptyText: {
    color: colors.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    textAlign: 'center',
    paddingTop: 40,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  prompt: {
    color: colors.accent,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 15,
    fontWeight: '700',
  },
  input: {
    flex: 1,
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    paddingVertical: 6,
  },
  sendBtn: {
    padding: 6,
  },
});
