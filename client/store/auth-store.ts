import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';
import api from '@/utils/apiClient';
import { Alert, Platform } from 'react-native';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  deleteAccount: () => Promise<void>;
  signup: (userData: Partial<User>, password: string) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  initAuth: () => Promise<void>;
  setToken: (token: string) => Promise<void>; // New helper function
}

// Define permissions for different user types
const userPermissions = {
  business: [
    'view_dashboard',
    'view_inventory',
    'add_product',
    'scan_barcode',
    'book_event',
    'place_order',
    'track_order',
    'view_sales_report',
    'view_profile',
  ],
  supplier: [
    'view_supplier_dashboard',
    'view_inventory',
    'add_product',
    'manage_orders',
    'view_profile',
  ],
  organizer: [
    'view_dashboard',
    'manage_events',
    'add_event',
    'approve_event',
    'reject_event',
    'view_profile',
  ],
  distributor: [
    'view_dashboard',
    'manage_distribution',
    'track_deliveries',
    'view_inventory',
    'view_profile',
  ],
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      token: null,
      
      // Helper function to set token both in state and AsyncStorage
      setToken: async (token: string) => {
        try {
          // First, ensure token is saved to AsyncStorage
          await AsyncStorage.setItem('access_token', token);
          console.log('Token saved to AsyncStorage');
          
          // Then update state
          set({ token });
          
          return Promise.resolve();
        } catch (e) {
          console.error('Failed to set token:', e);
          return Promise.reject(e);
        }
      },
      
      initAuth: async () => {
        try {
          // Check if we have a token in AsyncStorage
          const storedToken = await AsyncStorage.getItem('access_token');
          if (storedToken && (!get().token || get().token !== storedToken)) {
            console.log('Found token in AsyncStorage during init, updating state');
            set({ token: storedToken });
          }
          
          set({ isInitialized: true });
          return Promise.resolve();
        } catch (e) {
          console.error('Error in initAuth:', e);
          set({ isInitialized: true });
          return Promise.resolve();
        }
      },
      
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/login', { email, password });
      
          if (res.status !== 200) {
            Alert.alert('Error', 'Invalid credentials');
            set({ isLoading: false });
            return;
          }
      
          const userData = res.data.user;
          const token = res.data.token;
          
          // Save token using our helper
          await get().setToken(token);

          console.log('Login successful, got token');
          console.log('userData', userData);
          console.log('token', token);
          
          const user: User = {
            _id: userData.id,
            name: userData.name,
            email: userData.email,
            businessName: userData.businessName,
            userType: userData.userType,
            avatar: userData.avatar,
            rating: userData.rating,
            productsCount: userData.productsCount,
            ordersCount: userData.ordersCount,
            eventsCount: userData.eventsCount,
          };
      
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false
          });
        } catch (error) {
          set({ isLoading: false });
          console.error('Login error:', error);
          Alert.alert('Error', 'Invalid credentials');
          throw error;
        }
      },
      
      logout: async () => {
        try {
          // Clear the token from AsyncStorage
          await AsyncStorage.removeItem('access_token');
          
          set({
            user: null,
            isAuthenticated: false,
            token: null
          });
        } catch (e) {
          console.error('Error in logout:', e);
        }
      },

      signup: async (userData: Partial<User>, password: string) => {
        set({ isLoading: true });
      
        try {
          console.log('userData', userData);
          
          const name = userData.name || '';
          const email = userData.email || '';
          const businessName = userData.businessName || '';
          const userType = userData.userType || 'business';
          const avatar = userData.avatar || undefined;
      
          const res = await api.post('/createUser', {
            name,
            email,
            businessName,
            userType,
            avatar,
            password
          });
      
          if (res.status !== 201) {
            Alert.alert('Error', 'Failed to create user');
            set({ isLoading: false });
            return;
          }
          
          // Get token from response
          const token = res.data.token;
          
          if (token) {
            console.log('Signup successful, got token');
            // Use our helper to ensure token is saved properly
            await get().setToken(token);
          } else {
            console.warn('No token received during signup, attempting login');
            
            // If no token is returned from signup, try to login immediately
            try {
              const loginRes = await api.post('/login', { email, password });
              if (loginRes.status === 200 && loginRes.data.token) {
                await get().setToken(loginRes.data.token);
              }
            } catch (loginErr) {
              console.error('Auto-login after signup failed:', loginErr);
            }
          }
      
          const newUser: User = {
            _id: res.data.user?.id || `u${Date.now()}`,
            name,
            email,
            businessName,
            userType,
            avatar,
            rating: 0,
            productsCount: 0,
            ordersCount: 0,
            eventsCount: 0
          };
      
          set({
            user: newUser,
            isAuthenticated: true,
            isLoading: false
          });
          
          // iOS specific workaround - add a small delay
          if (Platform.OS === 'ios') {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
      
        } catch (error) {
          set({ isLoading: false });
          console.error('Signup error:', error);
          Alert.alert('Error', 'Failed to create user');
          throw error;
        }
      },

      deleteAccount: async () => {
        set({ isLoading: true });
        try {
          const { user, token } = get();
          if (!user || !token) {
            Alert.alert('Error', 'User not authenticated');
            set({ isLoading: false });
            return;
          }
      
          const res = await api.delete(`/delete/user`);
      
          if (res.status !== 200) {
            Alert.alert('Error', 'Failed to delete account');
            set({ isLoading: false });
            return;
          }
      
          // Clear the token from AsyncStorage
          await AsyncStorage.removeItem('access_token');
          
          set({
            user: null,
            isAuthenticated: false,
            token: null,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          console.error('Delete account error:', error);
          Alert.alert('Error', 'Failed to delete account');
        }
      },
      
      hasPermission: (permission: string) => {
        const { user } = get();
        if (!user) return false;
        
        const userType = user.userType;
        return userPermissions[userType]?.includes(permission) || false;
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // We need to run initAuth after rehydration
          setTimeout(() => {
            state.initAuth();
          }, 0);
        }
      }
    }
  )
);