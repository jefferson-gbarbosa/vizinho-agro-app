import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.0.117:3333',
  timeout: 10000, // 10 segundos timeout
  headers: {
    'Content-Type': 'application/json',
  },
});
export default api;