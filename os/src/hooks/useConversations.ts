import { useCallback } from 'react';
import { useChatStore } from '../stores/chat.store';
import { getConversations } from '../services/api';

export function useConversations() {
  const conversations = useChatStore((s) => s.conversations);
  const setConversations = useChatStore((s) => s.setConversations);
  const newConversation = useChatStore((s) => s.newConversation);

  const fetchConversations = useCallback(async () => {
    const res = await getConversations();
    if (res.ok) {
      setConversations(res.data.conversations);
    }
  }, [setConversations]);

  return {
    conversations,
    fetchConversations,
    newConversation,
  };
}
