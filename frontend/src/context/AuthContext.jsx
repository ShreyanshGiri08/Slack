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
    if (!user) {
      if (socket) {
        socket.close();
        setSocket(null);
      }
      return;
    }

    try {
      const wsUrl = getWebSocketUrl(user.id);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => console.log('WebSocket connected');
      ws.onerror = (e) => console.log('WebSocket connection pending...');

      setSocket(ws);

      return () => {
        ws.close();
      };
    } catch (err) {
      console.warn('WebSocket init warning:', err);
    }
  }, [user?.id]);

  // Fetch channels list with unread indicators
  const refreshChannels = async () => {
    if (!user) return;
    try {
      const res = await apiClient.get('/channels', {
        headers: { 'X-User-Id': user.id }
      });
      setChannels(res.data);
      if (!activeChannel && res.data.length > 0) {
        setActiveChannel(res.data[0]);
      }
    } catch (err) {
      console.log('Backend not reachable or channels pending');
    }
  };

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
