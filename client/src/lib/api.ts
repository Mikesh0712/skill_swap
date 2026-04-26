import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '/api' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'),
  withCredentials: true,
});

export default api;
