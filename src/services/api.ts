import axios from 'axios';

const api = axios.create({
  baseURL: 'https://vizinho-agro-api.onrender.com',
  timeout: 10000, // 10 segundos timeout
  headers: {
    'Content-Type': 'application/json',
  },
});
export default api;