import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient, getWebSocketUrl } from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('mini_slack_user');
    return saved ? JSON.parse(saved) : null;
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

  // Auto login/register default user if none saved
  useEffect(() => {
    if (!user) {
      const defaultUser = { username: 'alex_chen', display_name: 'Alex Chen', status: 'Coding 🚀' };
      apiClient.post('/users/login', defaultUser).then(res => {
        setUser(res.data);
        localStorage.setItem('mini_slack_user', JSON.stringify(res.data));
      }).catch(err => console.error('Login error:', err));
    }
  }, [user]);

  // Connect WebSocket when user is available
  useEffect(() => {
    if (!user) return;
    const wsUrl = getWebSocketUrl(user.id);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => console.log('WebSocket connected');
    ws.onerror = (e) => console.error('WebSocket error:', e);

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [user]);

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
      console.error('Error fetching channels:', err);
    }
  };

  useEffect(() => {
    refreshChannels();
  }, [user]);

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
