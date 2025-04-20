import React, { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { View, ActivityIndicator } from 'react-native';
import Colors from '@/constants/colors';

// This is the entry point of the app
export default function Index() {
  const { isAuthenticated, isInitialized } = useAuthStore();

  // If auth is not initialized yet, show a loading spinner
  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary.burgundy} />
      </View>
    );
  }

  // Redirect based on authentication status
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/(auth)/login" />;
  }
}