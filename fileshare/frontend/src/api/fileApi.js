import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({ baseURL: API_BASE });

export const uploadFile = (formData, onProgress) =>
  api.post('/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      const pct = Math.round((e.loaded * 100) / e.total);
      onProgress && onProgress(pct);
    },
  });

export const getFileByToken = (token) =>
  api.get(`/files/${token}/`);

export const downloadFile = (token) =>
  `${API_BASE}/download/${token}/`;

export const deleteFile = (token) =>
  api.delete(`/files/${token}/delete/`);

export const listFiles = () =>
  api.get('/files/');
