import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Trash2, Smile } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { motion, AnimatePresence } from 'framer-motion';

export const MessageItem = ({ message, onDelete, onOpenThread, onAddReaction, onRemoveReaction, onOpenUserProfile }) => {
  const { user, theme } = useAuth();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const pickerRef = useRef(null);
  const buttonRef = useRef(null);

  const isOwn = user && message.user_id === user.id;
  const isDeleted = message.is_deleted;

  // Close emoji picker when clicking outside
  useEffect(() => {
    if (!showEmojiPicker) return;
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target) &&
          buttonRef.current && !buttonRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showEmojiPicker]);

  const handleEmojiClick = (emojiData) => {
    onAddReaction(message.id, emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleToggleReaction = (group) => {
    if (group.has_reacted) {
      onRemoveReaction(message.id, group.emoji);
    } else {
      onAddReaction(message.id, group.emoji);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`group relative flex items-start gap-3 px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800/40 rounded-xl transition-colors ${
        isDeleted ? 'opacity-60' : ''
      }`}
    >
      {/* User Avatar - Clickable */}
      <button
        type="button"
        onClick={() => message.author && onOpenUserProfile(message.author)}
        className="flex-shrink-0 mt-0.5"
      >
        <img
          src={message.author?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${message.user_id}`}
          alt="Author Avatar"
          className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-700 object-cover hover:ring-2 hover:ring-indigo-500 transition-all"
        />
      </button>

      {/* Message Content Area */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <button
            type="button"
            onClick={() => message.author && onOpenUserProfile(message.author)}
            className="text-xs font-bold text-gray-900 dark:text-gray-100 hover:underline hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            {message.author?.display_name || 'Member'}
          </button>
          <span className="text-[10px] text-gray-400">
            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Text Content */}
        <div className={`text-sm leading-relaxed break-words ${isDeleted ? 'italic text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>
          {message.content}
        </div>

        {/* Reactions List - Clearly Visible */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {message.reactions.map((group, idx) => (
              <button
                key={idx}
                onClick={() => handleToggleReaction(group)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium border transition-all select-none ${
                  group.has_reacted
                    ? 'bg-indigo-100 dark:bg-indigo-900/60 border-indigo-400 dark:border-indigo-600 text-indigo-700 dark:text-indigo-200 font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {/* Emoji rendered at readable size */}
                <span className="text-base leading-none">{group.emoji}</span>
                <span className="text-xs font-bold">{group.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Thread replies button */}
        {message.reply_count > 0 && (
          <button
            onClick={() => onOpenThread(message)}
            className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{message.reply_count} {message.reply_count === 1 ? 'reply' : 'replies'}</span>
          </button>
        )}
      </div>

      {/* Hover Action Toolbar */}
      {!isDeleted && (
        <div className="absolute right-4 top-2 hidden group-hover:flex items-center gap-0.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg px-1 py-0.5 z-20">
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1.5 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              title="Add Reaction"
            >
              <Smile className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  ref={pickerRef}
                  initial={{ opacity: 0, scale: 0.92, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: 8 }}
                  transition={{ duration: 0.15 }}
                  // Fixed z-index above everything so it's never clipped
                  className="absolute right-0 top-8 z-[9999] shadow-2xl rounded-2xl overflow-hidden"
                  style={{ filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.4))' }}
                >
                  <EmojiPicker
                    theme={theme === 'dark' ? 'dark' : 'light'}
                    onEmojiClick={handleEmojiClick}
                    width={320}
                    height={400}
                    searchDisabled={false}
                    skinTonesDisabled
                    previewConfig={{ showPreview: false }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => onOpenThread(message)}
            className="p-1.5 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            title="Reply in Thread"
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          {isOwn && (
            <button
              onClick={() => onDelete(message.id)}
              className="p-1.5 text-gray-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              title="Delete message"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};
