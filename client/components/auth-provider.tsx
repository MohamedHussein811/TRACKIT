import React, { useEffect } from "react";
import { useSegments, useRouter } from "expo-router";
import { useAuthStore } from "@/store/auth-store";

export function AuthProvider({ children }:any) {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Skip this effect if auth hasn't been initialized yet
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to the login page if not authenticated and not already in auth group
      //router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to the main app if authenticated but still in auth group
      //router.replace("/(tabs)");
    }
  }, [isAuthenticated, segments, isInitialized]);

  return children;
}