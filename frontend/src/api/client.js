import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

api.interceptors.request.use((config) => {
  const auth = localStorage.getItem('liyamu-auth');
  if (auth) {
    const parsed = JSON.parse(auth);
    config.headers.Authorization = `Bearer ${parsed.token}`;
  }
  return config;
});

export default api;
