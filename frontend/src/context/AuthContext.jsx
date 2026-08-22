import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient, getWebSocketUrl } from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('mini_slack_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('mini_slack_theme') || 'dark';
  });

  const [activeChannel, setActiveChannel] = useState(null);
  const [channels, setChannels] = useState([]);
  const [socket, setSocket] = useState(null);

  // Apply dark class to document root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('mini_slack_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Connect WebSocket when user is logged in
  useEffect(() => {
    if (!user || !user.id) {
      if (socket) {
        socket.close();
        setSocket(null);
      }
      return;
    }

    let ws = null;
    try {
      const wsUrl = getWebSocketUrl(user.id);
      ws = new WebSocket(wsUrl);

      ws.onopen = () => console.log('WebSocket connection established');
      ws.onerror = () => console.log('WebSocket waiting for FastAPI backend...');
      ws.onclose = () => console.log('WebSocket closed cleanly');

      setSocket(ws);
    } catch (err) {
      console.warn('WebSocket setup warning:', err);
    }

    return () => {
      if (ws) ws.close();
    };
  }, [user?.id]);

  // Fetch channels list with unread indicators
  const refreshChannels = async () => {
    if (!user) return;
    try {
      const res = await apiClient.get('/channels', {
        headers: { 'X-User-Id': user.id }
      });
      setChannels(res.data);
      // ✅ FIX 1: Do NOT auto-select a channel — user starts on the empty state screen
    } catch (err) {
      console.log('Channels loading pending backend launch...');
    }
  };

  // Opt 2: Send SUBSCRIBE when user switches channels so backend routes targeted
  useEffect(() => {
    if (!socket || socket.readyState !== WebSocket.OPEN || !activeChannel) return;
    socket.send(JSON.stringify({
      type: 'SUBSCRIBE',
      channel_id: activeChannel.id
    }));
  }, [socket, activeChannel?.id]);

  useEffect(() => {
    refreshChannels();
  }, [user?.id]);

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      theme,
      toggleTheme,
      activeChannel,
      setActiveChannel,
      channels,
      setChannels,
      refreshChannels,
      socket
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
