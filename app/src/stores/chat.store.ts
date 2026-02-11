import { create } from 'zustand';
import type { Message, Conversation } from '../types/models';

interface ChatState {
  conversationId: string | null;
  messages: Message[];
  streamingContent: string;
  isStreaming: boolean;
  conversations: Conversation[];

  setConversationId: (id: string | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  appendToken: (token: string) => void;
  finishStream: (message: Message) => void;
  setStreaming: (streaming: boolean) => void;
  clearStream: () => void;
  setConversations: (conversations: Conversation[]) => void;
  newConversation: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversationId: null,
  messages: [],
  streamingContent: '',
  isStreaming: false,
  conversations: [],

  setConversationId: (id) => set({ conversationId: id }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((s) => ({ messages: [...s.messages, message] })),
  appendToken: (token) =>
    set((s) => ({ streamingContent: s.streamingContent + token })),
  finishStream: (message) =>
    set((s) => ({
      messages: [...s.messages, message],
      streamingContent: '',
      isStreaming: false,
    })),
  setStreaming: (isStreaming) => set({ isStreaming }),
  clearStream: () => set({ streamingContent: '', isStreaming: false }),
  setConversations: (conversations) => set({ conversations }),
  newConversation: () =>
    set({ conversationId: null, messages: [], streamingContent: '', isStreaming: false }),
}));
