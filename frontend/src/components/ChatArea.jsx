import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageItem } from './MessageItem';
import { apiClient } from '../api/client';
import { Hash, Send, Smile, Info, Sparkles } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ChatArea = ({ onOpenThread }) => {
  const { user, activeChannel, theme, socket, refreshChannels } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch channel messages and mark as read
  useEffect(() => {
    if (!activeChannel || !user) return;

    const loadChannelData = async () => {
      try {
        const res = await apiClient.get(`/channels/${activeChannel.id}/messages`, {
          headers: { 'X-User-Id': user.id }
        });
        setMessages(res.data);
        scrollToBottom();

        // Mark channel as read
        await apiClient.post(`/channels/${activeChannel.id}/read`, {}, {
          headers: { 'X-User-Id': user.id }
        });
        refreshChannels();
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    };

    loadChannelData();
  }, [activeChannel, user]);

  // Real-time WebSocket Listeners
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const { event_type, channel_id, data } = payload;

        if (event_type === 'NEW_MESSAGE' && channel_id === activeChannel?.id) {
          setMessages(prev => {
            // Avoid duplicate message append
            if (prev.some(m => m.id === data.id)) return prev;
            return [...prev, data];
          });
          scrollToBottom();
          refreshChannels();
        } else if (event_type === 'MESSAGE_DELETED') {
          setMessages(prev => prev.map(m => m.id === data.message_id ? { ...m, is_deleted: true, content: '[This message was deleted]' } : m));
        } else if (event_type === 'REACTION_UPDATED') {
          setMessages(prev => prev.map(m => m.id === data.message_id ? { ...m, reactions: data.reactions } : m));
        }
      } catch (err) {
        console.error('Socket message parse error:', err);
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => socket.removeEventListener('message', handleMessage);
  }, [socket, activeChannel]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || !activeChannel || !user) return;

    const textToSend = inputText.trim();
    setInputText('');
    setShowPicker(false);

    try {
      await apiClient.post(
        `/channels/${activeChannel.id}/messages`,
        { content: textToSend },
        { headers: { 'X-User-Id': user.id } }
      );
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await apiClient.delete(`/messages/${messageId}`, {
        headers: { 'X-User-Id': user.id }
      });
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  const handleAddReaction = async (messageId, emoji) => {
    try {
      await apiClient.post(
        `/messages/${messageId}/reactions`,
        { emoji },
        { headers: { 'X-User-Id': user.id } }
      );
    } catch (err) {
      console.error('Failed to add reaction:', err);
    }
  };

  const handleRemoveReaction = async (messageId, emoji) => {
    try {
      await apiClient.delete(`/messages/${messageId}/reactions/${emoji}`, {
        headers: { 'X-User-Id': user.id }
      });
    } catch (err) {
      console.error('Failed to remove reaction:', err);
    }
  };

  if (!activeChannel) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-slack-darkBg text-gray-400">
        Select a channel to start messaging
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-slack-darkBg relative overflow-hidden">
      {/* Header bar */}
      <div className="h-14 px-6 flex items-center justify-between glass-header z-10">
        <div className="flex items-center gap-2">
          <Hash className="w-5 h-5 text-indigo-500" />
          <h2 className="font-bold text-base text-gray-900 dark:text-white">
            {activeChannel.name}
          </h2>
          <span className="text-xs text-gray-400 border-l border-gray-300 dark:border-slate-700 pl-3 ml-1 truncate max-w-md">
            {activeChannel.description}
          </span>
        </div>
      </div>

      {/* Message Feed list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <MessageItem
              key={msg.id}
              message={msg}
              onDelete={handleDeleteMessage}
              onOpenThread={onOpenThread}
              onAddReaction={handleAddReaction}
              onRemoveReaction={handleRemoveReaction}
            />
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input composer area */}
      <div className="p-4 bg-white dark:bg-slack-darkBg border-t border-gray-100 dark:border-slate-800">
        <form onSubmit={handleSendMessage} className="relative rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/80 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all shadow-sm">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={`Message #${activeChannel.name}...`}
            rows={2}
            className="w-full bg-transparent px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none resize-none"
          />

          {/* Composer Footer Actions */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowPicker(!showPicker)}
                className="p-1.5 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-200/50 dark:hover:bg-slate-700 transition-colors"
              >
                <Smile className="w-4 h-4" />
              </button>
            </div>

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Main Composer Emoji Picker */}
          {showPicker && (
            <div className="absolute right-0 bottom-16 z-50 shadow-2xl">
              <EmojiPicker
                theme={theme === 'dark' ? 'dark' : 'light'}
                onEmojiClick={(emojiData) => {
                  setInputText(prev => prev + emojiData.emoji);
                  setShowPicker(false);
                }}
              />
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
