import React, { useEffect } from "react";
import { Tabs, useRouter } from "expo-router";
import { useAuthStore } from "@/store/auth-store";
import Colors from "@/constants/colors";
import {
  Home,
  Package,
  Calendar,
  Truck,
  User,
  Store,
} from "lucide-react-native";

export default function TabLayoutOragnizer() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const userType = user?.userType || "business";

  // Protect tab routes - redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated]);

  // If not authenticated, don't render tabs
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Tabs
    >
      {}
      {(userType === "business" || userType === "organizer") && (
        <Tabs.Screen
          name="index"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color }) => <Home size={24} color={color} />,
          }}
        />
      )}

      {}
      {(userType === "business" || userType === "supplier") && (
        <Tabs.Screen
          name="inventory"
          options={{
            title: "Inventory",
            tabBarIcon: ({ color }) => <Package size={24} color={color} />,
          }}
        />
      )}

      {userType === "supplier" && (
        <Tabs.Screen
          name="supplier-dashboard"
          options={{
            title: "Orders",
            tabBarIcon: ({ color }) => <Store size={24} color={color} />,
          }}
        />
      )}

      {}
      {userType === "business" && (
        <Tabs.Screen
          name="supply-chain"
          options={{
            title: "Supply Chain",
            tabBarIcon: ({ color }) => <Truck size={24} color={color} />,
          }}
        />
      )}

      {}
      {(userType === "business" || userType === "organizer") && (
        <Tabs.Screen
          name="events"
          options={{
            title: "Events",
            tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
          }}
        />
      )}

      {}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
