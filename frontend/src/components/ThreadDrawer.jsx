import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { X, Send, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ThreadDrawer = ({ parentMessage, onClose }) => {
  const { user } = useAuth();
  const [threadData, setThreadData] = useState({ parent: parentMessage, replies: [] });
  const [replyText, setReplyText] = useState('');

  const loadThread = async () => {
    if (!parentMessage) return;
    try {
      const res = await apiClient.get(`/messages/${parentMessage.id}/thread`, {
        headers: { 'X-User-Id': user?.id }
      });
      setThreadData(res.data);
    } catch (err) {
      console.error('Failed to load thread:', err);
    }
  };

  useEffect(() => {
    loadThread();
  }, [parentMessage]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !parentMessage || !user) return;

    try {
      await apiClient.post(
        `/channels/${parentMessage.channel_id}/messages`,
        { content: replyText.trim(), parent_id: parentMessage.id },
        { headers: { 'X-User-Id': user.id } }
      );
      setReplyText('');
      loadThread();
    } catch (err) {
      console.error('Failed to send reply:', err);
    }
  };

  if (!parentMessage) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-96 flex-shrink-0 h-full border-l border-gray-200 dark:border-slate-800 bg-white dark:bg-slack-darkBg flex flex-col shadow-2xl z-20"
      >
        {/* Thread Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">Thread</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thread Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Parent Message Card */}
          {threadData.parent && (
            <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
              <div className="flex items-center gap-2 mb-1">
                <img
                  src={threadData.parent.author?.avatar_url}
                  alt="Avatar"
                  className="w-6 h-6 rounded-md object-cover"
                />
                <span className="text-xs font-bold text-gray-900 dark:text-white">
                  {threadData.parent.author?.display_name}
                </span>
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                {threadData.parent.content}
              </p>
            </div>
          )}

          {/* Reply Divider */}
          <div className="flex items-center gap-2 my-3">
            <div className="h-px flex-1 bg-gray-200 dark:bg-slate-800" />
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              {threadData.replies.length} {threadData.replies.length === 1 ? 'Reply' : 'Replies'}
            </span>
            <div className="h-px flex-1 bg-gray-200 dark:bg-slate-800" />
          </div>

          {/* Replies Stream */}
          <div className="space-y-3">
            {threadData.replies.map((reply) => (
              <div key={reply.id} className="flex items-start gap-2.5">
                <img
                  src={reply.author?.avatar_url}
                  alt="Avatar"
                  className="w-7 h-7 rounded-md object-cover mt-0.5"
                />
                <div className="flex-1 min-w-0 bg-gray-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-gray-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      {reply.author?.display_name}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-800 dark:text-gray-200">
                    {reply.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reply Composer */}
        <div className="p-3 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slack-darkBg">
          <form onSubmit={handleSendReply} className="flex gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Reply to thread..."
              className="flex-1 px-3 py-2 rounded-lg text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
