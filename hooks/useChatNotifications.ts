import { useState, useEffect, useCallback } from 'react';
import { User } from './useUsers';

interface ChatReadStatus {
  lastMessageTimestamp?: number;
  loLastRead?: number;
  borrowerLastRead?: number;
}

type AllChatStatuses = Record<string, ChatReadStatus>;

const STORAGE_KEY = 'chatReadStatus';

const getStatuses = (): AllChatStatuses => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (error) {
        console.error("Failed to load chat statuses", error);
        return {};
    }
}

const saveStatuses = (statuses: AllChatStatuses) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
    } catch (error) {
        console.error("Failed to save chat statuses", error);
    }
}

export const useChatNotifications = (user: User) => {
  const [statuses, setStatuses] = useState<AllChatStatuses>(getStatuses);
  
  const loadStatuses = useCallback(() => {
    setStatuses(getStatuses());
  }, []);

  // Listen for storage changes to sync across tabs
  useEffect(() => {
    window.addEventListener('storage', loadStatuses);
    return () => window.removeEventListener('storage', loadStatuses);
  }, [loadStatuses]);

  const updateStatus = useCallback((quoteId: string, updateFn: (status: ChatReadStatus) => ChatReadStatus) => {
    setStatuses(prev => {
        const currentStatus = prev[quoteId] || {};
        const newStatus = updateFn(currentStatus);
        const newStatuses = { ...prev, [quoteId]: newStatus };
        saveStatuses(newStatuses);
        return newStatuses;
    });
  }, []);

  const markAsRead = useCallback((quoteId: string) => {
    if (!user || user.role === 'admin') return;
    const keyToUpdate = user.role === 'lo' ? 'loLastRead' : 'borrowerLastRead';
    updateStatus(quoteId, status => ({ ...status, [keyToUpdate]: Date.now() }));
  }, [user, updateStatus]);

  const updateLastMessageTimestamp = useCallback((quoteId: string, timestamp: number) => {
    updateStatus(quoteId, status => ({ ...status, lastMessageTimestamp: timestamp }));
  }, [updateStatus]);

  const hasUnread = useCallback((quoteId: string): boolean => {
    if (!user || user.role === 'admin') return false;
    const status = statuses[quoteId];
    if (!status || !status.lastMessageTimestamp) return false;

    const lastRead = user.role === 'lo' ? status.loLastRead : status.borrowerLastRead;
    return status.lastMessageTimestamp > (lastRead || 0);
  }, [user, statuses]);

  return { statuses, hasUnread, markAsRead, updateLastMessageTimestamp };
};