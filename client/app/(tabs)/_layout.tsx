import { useAuthStore } from "@/store/auth-store";
import { Slot, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";

export default function TabsLayout() {
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const userType = user?.userType;

  // Set mounted to true after initial render
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only run navigation logic after component is mounted
    if (!mounted) return;
    
    if (!isAuthenticated) {
      router.replace("/(auth)/login");
    } else if (userType === "organizer") {
      console.log("Organizer user detected");
      router.replace("/(tabs)/organizer" as any);
    } else if (userType === "supplier" || userType === "distributor") {
      console.log("Supplier user detected");
      router.replace("/(tabs)/supplier" as any);
    } else if (userType === "business") {
      console.log("Business user detected");
      router.replace("/(tabs)/owner" as any);
    }
    // Add additional user type checks as needed
  }, [isAuthenticated, userType, mounted]);

  return <Slot />;
}
