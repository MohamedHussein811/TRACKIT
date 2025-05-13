import React, { useEffect } from "react";
import { Slot, Tabs, useRouter } from "expo-router";
import { useAuthStore } from "@/store/auth-store";

export default function TabsLayout() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const userType = user?.userType;

  useEffect(() => {
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
  }, [isAuthenticated, userType]);

  return <Slot />;
}
