import { useEffect, useCallback } from 'react';
import { uid } from '../utils/uid';
import { useChatStore } from '../stores/chat.store';
import { wsManager } from '../services/ws';
import { getConversationMessages } from '../services/api';
import type { ChatTokenPayload, ChatDonePayload, ChatErrorPayload } from '../types/ws';
import type { Message } from '../types/models';

export function useChat() {
  const {
    conversationId,
    messages,
    streamingContent,
    isStreaming,
    setConversationId,
    setMessages,
    addMessage,
    appendToken,
    finishStream,
    setStreaming,
    clearStream,
  } = useChatStore();

  // Subscribe to WS events
  useEffect(() => {
    const unsubs = [
      wsManager.on<ChatTokenPayload>('chat.token', (payload) => {
        if (!useChatStore.getState().conversationId && payload.conversation_id) {
          setConversationId(payload.conversation_id);
        }
        appendToken(payload.token);
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
        finishStream(msg);
      }),
      wsManager.on<ChatErrorPayload>('chat.error', (_payload) => {
        clearStream();
      }),
    ];

    return () => unsubs.forEach((unsub) => unsub());
  }, [setConversationId, appendToken, finishStream, clearStream]);

  const sendMessage = useCallback(
    (text: string, images?: string[]) => {
      // Add optimistic user message
      const userMsg: Message = {
        id: uid(),
        conversation_id: conversationId ?? '',
        role: 'user',
        content: text,
        model: null,
        tokens_used: null,
        created_at: new Date().toISOString(),
        images: images,
      };
      addMessage(userMsg);
      setStreaming(true);

      // Send via WebSocket
      wsManager.sendChat(text, conversationId ?? undefined, images);
    },
    [conversationId, addMessage, setStreaming],
  );

  const cancelStream = useCallback(() => {
    wsManager.cancelChat();
    clearStream();
  }, [clearStream]);

  const loadConversation = useCallback(
    async (id: string) => {
      setConversationId(id);
      clearStream();
      const res = await getConversationMessages(id);
      if (res.ok) {
        setMessages(res.data.messages);
      }
    },
    [setConversationId, setMessages, clearStream],
  );

  return {
    conversationId,
    messages,
    streamingContent,
    isStreaming,
    sendMessage,
    cancelStream,
    loadConversation,
  };
}
