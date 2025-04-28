import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import Colors from "@/constants/colors";
import OrderCard from "@/components/OrderCard"; // Fixed import statement
import { ArrowLeft, ShoppingCart, X } from "lucide-react-native";
import api from "@/utils/apiClient";

// HIGHLIGHT: New screen for pending orders
export default function PendingOrdersScreen() {
  const router = useRouter();

  const [pendingOrders, setPendingOrders] = React.useState([]);

  useEffect(() => {
    // Fetch pending orders from the API
    const fetchPendingOrders = async () => {
      try {
        const response = await api.get("/moderator/orders");

        // Filter orders to only include those with status 'pending'
        const filteredOrders = response.data.orders.filter(
          (order) => order.status === "pending"
        );
        setPendingOrders(filteredOrders);
      } catch (error) {
        console.error("Error fetching pending orders:", error);
      }
    };

    fetchPendingOrders();
  }, []);

  const handleOrderPress = (orderId: string) => {
    router.push({
      pathname: "/order-details",
      params: { id: orderId },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "Pending Orders",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Colors.neutral.extraLightGray },
          headerTitleStyle: { color: Colors.neutral.black, fontWeight: "600" },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={Colors.neutral.black} />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <X size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ marginLeft: 8, color: "black" }}>Back</Text>
      </View>

      <View style={styles.header}>
        <Text style={styles.subtitle}>
          {pendingOrders.length} orders awaiting fulfillment
        </Text>
      </View>

      <FlatList
        data={pendingOrders}
        renderItem={({ item }) => (
          <OrderCard order={item} onPress={() => handleOrderPress(item._id)} />
        )}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <ShoppingCart size={48} color={Colors.neutral.lightGray} />
            <Text style={styles.emptyText}>No Pending Orders</Text>
            <Text style={styles.emptySubtext}>
              All your orders have been fulfilled
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.extraLightGray,
  },
  header: {
    padding: 16,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.neutral.gray,
    marginBottom: 8,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.neutral.darkGray,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.neutral.gray,
    textAlign: "center",
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.extraLightGray,
  },
  newOrderButton: {
    backgroundColor: Colors.primary.burgundy,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  newOrderButtonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
