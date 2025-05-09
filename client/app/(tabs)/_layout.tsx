import React, { useEffect } from "react";
import { Slot, Tabs, useRouter } from "expo-router";
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
/*
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
          fontWeight: "600",
        },
      }}
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
  */
// app/(tabs)/_layout.tsx

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
