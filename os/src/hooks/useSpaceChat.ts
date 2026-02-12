import { useEffect, useCallback, useState, useRef } from 'react';
import { uid } from '../utils/uid';
import { wsManager } from '../services/ws';
import { useSpacesStore } from '../stores/spaces.store';
import { buildBuddyPrompt } from '../spaces/buddy-engine';
import type {
  ChatTokenPayload,
  ChatDonePayload,
  ChatErrorPayload,
  ChatToolStartPayload,
  ChatToolResultPayload,
} from '../types/ws';
import type { Message } from '../types/models';
import type { ToolActivity } from '../stores/chat.store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const convosKey = (spaceId: string) => `@futurebuddy/space/${spaceId}/convos`;

export function useSpaceChat(spaceId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [toolActivities, setToolActivities] = useState<ToolActivity[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const buddyPromptRef = useRef<string>('');
  const spaces = useSpacesStore((s) => s.spaces);

  // Build buddy prompt on mount
  useEffect(() => {
    const space = spaces.find((s) => s.id === spaceId);
    if (space) {
      buildBuddyPrompt(space).then((prompt) => {
        buddyPromptRef.current = prompt;
      });
    }
  }, [spaceId, spaces]);

  // Load persisted messages
  useEffect(() => {
    loadPersistedMessages();
  }, [spaceId]);

  const loadPersistedMessages = async () => {
    const raw = await AsyncStorage.getItem(convosKey(spaceId));
    if (raw) {
      const parsed = JSON.parse(raw) as Message[];
      setMessages(parsed);
    }
  };

  const persistMessages = async (msgs: Message[]) => {
    // Keep last 100 messages per space
    const toStore = msgs.slice(-100);
    await AsyncStorage.setItem(convosKey(spaceId), JSON.stringify(toStore));
  };

  // Subscribe to WS events
  useEffect(() => {
    const unsubs = [
      wsManager.on<ChatTokenPayload>('chat.token', (payload) => {
        if (!conversationId && payload.conversation_id) {
          setConversationId(payload.conversation_id);
        }
        setStreamingContent((prev) => prev + payload.token);
      }),
      wsManager.on<ChatToolStartPayload>('chat.tool_start', (payload) => {
        setToolActivities((prev) => [
          ...prev,
          { tool_call_id: payload.tool_call_id, tool_name: payload.tool_name, status: 'running' },
        ]);
      }),
      wsManager.on<ChatToolResultPayload>('chat.tool_result', (payload) => {
        setToolActivities((prev) =>
          prev.map((t) =>
            t.tool_call_id === payload.tool_call_id
              ? { ...t, status: payload.success ? 'done' : 'error', error: payload.error }
              : t,
          ),
        );
      }),
      wsManager.on<ChatDonePayload>('chat.done', (payload) => {
        setConversationId(payload.conversation_id);
        const msg: Message = {
          id: payload.message_id,
          conversation_id: payload.conversation_id,
          role: 'assistant',
          content: payload.content,
          model: payload.model ?? null,
          tokens_used: null,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => {
          const next = [...prev, msg];
          persistMessages(next);
          return next;
        });
        setStreamingContent('');
        setIsStreaming(false);
        setToolActivities([]);
      }),
      wsManager.on<ChatErrorPayload>('chat.error', () => {
        setStreamingContent('');
        setIsStreaming(false);
        setToolActivities([]);
      }),
    ];

    return () => unsubs.forEach((unsub) => unsub());
  }, [conversationId]);

  const sendMessage = useCallback(
    (text: string, images?: string[]) => {
      const userMsg: Message = {
        id: uid(),
        conversation_id: conversationId ?? '',
        role: 'user',
        content: text,
        model: null,
        tokens_used: null,
        created_at: new Date().toISOString(),
        images,
      };
      setMessages((prev) => {
        const next = [...prev, userMsg];
        persistMessages(next);
        return next;
      });
      setIsStreaming(true);

      wsManager.sendChat(text, conversationId ?? undefined, images, buddyPromptRef.current || undefined);
    },
    [conversationId],
  );

  const cancelStream = useCallback(() => {
    wsManager.cancelChat();
    setStreamingContent('');
    setIsStreaming(false);
    setToolActivities([]);
  }, []);

  return {
    messages,
    streamingContent,
    isStreaming,
    toolActivities,
    sendMessage,
    cancelStream,
  };
}
