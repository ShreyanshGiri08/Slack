import axios from 'axios';

// Relative path leverages Vite dev server proxy to resolve origin mismatches and CORS rules seamlessly
export const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getWebSocketUrl = (userId) => {
  const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = typeof window !== 'undefined' ? window.location.host : 'localhost:3000';
  return `${protocol}//${host}/ws/workspace/${userId}`;
};
