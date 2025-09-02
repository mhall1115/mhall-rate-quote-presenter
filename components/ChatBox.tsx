import React, { useState, useEffect, useRef } from 'react';
import { useChat, ChatMessage } from '../hooks/useChat';
import { User } from '../hooks/useUsers';
import { Button } from './common/Button';
import { useChatNotifications } from '../hooks/useChatNotifications';


interface ChatBoxProps {
  quoteId: string;
  user: User;
  onClose: () => void;
  loanOfficerEmail: string;
}

const MessageBubble: React.FC<{ message: ChatMessage; isOwnMessage: boolean }> = ({ message, isOwnMessage }) => {
  const alignment = isOwnMessage ? 'items-end' : 'items-start';
  const bubbleColor = isOwnMessage ? 'bg-brand' : 'bg-slate-700';
  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex flex-col ${alignment} gap-1`}>
      <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${bubbleColor}`}>
        <p className="text-white text-sm">{message.text}</p>
      </div>
      <span className="text-xs text-gray-500 px-2">{time}</span>
    </div>
  );
};


export const ChatBox: React.FC<ChatBoxProps> = ({ quoteId, user, onClose, loanOfficerEmail }) => {
  const { messages, sendMessage } = useChat(quoteId, user);
  const { markAsRead } = useChatNotifications(user);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const recipientName = user.role === 'lo' ? 'Borrower' : `LO (${loanOfficerEmail})`;

  // Mark messages as read when component mounts
  useEffect(() => {
    markAsRead(quoteId);
  }, [quoteId, markAsRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-float-in" onClick={onClose}>
      <div className="bg-slate-900 border border-white/20 rounded-2xl shadow-2xl shadow-black/50 w-full max-w-lg h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="p-4 border-b border-white/10 flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">Chat</h2>
            <p className="text-sm text-gray-400">Conversation with {recipientName}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-white/10" aria-label="Close chat">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <div className="flex-grow p-4 overflow-y-auto space-y-4">
          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} isOwnMessage={msg.senderEmail === user.email} />
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <footer className="p-4 bg-slate-950/50 border-t border-white/10">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="block w-full rounded-md border-white/20 bg-white/5 text-white focus:border-aqua focus:ring-aqua sm:text-sm"
              aria-label="Chat message input"
            />
            <Button type="submit">Send</Button>
          </form>
        </footer>
      </div>
    </div>
  );
};