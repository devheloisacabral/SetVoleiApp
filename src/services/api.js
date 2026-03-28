import axios from 'axios';

const api = axios.create({
  baseURL: 'backend-add-jaja', 
  timeout: 10000,
});

export default api;
