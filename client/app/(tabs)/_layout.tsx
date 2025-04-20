import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import { Home, Package, Calendar, Truck, User, Store } from 'lucide-react-native';

export default function TabLayout() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const userType = user?.userType || 'business';

  // Protect tab routes - redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated]);

  // If not authenticated, don't render tabs
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary.burgundy,
        tabBarInactiveTintColor: Colors.neutral.gray,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: Colors.neutral.extraLightGray,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        headerStyle: {
          backgroundColor: Colors.neutral.white,
        },
        headerTitleStyle: {
          color: Colors.neutral.black,
          fontWeight: '600',
        },
      }}
    >
      {/* Dashboard Tab - For business owners and event managers */}
      {(userType === 'business' || userType === 'organizer') && (
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color }) => <Home size={24} color={color} />,
          }}
        />
      )}

      {/* Inventory Tab - For business owners and suppliers */}
      {(userType === 'business' || userType === 'supplier') && (
        <Tabs.Screen
          name="inventory"
          options={{
            title: 'Inventory',
            tabBarIcon: ({ color }) => <Package size={24} color={color} />,
          }}
        />
      )}

      {/* Supplier Dashboard - Only for supplier user types */}
      {userType === 'supplier' && (
        <Tabs.Screen
          name="supplier-dashboard"
          options={{
            title: 'Orders',
            tabBarIcon: ({ color }) => <Store size={24} color={color} />,
          }}
        />
      )}

      {/* Supply Chain Tab - Only for business owners */}
      {userType === 'business' && (
        <Tabs.Screen
          name="supply-chain"
          options={{
            title: 'Supply Chain',
            tabBarIcon: ({ color }) => <Truck size={24} color={color} />,
          }}
        />
      )}

      {/* Events Tab - For business owners and event managers */}
      {(userType === 'business' || userType === 'organizer') && (
        <Tabs.Screen
          name="events"
          options={{
            title: 'Events',
            tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
          }}
        />
      )}

      {/* Profile Tab - For all user types */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}