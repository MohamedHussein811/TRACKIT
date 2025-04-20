import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';
import api from '@/utils/apiClient';
import { Alert } from 'react-native';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  token: string | null; // Added token to the state
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (userData: Partial<User>, password: string) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  initAuth: () => Promise<void>;
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
      token: null, // Initialize token as null
      
      initAuth: async () => {
        set({ isInitialized: true });
        
        // Also ensure token is in AsyncStorage if we have one
        const { token } = get();
        if (token) {
          await AsyncStorage.setItem('access_token', token);
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
          const token = res.data.token; // Get token from response
          
          // Save token to AsyncStorage directly
          await AsyncStorage.setItem('access_token', token);
          
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
            isLoading: false,
            token // Store token in state
          });
        } catch (error) {
          set({ isLoading: false });
          console.error('Login error:', error);
          Alert.alert('Error', 'Invalid credentials');
          throw error;
        }
      },
      
      logout: async () => {
        // Clear the token from AsyncStorage
        await AsyncStorage.removeItem('access_token');
        
        set({
          user: null,
          isAuthenticated: false,
          token: null
        });
      },

      signup: async (userData: Partial<User>, password: string) => {
        set({ isLoading: true });
      
        try {
          console.log('userData', userData);
          console.log('password', password);
      
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
          
          // Get token from response - assuming it's returned like in the login response
          const token = res.data.token;
          
          // Save token to AsyncStorage directly
          if (token) {
            await AsyncStorage.setItem('access_token', token);
          } else {
            console.warn('No token received during signup');
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
            isLoading: false,
            token // Store token in state
          });
      
        } catch (error) {
          set({ isLoading: false });
          console.error('Signup error:', error);
          Alert.alert('Error', 'Failed to create user');
          throw error;
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
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.initAuth();
        }
      }
    }
  )
);