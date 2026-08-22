import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import {
  Sparkles, MessageSquare, Hash, Zap, Smile, ArrowRight,
  Sun, Moon, Users, RefreshCw, Eye, EyeOff, Lock, Globe,
  Bell, BellRing, CheckCircle, Clock, LogOut, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AVATAR_OPTIONS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Alex',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Sarah',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Jordan',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Cyber',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Neon',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Pixel',
];

// ─── Logged-In Home Dashboard ─────────────────────────────────────────────────
const LoggedInHome = ({ onEnterWorkspace }) => {
  const { user, setUser, theme, toggleTheme, channels, refreshChannels } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    refreshChannels();
    apiClient.get('/users').then(r => setMembers(r.data)).catch(() => {});
  }, []);

  // Build notifications from channels with unread counts
  useEffect(() => {
    if (!channels) return;
    const notifs = channels
      .filter(ch => ch.unread_count > 0)
      .map(ch => ({
        id: ch.id,
        type: 'unread',
        text: `${ch.unread_count} new message${ch.unread_count > 1 ? 's' : ''} in #${ch.name}`,
        time: 'Just now',
        icon: <Hash className="w-4 h-4 text-indigo-400" />,
      }));
    setNotifications(notifs.length > 0 ? notifs : [
      { id: 'welcome', type: 'info', text: `Welcome back, ${user?.display_name}! All channels are up to date.`, time: 'Now', icon: <CheckCircle className="w-4 h-4 text-emerald-400" /> }
    ]);
  }, [channels]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('mini_slack_user');
  };

  return (
    <div className={`min-h-screen w-full overflow-y-auto flex flex-col transition-colors duration-300 ${
      theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Header */}
      <header className={`h-16 px-6 flex items-center justify-between border-b backdrop-blur-md sticky top-0 z-30 ${
        theme === 'dark' ? 'border-slate-800 bg-slate-950/90' : 'border-slate-200 bg-white/90'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-black text-white shadow-lg text-base">
            S
          </div>
          <span className="font-black text-lg">Mini Slack</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
          <button
            onClick={onEnterWorkspace}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" /> Open Workspace
          </button>
          <button onClick={handleLogout} className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors" title="Log Out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 space-y-8">
        {/* Welcome Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl p-8 border flex flex-col md:flex-row items-center gap-6 ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-indigo-950/60 to-slate-900 border-indigo-800/40'
              : 'bg-gradient-to-br from-indigo-50 to-white border-indigo-100 shadow-xl'
          }`}
        >
          <img
            src={user?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username}`}
            alt="Your Avatar"
            className="w-20 h-20 rounded-2xl ring-4 ring-indigo-500/30 shadow-xl"
          />
          <div className="flex-1">
            <p className="text-sm font-semibold text-indigo-500 dark:text-indigo-400 mb-1">Welcome back 👋</p>
            <h1 className="text-3xl font-black">{user?.display_name}</h1>
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              @{user?.username} • {user?.bio || 'Team Member'}
            </p>
          </div>
          <button
            onClick={onEnterWorkspace}
            className="flex-shrink-0 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-xl shadow-indigo-600/25 flex items-center gap-2 group"
          >
            Open Workspace <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Notifications Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`rounded-3xl border p-6 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-lg'
            }`}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-base flex items-center gap-2">
                <BellRing className="w-4 h-4 text-indigo-500" /> Notifications
              </h2>
              {notifications.some(n => n.type === 'unread') && (
                <span className="px-2.5 py-1 rounded-full bg-rose-500 text-white text-[10px] font-black">
                  {notifications.filter(n => n.type === 'unread').length} new
                </span>
              )}
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {notifications.map((notif, idx) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.07 }}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border ${
                      notif.type === 'unread'
                        ? theme === 'dark'
                          ? 'bg-indigo-950/50 border-indigo-800/40'
                          : 'bg-indigo-50 border-indigo-100'
                        : theme === 'dark'
                        ? 'bg-slate-800/60 border-slate-700'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">{notif.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium leading-relaxed ${
                        theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                      }`}>{notif.text}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {notif.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <button
              onClick={onEnterWorkspace}
              className="mt-5 w-full py-2.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
            >
              View All in Workspace →
            </button>
          </motion.div>

          {/* Channels Quick Jump */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={`rounded-3xl border p-6 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-lg'
            }`}
          >
            <h2 className="font-bold text-base flex items-center gap-2 mb-5">
              <Hash className="w-4 h-4 text-indigo-500" /> Channels
            </h2>
            <div className="space-y-2">
              {(channels || []).slice(0, 7).map(ch => (
                <button
                  key={ch.id}
                  onClick={onEnterWorkspace}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    theme === 'dark'
                      ? 'hover:bg-slate-800 text-slate-300'
                      : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Hash className="w-3.5 h-3.5 text-slate-400" />
                    {ch.name}
                  </span>
                  {ch.unread_count > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                      {ch.unread_count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Online Members */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-3xl border p-6 ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-lg'
          }`}
        >
          <h2 className="font-bold text-base flex items-center gap-2 mb-5">
            <Users className="w-4 h-4 text-indigo-500" /> Workspace Members
          </h2>
          {members.length === 0 ? (
            <p className="text-sm text-slate-400">No other members yet. Invite teammates!</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {members.filter(m => m.id !== user?.id).map(member => (
                <div
                  key={member.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    theme === 'dark' ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img src={member.avatar_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-800" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">{member.display_name}</p>
                    <p className="text-[10px] text-slate-400 truncate">@{member.username}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

// ─── Public Landing Page ───────────────────────────────────────────────────────
export const LandingPage = ({ onEnterWorkspace }) => {
  const { setUser, theme, toggleTheme } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [activeTab, setActiveTab] = useState(0);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('Software Engineer & Team Collaborator');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  // If user is already logged in, show dashboard instead
  if (user) {
    return <LoggedInHome onEnterWorkspace={onEnterWorkspace} />;
  }

  const handleRandomizeAvatar = () => {
    const seed = Math.random().toString(36).substring(7);
    setSelectedAvatar(`https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      if (authMode === 'signup') {
        const res = await apiClient.post('/users/signup', {
          username, password, display_name: displayName || username, bio
        });
        if (selectedAvatar) {
          await apiClient.patch(`/users/${res.data.id}`, { avatar_url: selectedAvatar });
          res.data.avatar_url = selectedAvatar;
        }
        setUser(res.data);
        localStorage.setItem('mini_slack_user', JSON.stringify(res.data));
      } else {
        const res = await apiClient.post('/users/login', { username, password });
        setUser(res.data);
        localStorage.setItem('mini_slack_user', JSON.stringify(res.data));
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const featureSlides = [
    {
      title: "Real-time Channels & Threads",
      desc: "Organize discussions into channels like #general, #engineering, #blockchain, #web, and launch threaded replies.",
      icon: <Hash className="w-5 h-5 text-indigo-500" />,
      content: (
        <div className="space-y-3 p-5 bg-slate-900/90 border border-slate-700/60 rounded-2xl text-sm shadow-xl">
          <div className="flex items-center gap-2">
            <span className="font-bold text-indigo-400">#blockchain</span>
            <span className="text-slate-400 text-xs">Today at 10:15 AM</span>
          </div>
          <p className="text-slate-200">🚀 Smart contract deployed on testnet — gas fees were surprisingly low!</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold text-xs">
            <MessageSquare className="w-3.5 h-3.5" /> 4 Replies
          </div>
        </div>
      )
    },
    {
      title: "Emoji Reactions",
      desc: "Express feedback instantly with a full emoji picker and aggregated reaction counters per message.",
      icon: <Smile className="w-5 h-5 text-purple-500" />,
      content: (
        <div className="p-5 bg-slate-900/90 border border-slate-700/60 rounded-2xl text-sm space-y-3 shadow-xl">
          <p className="text-slate-200">Should we ship v2.0 feature specs to staging tonight?</p>
          <div className="flex gap-2 flex-wrap">
            <span className="px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-bold text-sm">🔥 8</span>
            <span className="px-3 py-1.5 rounded-full bg-slate-800 text-slate-200 font-bold text-sm">🎉 5</span>
            <span className="px-3 py-1.5 rounded-full bg-slate-800 text-slate-200 font-bold text-sm">✅ 12</span>
          </div>
        </div>
      )
    },
    {
      title: "Private Direct Messages",
      desc: "Chat 1-on-1 privately with team members, completely isolated from public channels.",
      icon: <Users className="w-5 h-5 text-pink-500" />,
      content: (
        <div className="p-5 bg-slate-900/90 border border-slate-700/60 rounded-2xl text-sm space-y-2 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md">DM</div>
            <div>
              <div className="font-bold text-white">Private Chat with Alex Chen</div>
              <div className="text-slate-400 text-xs">Software Engineer • 🟢 Online</div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const marqueeItems = [
    { text: "REAL-TIME WEBSOCKET ENGINE", icon: <Zap className="w-4 h-4 text-amber-400" /> },
    { text: "THREADED MESSAGE REPLIES", icon: <MessageSquare className="w-4 h-4 text-indigo-400" /> },
    { text: "EMOJI REACTION POPOVERS", icon: <Smile className="w-4 h-4 text-pink-400" /> },
    { text: "ISOLATED PRIVATE DIRECT MESSAGES", icon: <Lock className="w-4 h-4 text-emerald-400" /> },
    { text: "NEON POSTGRES PERSISTENCE", icon: <Globe className="w-4 h-4 text-purple-400" /> },
    { text: "BLOCKCHAIN & WEB CHANNELS", icon: <Hash className="w-4 h-4 text-cyan-400" /> },
  ];

  return (
    <div className={`min-h-screen w-full overflow-y-scroll transition-colors duration-500 flex flex-col relative selection:bg-indigo-500 selection:text-white ${
      theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-800'
    }`}>

      {/* ── Marquee Banner ── */}
      <div className="w-full bg-slate-900 border-b border-indigo-500/20 overflow-hidden z-30 py-3 flex-shrink-0">
        <div className="animate-marquee-track flex items-center gap-16 text-sm font-black tracking-widest uppercase text-indigo-400">
          {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, idx) => (
            <span key={idx} className="flex items-center gap-3 flex-shrink-0">
              {item.icon}
              <span>{item.text}</span>
              <span className="text-slate-600">•</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Floating Background Icons ── */}
      <motion.div animate={{ y: [-20, 20, -20], rotate: [0, 15, -15, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-36 left-[6%] text-indigo-500/30 pointer-events-none z-0"><Hash className="w-20 h-20" /></motion.div>
      <motion.div animate={{ y: [20, -20, 20], rotate: [0, -15, 15, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-48 right-[8%] text-purple-500/30 pointer-events-none z-0"><Zap className="w-20 h-20" /></motion.div>
      <motion.div animate={{ y: [-25, 25, -25], scale: [1, 1.15, 1] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-40 left-[10%] text-pink-500/30 pointer-events-none z-0"><Smile className="w-20 h-20" /></motion.div>
      <motion.div animate={{ y: [25, -25, 25], rotate: [0, 20, -20, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-48 right-[10%] text-indigo-500/30 pointer-events-none z-0"><MessageSquare className="w-20 h-20" /></motion.div>

      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-500/15 via-purple-500/10 to-pink-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* ── Header ── */}
      <header className={`h-20 px-8 flex items-center justify-between z-20 border-b backdrop-blur-md sticky top-0 flex-shrink-0 ${
        theme === 'dark' ? 'border-slate-800/80 bg-slate-950/90' : 'border-slate-200 bg-white/90'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span className="font-extrabold text-xl tracking-tight">
            Mini Slack <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20">v2.0</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className={`p-2.5 rounded-xl transition-all ${theme === 'dark' ? 'text-amber-400 hover:bg-slate-800' : 'text-indigo-600 hover:bg-slate-200'}`}>
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-200'}`}>
            Log In
          </button>
          <button onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5">
            Sign Up
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <main className="flex-1 flex flex-col items-center justify-start px-6 py-16 text-center z-10 w-full">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-6 max-w-5xl w-full">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 text-xs font-bold">
            <Sparkles className="w-4 h-4" /> Next-Gen Team Collaboration Platform
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none">
            Real-Time Messaging <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">Built For Speed.</span>
          </h1>
          <p className={`max-w-3xl mx-auto text-lg md:text-xl font-medium leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
            Organize work into channels (#web, #blockchain, #ai-ml), launch threaded replies, send isolated private DMs, react with emojis, and customize your profile.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
              className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 group transition-all">
              Get Started Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
              className={`w-full sm:w-auto px-10 py-4 rounded-2xl border font-bold text-base transition-colors ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm'}`}>
              Log In to Workspace
            </button>
          </div>
        </motion.div>

        {/* Feature Showcase */}
        <div className="mt-16 w-full max-w-4xl pb-24">
          <div className="flex justify-center gap-3 mb-6 flex-wrap">
            {featureSlides.map((slide, idx) => (
              <button key={idx} onClick={() => setActiveTab(idx)}
                className={`px-5 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === idx ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105'
                    : theme === 'dark' ? 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                    : 'bg-white text-slate-600 border border-slate-200 shadow-sm hover:text-slate-900'
                }`}>
                {slide.icon}<span>{slide.title}</span>
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.3 }}
              className={`p-8 rounded-3xl border shadow-2xl text-left ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xl'}`}>
              <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <h3 className="text-2xl font-bold">{featureSlides[activeTab].title}</h3>
                  <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{featureSlides[activeTab].desc}</p>
                </div>
                <div className="w-full md:w-80 flex-shrink-0">{featureSlides[activeTab].content}</div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ── Auth Modal ── */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md rounded-3xl p-8 shadow-2xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
              <div className="flex bg-slate-200 dark:bg-slate-950 p-1 rounded-xl mb-6">
                {['login', 'signup'].map(mode => (
                  <button key={mode} type="button" onClick={() => { setAuthMode(mode); setErrorMsg(''); }}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all capitalize ${authMode === mode ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400'}`}>
                    {mode === 'login' ? 'Log In' : 'Sign Up'}
                  </button>
                ))}
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-medium">{errorMsg}</div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Choose Avatar</label>
                    <div className="flex items-center gap-3">
                      <img src={selectedAvatar} alt="Avatar" className="w-12 h-12 rounded-xl bg-slate-800 ring-2 ring-indigo-500 shadow-md object-cover" />
                      <button type="button" onClick={handleRandomizeAvatar}
                        className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white transition-colors">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <div className="flex gap-1 flex-wrap">
                        {AVATAR_OPTIONS.slice(0, 4).map((av, idx) => (
                          <button key={idx} type="button" onClick={() => setSelectedAvatar(av)}
                            className={`w-8 h-8 rounded-lg overflow-hidden ring-2 transition-all ${selectedAvatar === av ? 'ring-indigo-500 scale-110' : 'ring-transparent hover:ring-slate-400'}`}>
                            <img src={av} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Username</label>
                  <input type="text" required value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. alex_chen"
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white" />
                </div>

                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Full Display Name</label>
                    <input type="text" required value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="e.g. Alex Chen"
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white" />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                      className="w-full px-4 py-3 pr-10 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-700 dark:hover:text-white">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Personal Bio</label>
                    <textarea rows={2} value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell the team about yourself..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm focus:outline-none focus:border-indigo-500 resize-none text-slate-900 dark:text-white" />
                  </div>
                )}

                <div className="pt-2 flex gap-3">
                  <button type="button" onClick={() => setShowAuthModal(false)}
                    className="flex-1 py-3 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg disabled:opacity-50 transition-all">
                    {loading ? 'Processing...' : authMode === 'login' ? 'Log In' : 'Create Account'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
