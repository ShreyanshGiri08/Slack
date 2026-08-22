import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { Hash, Sun, Moon, Search, MessageSquare, ChevronLeft, ChevronRight, LogOut, Users, Sparkles, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const Sidebar = ({ onOpenSearch, onOpenProfile, isCollapsed, onToggleCollapse, activeDmUser, onSelectDmUser, onGoHome }) => {
  const { user, setUser, theme, toggleTheme, activeChannel, setActiveChannel, channels } = useAuth();
  const [workspaceMembers, setWorkspaceMembers] = useState([]);

  useEffect(() => {
    apiClient.get('/users').then(res => {
      setWorkspaceMembers(res.data.filter(u => u.id !== user?.id));
    }).catch(err => console.error('Failed to load workspace members:', err));
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('mini_slack_user');
  };

  return (
    <motion.div
      animate={{ width: isCollapsed ? 68 : 256 }}
      transition={{ duration: 0.3, type: 'spring', damping: 25 }}
      className="flex-shrink-0 flex flex-col h-full bg-slate-100 dark:bg-slack-darkSidebar text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 select-none relative z-20"
    >
      {/* Sidebar Header */}
      <div className="h-14 px-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 bg-slate-200/50 dark:bg-slate-900/50">
        {!isCollapsed && (
          <button
            onClick={onGoHome}
            className="flex items-center space-x-2.5 truncate hover:opacity-80 transition-opacity"
            title="Go to Home Dashboard"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center font-bold text-white shadow-md flex-shrink-0 hover:shadow-indigo-500/40 hover:scale-105 transition-all">
              S
            </div>
            <div className="truncate text-left">
              <h1 className="font-bold text-sm leading-tight text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                TechCorp <Sparkles className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">HQ-Primary-Channel</p>
            </div>
          </button>
        )}
        {isCollapsed && (
          <button
            onClick={onGoHome}
            title="Go to Home Dashboard"
            className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center font-bold text-white shadow-md mx-auto hover:scale-110 transition-all"
          >
            S
          </button>
        )}

        <div className="flex items-center gap-1 ml-auto">
          {/* Collapse Toggle Button */}
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Quick Search */}
      {!isCollapsed && (
        <div className="px-3 pt-3">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-200/70 dark:bg-slate-800/60 hover:bg-slate-300/70 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs transition-colors border border-slate-300/50 dark:border-slate-700/50"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5" />
              <span>Search messages...</span>
            </span>
            <kbd className="text-[10px] bg-slate-300 dark:bg-slate-900 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-500 font-mono">⌘K</kbd>
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
        {/* Channels Section */}
        <div>
          {!isCollapsed && (
            <div className="px-2 mb-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
              Channels
            </div>
          )}

          <div className="space-y-0.5">
            {channels.map((channel) => {
              const isActive = !activeDmUser && activeChannel?.id === channel.id;
              const hasUnread = channel.unread_count > 0;

              return (
                <button
                  key={channel.id}
                  onClick={() => { onSelectDmUser(null); setActiveChannel(channel); }}
                  title={`#${channel.name}`}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : hasUnread
                      ? 'text-indigo-600 dark:text-white font-bold bg-indigo-50 dark:bg-slate-800/40'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Hash className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    {!isCollapsed && <span className="truncate">{channel.name}</span>}
                  </div>

                  {hasUnread && !isActive && !isCollapsed && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white shadow-sm">
                      {channel.unread_count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Direct Messages Section */}
        <div>
          {!isCollapsed && (
            <div className="px-2 mb-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase flex items-center justify-between">
              <span>Direct Messages</span>
              <Users className="w-3 h-3 text-slate-400" />
            </div>
          )}

          <div className="space-y-0.5">
            {workspaceMembers.map((member) => {
              const isDmActive = activeDmUser?.id === member.id;
              return (
                <button
                  key={member.id}
                  onClick={() => onSelectDmUser(member)}
                  title={member.display_name}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isDmActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img src={member.avatar_url} alt="" className="w-5 h-5 rounded-md object-cover" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-slate-900" />
                  </div>
                  {!isCollapsed && <span className="truncate">{member.display_name}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* User Footer & Theme Toggle */}
      {user && (
        <div className="p-2 border-t border-slate-200 dark:border-slate-800 bg-slate-200/50 dark:bg-slate-900/80 flex items-center justify-between">
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 text-left flex-1 min-w-0 p-1 rounded-lg hover:bg-slate-300/50 dark:hover:bg-slate-800 transition-colors"
          >
            <img src={user.avatar_url} alt="" className="w-7 h-7 rounded-lg bg-slate-700 object-cover flex-shrink-0" />
            {!isCollapsed && (
              <div className="truncate flex-1">
                <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">{user.display_name}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.status}</div>
              </div>
            )}
          </button>

          {!isCollapsed && (
            <div className="flex items-center gap-1">
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-slate-800"
                title="Toggle Theme Mode"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
              </button>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-300/50 dark:hover:bg-slate-800"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
