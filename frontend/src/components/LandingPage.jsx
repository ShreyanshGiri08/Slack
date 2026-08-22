import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { Sparkles, MessageSquare, Hash, Zap, Smile, ArrowRight, Sun, Moon, Users, RefreshCw, Eye, EyeOff, Lock, Globe, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AVATAR_OPTIONS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Alex',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Sarah',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Jordan',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Cyber',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Neon',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Pixel',
];

export const LandingPage = () => {
  const { setUser, theme, toggleTheme } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [activeTab, setActiveTab] = useState(0);

  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('Software Engineer & Team Collaborator');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

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
          username,
          password,
          display_name: displayName || username,
          bio
        });
        if (selectedAvatar) {
          await apiClient.patch(`/users/${res.data.id}`, { avatar_url: selectedAvatar });
          res.data.avatar_url = selectedAvatar;
        }
        setUser(res.data);
        localStorage.setItem('mini_slack_user', JSON.stringify(res.data));
      } else {
        const res = await apiClient.post('/users/login', {
          username,
          password
        });
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
      desc: "Organize discussions into fixed channels like #general, #engineering, #random, and launch threaded replies to keep discussions contextually focused.",
      icon: <Hash className="w-6 h-6 text-indigo-500" />,
      content: (
        <div className="space-y-3 p-5 bg-slate-900/90 border border-slate-700/60 rounded-2xl text-sm shadow-xl">
          <div className="flex items-center gap-2">
            <span className="font-bold text-indigo-400">#engineering</span>
            <span className="text-slate-400 text-xs">Today at 10:15 AM</span>
          </div>
          <p className="text-slate-200">🚀 Microservice architecture deployment completed cleanly on Neon Postgres!</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold text-xs">
            <MessageSquare className="w-4 h-4" /> 4 Replies
          </div>
        </div>
      )
    },
    {
      title: "Emoji Reactions & Popovers",
      desc: "Express feedback instantly with full emoji picker integration and aggregated reaction counters.",
      icon: <Smile className="w-6 h-6 text-purple-500" />,
      content: (
        <div className="p-5 bg-slate-900/90 border border-slate-700/60 rounded-2xl text-sm space-y-3 shadow-xl">
          <p className="text-slate-200">Should we ship v2.0 feature specs to staging tonight?</p>
          <div className="flex gap-2">
            <span className="px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-bold text-xs">🔥 8</span>
            <span className="px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 font-bold text-xs">🎉 5</span>
            <span className="px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 font-bold text-xs">✅ 12</span>
          </div>
        </div>
      )
    },
    {
      title: "Isolated Private Direct Messages",
      desc: "Chat 1-on-1 privately with team members without leaking into public channels.",
      icon: <Users className="w-6 h-6 text-pink-500" />,
      content: (
        <div className="p-5 bg-slate-900/90 border border-slate-700/60 rounded-2xl text-sm space-y-2 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md text-base">DM</div>
            <div>
              <div className="font-bold text-white">Private Chat with Alex Chen</div>
              <div className="text-slate-400 text-xs">Software Engineer • Online</div>
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
  ];

  return (
    <div className={`min-h-screen w-full overflow-y-auto transition-colors duration-500 flex flex-col relative selection:bg-indigo-500 selection:text-white ${
      theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Prominent High-Impact Horizontal Ticker Marquee */}
      <div className="w-full bg-slate-900 border-b border-indigo-500/30 text-indigo-400 overflow-hidden z-30 shadow-md py-3">
        <div className="animate-marquee-track flex items-center gap-12 text-sm font-black tracking-widest uppercase">
          {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, idx) => (
            <span key={idx} className="flex items-center gap-3 flex-shrink-0">
              {item.icon}
              <span>{item.text}</span>
              <span className="text-slate-600 font-normal">•</span>
            </span>
          ))}
        </div>
      </div>

      {/* Floating Background Icons */}
      <motion.div
        animate={{ y: [-20, 20, -20], rotate: [0, 15, -15, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-36 left-[6%] text-indigo-500/40 dark:text-indigo-400/30 pointer-events-none z-0"
      >
        <Hash className="w-20 h-20" />
      </motion.div>

      <motion.div
        animate={{ y: [20, -20, 20], rotate: [0, -15, 15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-48 right-[8%] text-purple-500/40 dark:text-purple-400/30 pointer-events-none z-0"
      >
        <Zap className="w-20 h-20" />
      </motion.div>

      <motion.div
        animate={{ y: [-25, 25, -25], scale: [1, 1.15, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-40 left-[10%] text-pink-500/40 dark:text-pink-400/30 pointer-events-none z-0"
      >
        <Smile className="w-20 h-20" />
      </motion.div>

      <motion.div
        animate={{ y: [25, -25, 25], rotate: [0, 20, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-48 right-[10%] text-indigo-500/40 dark:text-indigo-400/30 pointer-events-none z-0"
      >
        <MessageSquare className="w-20 h-20" />
      </motion.div>

      {/* Navigation Header */}
      <header className={`h-20 px-8 flex items-center justify-between z-20 border-b backdrop-blur-md transition-colors ${
        theme === 'dark' ? 'border-slate-800/80 bg-slate-950/80' : 'border-slate-200/80 bg-white/80'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span className="font-extrabold text-xl tracking-tight flex items-center gap-2">
            Mini Slack <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20">v2.0</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl transition-all ${
              theme === 'dark' ? 'text-amber-400 hover:bg-slate-800' : 'text-indigo-600 hover:bg-slate-200'
            }`}
            title="Toggle Light / Dark Theme Mode"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              theme === 'dark' ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5"
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Hero Body */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center z-10 max-w-6xl mx-auto w-full relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 max-w-5xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold shadow-sm">
            <Sparkles className="w-4 h-4 text-indigo-500" /> Next-Gen Team Collaboration Platform
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none">
            Real-Time Messaging <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
              Built For Speed.
            </span>
          </h1>

          <p className={`max-w-3xl mx-auto text-lg md:text-xl font-medium leading-relaxed ${
            theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Organize work into channels, launch threaded replies, send isolated private DMs, react with emojis, and customize your profile with personal bios & avatars.
          </p>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
              className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 group transition-all"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
              className={`w-full sm:w-auto px-10 py-4 rounded-2xl border font-bold text-base transition-colors ${
                theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm'
              }`}
            >
              Log In to Workspace
            </button>
          </div>
        </motion.div>

        {/* 3D Showcase Card */}
        <div className="mt-16 w-full max-w-4xl z-10 pb-16">
          <div className="flex justify-center gap-3 mb-6 flex-wrap">
            {featureSlides.map((slide, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${
                  activeTab === idx
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105'
                    : theme === 'dark'
                    ? 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-sm'
                }`}
              >
                {slide.icon}
                <span>{slide.title}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3 }}
              className={`p-8 rounded-3xl border shadow-2xl text-left ${
                theme === 'dark' ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800 shadow-xl'
              }`}
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <h3 className="text-2xl font-bold">{featureSlides[activeTab].title}</h3>
                  <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                    {featureSlides[activeTab].desc}
                  </p>
                </div>
                <div className="w-full md:w-80 flex-shrink-0">
                  {featureSlides[activeTab].content}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Auth Modal with Password Visibility Toggle */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md rounded-3xl p-8 shadow-2xl relative border ${
                theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex bg-slate-200 dark:bg-slate-950 p-1 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    authMode === 'login' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('signup'); setErrorMsg(''); }}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    authMode === 'signup' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                      Choose Your Avatar
                    </label>
                    <div className="flex items-center gap-3 mb-2">
                      <img src={selectedAvatar} alt="Avatar" className="w-12 h-12 rounded-xl bg-slate-800 object-cover ring-2 ring-indigo-500 shadow-md" />
                      <button
                        type="button"
                        onClick={handleRandomizeAvatar}
                        className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white transition-colors"
                        title="Randomize Avatar"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. alex_chen"
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>

                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Full Display Name</label>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Alex Chen"
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pr-10 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Personal Bio</label>
                    <textarea
                      rows={2}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell the team about yourself..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm focus:outline-none focus:border-indigo-500 resize-none text-slate-900 dark:text-white"
                    />
                  </div>
                )}

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAuthModal(false)}
                    className="flex-1 py-3 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
                  >
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
