import { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useSpacesStore } from '../stores/spaces.store';
import { useSpaceChat } from '../hooks/useSpaceChat';
import ChatInput from '../components/ChatInput';
import MessageBubble from '../components/MessageBubble';
import StreamingText from '../components/StreamingText';
import TypingIndicator from '../components/TypingIndicator';
import ToolStatusBar from '../components/ToolStatusBar';
import { colors } from '../theme/tokens';
import type { AuthenticatedStackParamList } from '../navigation/RootNavigator';
import type { Message } from '../types/models';

type Route = RouteProp<AuthenticatedStackParamList, 'SpaceChat'>;

export default function SpaceChatScreen() {
  const { params } = useRoute<Route>();
  const nav = useNavigation();
  const spaces = useSpacesStore((s) => s.spaces);
  const space = spaces.find((s) => s.id === params.spaceId);
  const listRef = useRef<FlatList>(null);

  const {
    messages,
    streamingContent,
    isStreaming,
    toolActivities,
    sendMessage,
    cancelStream,
  } = useSpaceChat(params.spaceId);

  // Send initial buddy message based on entry choice
  useEffect(() => {
    if (params.entryChoice === 'go' && space && messages.length === 0) {
      sendMessage("Let's go! What's the plan for today?");
    }
  }, []); // intentionally run once

  const scrollToEnd = useCallback(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  useEffect(() => {
    scrollToEnd();
  }, [messages.length, streamingContent, scrollToEnd]);

  if (!space) return null;

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageBubble message={item} />
  );

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => nav.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.buddyAvatar}>{space.buddy.avatar}</Text>
        <Text style={styles.title}>{space.buddy.name}</Text>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        ListFooterComponent={
          <>
            {toolActivities.length > 0 && <ToolStatusBar activities={toolActivities} />}
            {isStreaming && streamingContent ? (
              <View style={styles.streamingWrap}>
                <StreamingText content={streamingContent} />
              </View>
            ) : isStreaming ? (
              <TypingIndicator />
            ) : null}
          </>
        }
      />

      <ChatInput
        onSend={(text) => sendMessage(text)}
        onCancel={cancelStream}
        isStreaming={isStreaming}
      />
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
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: 4,
  },
  buddyAvatar: {
    fontSize: 22,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  messageList: {
    padding: 12,
    paddingBottom: 8,
  },
  streamingWrap: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
