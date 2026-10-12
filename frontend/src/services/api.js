import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minute timeout for processing
});

export const checkHealth = async () => {
  const resp = await api.get('/api/health');
  return resp.data;
};

export const getSampleCategories = async () => {
  const resp = await api.get('/api/samples');
  return resp.data;
};

export const stitchFiles = async (formData) => {
  const resp = await api.post('/api/stitch', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return resp.data;
};

export const stitchUrls = async (payload) => {
  const resp = await api.post('/api/stitch/url', payload);
  return resp.data;
};

export const stitchSample = async (payload) => {
  const resp = await api.post('/api/stitch/sample', payload);
  return resp.data;
};
