import axios from 'axios';

// Support production backend URL via VITE_API_URL, fallback to relative path for local Vite dev proxy
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getWebSocketUrl = (userId) => {
  if (import.meta.env.VITE_WS_URL) {
    return `${import.meta.env.VITE_WS_URL}/ws/workspace/${userId}`;
  }
  if (import.meta.env.VITE_API_URL) {
    const wsProtocol = import.meta.env.VITE_API_URL.startsWith('https') ? 'wss:' : 'ws:';
    const host = import.meta.env.VITE_API_URL.replace(/^https?:\/\//, '');
    return `${wsProtocol}//${host}/ws/workspace/${userId}`;
  }
  const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = typeof window !== 'undefined' ? window.location.host : 'localhost:3000';
  return `${protocol}//${host}/ws/workspace/${userId}`;
};
