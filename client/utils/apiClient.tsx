import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { router } from 'expo-router';

const api = axios.create({
  baseURL: 'https://api-trackit.vercel.app',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Not harmful, just doesn't matter on React Native
});

// AsyncStorage-based token getter
const getAccessToken = async () => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    return token;
  } catch (e) {
    console.error('Failed to get access token:', e);
    return null;
  }
};

// Request Interceptor
api.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // clear all async storage
      await AsyncStorage.clear();
      Alert.alert('Session Expired', 'Please log in again.');
      router.push('/(auth)/login');
    }
    return Promise.reject(error);
  }
);

export default api;
