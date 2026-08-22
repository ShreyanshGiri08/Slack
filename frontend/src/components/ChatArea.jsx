import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageItem } from './MessageItem';
import { apiClient } from '../api/client';
import { Hash, Send, Smile, Sun, Moon, Sparkles, MessageSquare, Lock } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ChatArea = ({ activeDmUser, onOpenThread, onSelectUserForProfile }) => {
  const { user, activeChannel, channels, theme, toggleTheme, socket, refreshChannels } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [dmNotifications, setDmNotifications] = useState([]);
  const messagesEndRef = useRef(null);

  // Pick a stable carrier channel for DM transport (first channel in list)
  const dmCarrierChannel = channels?.[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch messages: Channel stream or isolated DM stream
  useEffect(() => {
    if (!user) return;

    const loadMessageData = async () => {
      try {
        if (activeDmUser) {
          // Dedicated 1-on-1 DM endpoint
          const res = await apiClient.get(`/dms/${activeDmUser.id}`, {
            headers: { 'X-User-Id': user.id }
          });
          setMessages(res.data);
          scrollToBottom();
        } else if (activeChannel) {
          // Public Channel endpoint
          const res = await apiClient.get(`/channels/${activeChannel.id}/messages`, {
            headers: { 'X-User-Id': user.id }
          });
          setMessages(res.data);
          scrollToBottom();

          await apiClient.post(`/channels/${activeChannel.id}/read`, {}, {
            headers: { 'X-User-Id': user.id }
          });
          refreshChannels();
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    };

    loadMessageData();
  }, [activeChannel, activeDmUser, user]);

  // Real-time WebSocket Listeners
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const { event_type, channel_id, data } = payload;

        if (event_type === 'NEW_MESSAGE') {
          const isIncomingDm = data.recipient_id === user.id || data.user_id === user.id;
          const isDmMessage = !!data.recipient_id;

          if (isDmMessage) {
            // ── DM routing: only show in DM view between the correct pair ──
            const isDmPair =
              (data.user_id === user.id && data.recipient_id === activeDmUser?.id) ||
              (data.user_id === activeDmUser?.id && data.recipient_id === user.id);

            if (activeDmUser && isDmPair) {
              setMessages(prev => prev.some(m => m.id === data.id) ? prev : [...prev, data]);
              scrollToBottom();
            }

            // 🔔 DM Notification: if the DM is for me but I'm not in that DM view
            if (data.recipient_id === user.id && data.user_id !== user.id) {
              if (!activeDmUser || activeDmUser.id !== data.user_id) {
                setDmNotifications(prev => [
                  ...prev.filter(n => n.senderId !== data.user_id),
                  {
                    senderId: data.user_id,
                    senderName: data.author?.display_name || 'Someone',
                    preview: data.content?.slice(0, 60),
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }
                ]);
              }
            }
          } else if (!isDmMessage && channel_id === activeChannel?.id) {
            // ── Public channel message: only show if no recipient_id ──
            setMessages(prev => prev.some(m => m.id === data.id) ? prev : [...prev, data]);
            scrollToBottom();
            refreshChannels();
          }
        } else if (event_type === 'MESSAGE_DELETED') {
          setMessages(prev => prev.map(m => m.id === data.message_id ? { ...m, is_deleted: true, content: '[This message was deleted]' } : m));
        } else if (event_type === 'REACTION_UPDATED') {
          setMessages(prev => prev.map(m => m.id === data.message_id ? { ...m, reactions: data.reactions } : m));
        }
      } catch (err) {
        console.error('Socket error:', err);
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => socket.removeEventListener('message', handleMessage);
  }, [socket, activeChannel, activeDmUser, user]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || !user) return;

    const textToSend = inputText.trim();
    setInputText('');
    setShowPicker(false);

    try {
      if (activeDmUser) {
        // ✅ DMs always use a dedicated carrier channel (first channel), NEVER the active public channel
        // This ensures DMs never appear in any public channel stream
        const carrierId = dmCarrierChannel?.id || activeChannel?.id;
        if (!carrierId) return;
        await apiClient.post(
          `/channels/${carrierId}/messages`,
          { content: textToSend, recipient_id: activeDmUser.id },
          { headers: { 'X-User-Id': user.id } }
        );
      } else if (activeChannel?.id) {
        // Send public channel message (no recipient_id = public)
        await apiClient.post(
          `/channels/${activeChannel.id}/messages`,
          { content: textToSend },
          { headers: { 'X-User-Id': user.id } }
        );
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Opt 4: useCallback — stable references so React.memo on MessageItem skips re-renders
  const handleDeleteMessage = useCallback(async (messageId) => {
    try {
      await apiClient.delete(`/messages/${messageId}`, {
        headers: { 'X-User-Id': user.id }
      });
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  }, [user?.id]);

  const handleAddReaction = useCallback(async (messageId, emoji) => {
    try {
      await apiClient.post(
        `/messages/${messageId}/reactions`,
        { emoji },
        { headers: { 'X-User-Id': user.id } }
      );
    } catch (err) {
      console.error('Failed to add reaction:', err);
    }
  }, [user?.id]);

  const handleRemoveReaction = useCallback(async (messageId, emoji) => {
    try {
      await apiClient.delete(`/messages/${messageId}/reactions/${emoji}`, {
        headers: { 'X-User-Id': user.id }
      });
    } catch (err) {
      console.error('Failed to remove reaction:', err);
    }
  }, [user?.id]);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slack-darkBg relative overflow-hidden transition-colors duration-300">

      {/* 🔔 DM Notification Toasts */}
      <div className="absolute top-16 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {dmNotifications.map((notif) => (
            <motion.div
              key={notif.senderId}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60 }}
              className="pointer-events-auto flex items-start gap-3 bg-indigo-600 text-white px-4 py-3 rounded-2xl shadow-2xl max-w-xs border border-indigo-400/40 cursor-pointer hover:bg-indigo-500 transition-colors"
              onClick={() => setDmNotifications(prev => prev.filter(n => n.senderId !== notif.senderId))}
            >
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 text-base">💬</div>
              <div className="min-w-0">
                <p className="text-xs font-black">DM from {notif.senderName}</p>
                <p className="text-xs text-indigo-200 truncate mt-0.5">{notif.preview}</p>
                <p className="text-[10px] text-indigo-300 mt-0.5">{notif.time} · tap to dismiss</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {/* Header bar */}
      <div className="h-14 px-6 flex items-center justify-between glass-header z-10">
        {activeDmUser ? (
          <div
            onClick={() => onSelectUserForProfile(activeDmUser)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative">
              <img src={activeDmUser.avatar_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2 group-hover:underline">
                Direct Chat with {activeDmUser.display_name} <Lock className="w-3 h-3 text-indigo-500" />
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic truncate max-w-lg">
                {activeDmUser.bio || "Software Engineer & Team Collaborator"}
              </p>
            </div>
          </div>
        ) : activeChannel ? (
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-indigo-500" />
            <h2 className="font-bold text-base text-gray-900 dark:text-white">
              {activeChannel.name}
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 border-l border-slate-300 dark:border-slate-700 pl-3 ml-1 truncate max-w-md">
              {activeChannel.description}
            </span>
          </div>
        ) : null}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Dark / Light Mode"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>
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
              onOpenUserProfile={(userProfile) => onSelectUserForProfile(userProfile)}
            />
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input composer area */}
      <div className="p-4 bg-slate-50 dark:bg-slack-darkBg border-t border-slate-200 dark:border-slate-800">
        <form onSubmit={handleSendMessage} className="relative rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all shadow-sm">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={activeDmUser ? `Private message @${activeDmUser.display_name}...` : `Message #${activeChannel?.name || 'channel'}...`}
            rows={2}
            className="w-full bg-transparent px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none resize-none"
          />

          <div className="flex items-center justify-between px-3 py-2 border-t border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowPicker(!showPicker)}
                className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Smile className="w-4 h-4" />
              </button>
            </div>

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold shadow-sm transition-all"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

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
