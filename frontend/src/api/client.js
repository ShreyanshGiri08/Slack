import axios from 'axios';

// Dynamically use current hostname so requests succeed regardless of local IP or localhost origin
const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const API_BASE_URL = `http://${hostname}:8000/api/v1`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getWebSocketUrl = (userId) => {
  return `ws://${hostname}:8000/ws/workspace/${userId}`;
};
