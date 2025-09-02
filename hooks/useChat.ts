import { useState, useEffect, useCallback } from 'react';
import { User } from './useUsers';
import { useChatNotifications } from './useChatNotifications';


export interface ChatMessage {
  id: string;
  quoteId: string;
  senderEmail: string;
  senderRole: 'lo' | 'borrower';
  text: string;
  timestamp: number;
}

const getStorageKey = (quoteId: string) => `chatMessages_${quoteId}`;

export const useChat = (quoteId: string, user: User) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { updateLastMessageTimestamp } = useChatNotifications(user);

  const loadMessages = useCallback(() => {
    if (!quoteId) return;
    try {
      const storageKey = getStorageKey(quoteId);
      const storedMessages = localStorage.getItem(storageKey);
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to load chat messages", error);
      setMessages([]);
    }
  }, [quoteId]);
  
  // Initial load
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Listen for changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === getStorageKey(quoteId)) {
        loadMessages();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [quoteId, loadMessages]);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim() || !user || !user.role || user.role === 'admin') return;

    const timestamp = Date.now();
    const newMessage: ChatMessage = {
      id: `${timestamp}-${Math.random()}`,
      quoteId,
      senderEmail: user.email,
      senderRole: user.role,
      text: text.trim(),
      timestamp,
    };
    
    // Use a functional update to ensure we have the latest messages state
    setMessages(prevMessages => {
        const updatedMessages = [...prevMessages, newMessage];
        try {
          const storageKey = getStorageKey(quoteId);
          localStorage.setItem(storageKey, JSON.stringify(updatedMessages));
          // Also update the notification timestamp
          updateLastMessageTimestamp(quoteId, timestamp);
        } catch (error) {
          console.error("Failed to save chat message", error);
          // If save fails, return the original state to roll back
          return prevMessages;
        }
        return updatedMessages;
    });
    
  }, [quoteId, user, updateLastMessageTimestamp]);

  return { messages, sendMessage };
};