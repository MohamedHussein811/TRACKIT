import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";
import { useAuthStore } from "@/store/auth-store";
import { Order } from "@/types";
import {
  Package,
  Truck,
  ShoppingCart,
  Clock,
  AlertTriangle,
  CheckCircle,
} from "lucide-react-native";
import api from "@/utils/apiClient";

export default function SupplierDashboardScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [supplierOrders, setSupplierOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch supplier orders from the API
    const fetchSupplierOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/supplier/orders");
        setSupplierOrders(response.data.orders);
      } catch (error) {
        console.error("Error fetching supplier orders:", error);
        setError("Error fetching orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchSupplierOrders();
  }, []); // Empty dependency array to run once on mount

  // Filter orders based on active tab
  const filteredOrders = supplierOrders.filter((order) => {
    if (activeTab === "all") return true;
    return order.status === activeTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return Colors.status.success;
      case "shipped":
        return Colors.status.info;
      case "processing":
        return Colors.status.warning;
      case "pending":
        return Colors.neutral.gray;
      case "new":
        return Colors.primary.burgundy;
      default:
        return Colors.neutral.gray;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle size={20} color={Colors.status.success} />;
      case "shipped":
        return <Truck size={20} color={Colors.status.info} />;
      case "processing":
        return <Package size={20} color={Colors.status.warning} />;
      case "pending":
        return <Clock size={20} color={Colors.neutral.gray} />;
      case "new":
        return <AlertTriangle size={20} color={Colors.primary.burgundy} />;
      default:
        return <ShoppingCart size={20} color={Colors.neutral.gray} />;
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const handleOrderPress = (order: Order) => {
    router.push({
      pathname: "/order-details",
      params: { id: order._id },
    });
  };

  const handleStatusPress = async (
    status:
      | "pending"
      | "confirmed"
      | "shipped"
      | "delivered"
      | "cancelled"
      | "new"
      | "processing",
    orderId: string
  ) => {
    console.log("Updating order status:", orderId, "to", status);
    const res = await api.put("/supplier/orders/update-status", {
      orderId,
      status,
    });
    if (res.status === 200) {
      setSupplierOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status } : order
        )
      );
    }
    setActiveTab(status);
  };

  const renderOrderCard = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => handleOrderPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>Order #{item._id}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + "20" },
          ]}
        >
          {getStatusIcon(item.status)}
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {item.status === "new"
              ? "New Order"
              : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <Text style={styles.businessName}>{item.businessName}</Text>
        <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
      </View>

      <View style={styles.orderItems}>
        {item.items.map((orderItem, index) => (
          <Text key={index} style={styles.orderItemText} numberOfLines={1}>
            {orderItem.quantity}x {orderItem.productId.name}
          </Text>
        ))}
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalAmount}>${item.totalAmount.toFixed(2)}</Text>
      </View>

      <View style={styles.actionButtons}>
        {item.status === "new" && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleStatusPress("confirmed", item._id)}
            >
              <Text style={styles.actionButtonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleStatusPress("cancelled", item._id)}
            >
              <Text style={[styles.actionButtonText, styles.rejectButtonText]}>
                Reject
              </Text>
            </TouchableOpacity>
          </>
        )}

        {item.status === "shipped" && (
          <TouchableOpacity
            style={[styles.actionButton, styles.shipButton]}
            onPress={() => handleStatusPress("delivered", item._id)}
          >
            <Text style={styles.actionButtonText}>Mark as Delivered</Text>
          </TouchableOpacity>
        )}
        

        {item.status === "processing" && (
          <TouchableOpacity
            style={[styles.actionButton, styles.shipButton]}
            onPress={() => handleStatusPress("shipped", item._id)}
          >
            <Text style={styles.actionButtonText}>Mark as Shipped</Text>
          </TouchableOpacity>
        )}

        {item.status === "pending" && (
          <TouchableOpacity
            style={[styles.actionButton, styles.processButton]}
            onPress={() => handleStatusPress("processing", item._id)}
          >
            <Text style={styles.actionButtonText}>Process Order</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  // Count orders by status
  const newOrdersCount = supplierOrders.filter(
    (order) => order.status === "new"
  ).length;
  const pendingOrdersCount = supplierOrders.filter(
    (order) => order.status === "pending"
  ).length;
  const processingOrdersCount = supplierOrders.filter(
    (order) => order.status === "processing"
  ).length;
  const shippedOrdersCount = supplierOrders.filter(
    (order) => order.status === "shipped"
  ).length;

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name}</Text>
          <Text style={styles.businessName}>
            {user?.businessName || "Your Business"}
          </Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statsScroll}
        >
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => setActiveTab("new")}
          >
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: Colors.primary.burgundy + "20" },
              ]}
            >
              <AlertTriangle size={24} color={Colors.primary.burgundy} />
            </View>
            <Text style={styles.statValue}>{newOrdersCount}</Text>
            <Text style={styles.statLabel}>New Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => setActiveTab("pending")}
          >
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: Colors.neutral.gray + "20" },
              ]}
            >
              <Clock size={24} color={Colors.neutral.gray} />
            </View>
            <Text style={styles.statValue}>{pendingOrdersCount}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => setActiveTab("processing")}
          >
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: Colors.status.warning + "20" },
              ]}
            >
              <Package size={24} color={Colors.status.warning} />
            </View>
            <Text style={styles.statValue}>{processingOrdersCount}</Text>
            <Text style={styles.statLabel}>Processing</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => setActiveTab("shipped")}
          >
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: Colors.status.info + "20" },
              ]}
            >
              <Truck size={24} color={Colors.status.info} />
            </View>
            <Text style={styles.statValue}>{shippedOrdersCount}</Text>
            <Text style={styles.statLabel}>Shipped</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "all" && styles.activeTab]}
            onPress={() => setActiveTab("all")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "all" && styles.activeTabText,
              ]}
            >
              All Orders
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "new" && styles.activeTab]}
            onPress={() => setActiveTab("new")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "new" && styles.activeTabText,
              ]}
            >
              New
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "pending" && styles.activeTab]}
            onPress={() => setActiveTab("pending")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "pending" && styles.activeTabText,
              ]}
            >
              Pending
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "processing" && styles.activeTab]}
            onPress={() => setActiveTab("processing")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "processing" && styles.activeTabText,
              ]}
            >
              Processing
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "shipped" && styles.activeTab]}
            onPress={() => setActiveTab("shipped")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "shipped" && styles.activeTabText,
              ]}
            >
              Shipped
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "delivered" && styles.activeTab]}
            onPress={() => setActiveTab("delivered")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "delivered" && styles.activeTabText,
              ]}
            >
              Delivered
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading orders...</Text>
        </View>
      ) : error ? (
        <View style={styles.emptyContainer}>
          <ShoppingCart size={48} color={Colors.neutral.lightGray} />
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderCard}
          keyExtractor={(item) => item._id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <ShoppingCart size={48} color={Colors.neutral.lightGray} />
              <Text style={styles.emptyText}>No orders found</Text>
              <Text style={styles.emptySubtext}>
                There are no orders in this category
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.extraLightGray,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  greeting: {
    fontSize: 16,
    color: Colors.neutral.gray,
  },
  businessName: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.neutral.black,
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statsScroll: {
    flexDirection: "row",
  },
  statCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 120,
    alignItems: "center",
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.neutral.black,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.neutral.gray,
  },
  tabContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.neutral.white,
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: Colors.primary.burgundy,
  },
  tabText: {
    fontSize: 14,
    color: Colors.neutral.gray,
  },
  activeTabText: {
    color: Colors.neutral.white,
    fontWeight: "500",
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  orderCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.neutral.black,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  orderDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderDate: {
    fontSize: 14,
    color: Colors.neutral.gray,
  },
  orderItems: {
    marginBottom: 12,
  },
  orderItemText: {
    fontSize: 14,
    color: Colors.neutral.darkGray,
    marginBottom: 4,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.extraLightGray,
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 14,
    color: Colors.neutral.gray,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary.burgundy,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptButton: {
    backgroundColor: Colors.status.success,
    flex: 1,
    marginRight: 8,
  },
  rejectButton: {
    backgroundColor: Colors.neutral.white,
    borderWidth: 1,
    borderColor: Colors.status.error,
    flex: 1,
  },
  processButton: {
    backgroundColor: Colors.status.warning,
    flex: 1,
  },
  shipButton: {
    backgroundColor: Colors.status.info,
    flex: 1,
  },
  actionButtonText: {
    color: Colors.neutral.white,
    fontWeight: "500",
  },
  rejectButtonText: {
    color: Colors.status.error,
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
});
