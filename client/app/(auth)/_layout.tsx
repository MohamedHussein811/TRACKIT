import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="account-type" />
      <Stack.Screen name="login-info" />
      <Stack.Screen name="business-info" />
      {/* Removed subscription screens */}
    </Stack>
  );
}