import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { router } from 'expo-router';

const api = axios.create({
  baseURL: 'https://api-trackit.vercel.app',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor with improved error handling
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (e) {
      console.error('Error in request interceptor:', e);
      return config;
    }
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('API Error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      // clear auth token
      await AsyncStorage.removeItem('access_token');
      
      Alert.alert('Session Expired', 'Please log in again.');
      router.push('/(auth)/login');
    }
    return Promise.reject(error);
  }
);

export default api;