import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Trash2, Smile } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { motion, AnimatePresence } from 'framer-motion';

export const MessageItem = ({ message, onDelete, onOpenThread, onAddReaction, onRemoveReaction, onOpenUserProfile }) => {
  const { user, theme } = useAuth();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const isOwn = user && message.user_id === user.id;
  const isDeleted = message.is_deleted;

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
        <div className={`text-sm leading-relaxed ${isDeleted ? 'italic text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>
          {message.content}
        </div>

        {/* Reactions List */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {message.reactions.map((group, idx) => (
              <button
                key={idx}
                onClick={() => handleToggleReaction(group)}
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border transition-all ${
                  group.has_reacted
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-300 font-semibold'
                    : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                <span>{group.emoji}</span>
                <span className="text-[11px]">{group.count}</span>
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
        <div className="absolute right-4 top-2 hidden group-hover:flex items-center gap-0.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-md px-1 py-0.5 z-10">
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1.5 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              title="Add Reaction"
            >
              <Smile className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 bottom-8 z-50 shadow-2xl"
                >
                  <EmojiPicker
                    theme={theme === 'dark' ? 'dark' : 'light'}
                    onEmojiClick={handleEmojiClick}
                    width={320}
                    height={380}
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
