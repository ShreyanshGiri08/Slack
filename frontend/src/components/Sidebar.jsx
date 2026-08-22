import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Hash, Sun, Moon, Search, MessageSquare, Plus, User as UserIcon, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const Sidebar = ({ onOpenSearch, onOpenProfile }) => {
  const { user, theme, toggleTheme, activeChannel, setActiveChannel, channels } = useAuth();

  return (
    <div className="w-64 flex-shrink-0 flex flex-col h-full bg-slate-900 text-slate-200 dark:bg-slack-darkSidebar border-r border-slate-800 select-none">
      {/* Workspace Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/50">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20">
            S
          </div>
          <div>
            <h1 className="font-semibold text-sm leading-tight text-white flex items-center gap-1.5">
              TechCorp <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            </h1>
            <p className="text-[11px] text-slate-400">HQ-Primary-Channel</p>
          </div>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>
      </div>

      {/* Quick Search trigger */}
      <div className="px-3 pt-3">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-md bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs transition-colors border border-slate-700/50"
        >
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5" />
            <span>Search messages...</span>
          </span>
          <kbd className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-500 font-mono">⌘K</kbd>
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Tools Section */}
        <div>
          <div className="px-2 mb-1.5 text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
            Tools
          </div>
          <div className="space-y-0.5">
            <button className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:bg-slate-800/60 transition-colors">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              <span>Threads</span>
            </button>
          </div>
        </div>

        {/* Channels Section */}
        <div>
          <div className="flex items-center justify-between px-2 mb-1.5">
            <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
              Channels
            </span>
          </div>

          <div className="space-y-0.5">
            {channels.map((channel) => {
              const isActive = activeChannel?.id === channel.id;
              const hasUnread = channel.unread_count > 0;

              return (
                <button
                  key={channel.id}
                  onClick={() => setActiveChannel(channel)}
                  className={`w-full relative flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : hasUnread
                      ? 'text-white font-bold bg-slate-800/40'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Hash className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{channel.name}</span>
                  </div>

                  {/* Unread badge */}
                  {hasUnread && !isActive && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white shadow-sm animate-pulse">
                      {channel.unread_count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* User Profile Footer */}
      {user && (
        <div className="p-3 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2.5 text-left flex-1 min-w-0 p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <div className="relative flex-shrink-0">
              <img
                src={user.avatar_url}
                alt={user.display_name}
                className="w-8 h-8 rounded-lg bg-slate-700 object-cover"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
            </div>
            <div className="truncate flex-1">
              <div className="text-xs font-semibold text-white truncate">{user.display_name}</div>
              <div className="text-[11px] text-slate-400 truncate">{user.status}</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
