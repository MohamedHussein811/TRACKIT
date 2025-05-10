import React, { useEffect } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";
import { events } from "@/mocks/events";
import { useAuthStore } from "@/store/auth-store";
import StatusCard from "@/components/StatusCard";
import ChartCard from "@/components/ChartCard";
import {
  Package,
  AlertTriangle,
  ShoppingCart,
  Calendar,
  TrendingUp,
  MapPin,
} from "lucide-react-native";
import { Image } from "expo-image";
import api from "@/utils/apiClient";

interface Product {
  name: string;
  quantity: number;
}

export default function DashboardScreen() {
  const { user, hasPermission } = useAuthStore();
  const router = useRouter();

  const [dashboardStats, setDashboardStats] = React.useState({
    totalProducts: 0,
    lowStockItems: 0,
    pendingOrders: 0,

    upcomingEvents: 0,
    recentSales: {
      amount: 0,
      change: 0,
    },
    topProducts: [] as Product[],
  });

  useEffect(() => {
    // Fetch dashboard stats from the API
    const fetchDashboardStats = async () => {
      try {
        const response = await api.get("/moderator/dashboard");
        console.log("Dashboard Stats:", response.data);
        setDashboardStats(response.data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    fetchDashboardStats();
  }, []);

  // Get upcoming events (events with dates in the future)
  const upcomingEvents = events
    .filter((event) => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 2); // Only show the next 2 events

  // Simple bar chart component
  const BarChart = () => {
    // Make sure topProducts exists before using it
    const topProducts = dashboardStats.topProducts || [];
    if (topProducts.length === 0) return null;

    return (
      <View style={styles.barChartContainer}>
        {topProducts.map((product, index) => (
          <View key={index} style={styles.barChartItem}>
            <Text style={styles.barChartLabel} numberOfLines={1}>
              {product.name}
            </Text>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  {
                    width: `${
                      (product.quantity /
                        Math.max(...topProducts.map((p) => p.quantity))) *
                      100
                    }%`,
                    backgroundColor:
                      index === 0
                        ? Colors.primary.burgundy
                        : index === 1
                        ? Colors.primary.burgundyLight
                        : Colors.neutral.lightGray,
                  },
                ]}
              />
              <Text style={styles.barValue}>{product.quantity}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "addProduct":
        if (hasPermission("add_product")) {
          router.push("/add-product");
        } else {
          Alert.alert(
            "Permission Denied",
            "You do not have permission to add products"
          );
        }
        break;
      case "newOrder":
        if (hasPermission("place_order")) {
          router.push("/new-order");
        } else {
          Alert.alert(
            "Permission Denied",
            "You do not have permission to place orders"
          );
        }
        break;
      case "salesReport":
        router.push("/sales-report");
        break;
      default:
        break;
    }
  };

  // Navigation handlers for dashboard cards
  const handleTotalProducts = () => {
    router.push("/total-products");
  };

  const handleLowStockItems = () => {
    router.push("/low-stock-items");
  };

  const handlePendingOrders = () => {
    router.push("/pending-orders");
  };

  const handleUpcomingEvents = () => {
    router.push("/(tabs)/events");
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };
  if (user?.userType === "organizer") {
    return;
  }
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name}</Text>
            <Text style={styles.businessName}>
              {user?.businessName || "Your Business"}
            </Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <StatusCard
            title="Total Products"
            value={dashboardStats.totalProducts.toString()}
            icon={<Package size={24} color={Colors.primary.burgundy} />}
            color={Colors.primary.burgundy}
            onPress={handleTotalProducts}
          />
          <StatusCard
            title="Low Stock Items"
            value={dashboardStats.lowStockItems.toString()}
            icon={<AlertTriangle size={24} color={Colors.status.warning} />}
            color={Colors.status.warning}
            onPress={handleLowStockItems}
          />
          <StatusCard
            title="Pending Orders"
            value={dashboardStats.pendingOrders.toString()}
            icon={<ShoppingCart size={24} color={Colors.status.info} />}
            color={Colors.status.info}
            onPress={handlePendingOrders}
          />
          <StatusCard
            title="Upcoming Events"
            value={dashboardStats.upcomingEvents.toString()}
            icon={<Calendar size={24} color={Colors.status.success} />}
            color={Colors.status.success}
            onPress={handleUpcomingEvents}
          />
        </View>

        {dashboardStats.recentSales && (
          <View style={styles.salesContainer}>
            <View style={styles.salesHeader}>
              <Text style={styles.salesTitle}>Recent Sales</Text>
              <View style={styles.salesChange}>
                <TrendingUp
                  size={16}
                  color={
                    dashboardStats.recentSales.change > 0
                      ? Colors.status.success
                      : Colors.status.error
                  }
                />
                <Text
                  style={[
                    styles.salesChangeText,
                    {
                      color:
                        dashboardStats.recentSales.change > 0
                          ? Colors.status.success
                          : Colors.status.error,
                    },
                  ]}
                >
                  {dashboardStats.recentSales.change > 0 ? "+" : ""}
                  {dashboardStats.recentSales.change}%
                </Text>
              </View>
            </View>
            <Text style={styles.salesAmount}>
              ${dashboardStats.recentSales.amount.toLocaleString()}
            </Text>

            {/* Added View Sales Report button */}
            <TouchableOpacity
              style={styles.viewReportButton}
              onPress={() => router.push("/sales-report")}
            >
              <Text style={styles.viewReportText}>View Sales Report</Text>
            </TouchableOpacity>
          </View>
        )}

        {dashboardStats.topProducts &&
          dashboardStats.topProducts.length > 0 && (
            <ChartCard title="Top Selling Products">
              <BarChart />
            </ChartCard>
          )}

        {/* Low Stock Items Section */}
        <View style={styles.lowStockContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Low Stock Items</Text>
            <TouchableOpacity onPress={() => router.push("/low-stock-items")}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.lowStockAlert}>
            <AlertTriangle
              size={20}
              color={Colors.status.warning}
              style={styles.lowStockIcon}
            />
            <Text style={styles.lowStockText}>
              {dashboardStats.lowStockItems} items are below minimum stock level
            </Text>
          </View>

          <TouchableOpacity
            style={styles.lowStockButton}
            onPress={() => router.push("/low-stock-items")}
          >
            <Text style={styles.lowStockButtonText}>View Low Stock Items</Text>
          </TouchableOpacity>
        </View>

        {upcomingEvents.length > 0 && (
          <View style={styles.upcomingEventsContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Events</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/events")}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {upcomingEvents.map((event, index) => (
              <TouchableOpacity
                key={event._id}
                style={styles.eventCard}
                onPress={() => {
                  router.push({
                    pathname: "/event-details",
                    params: { id: event._id },
                  });
                }}
              >
                <Image
                  source={{ uri: event.image }}
                  style={styles.eventImage}
                  contentFit="cover"
                />
                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle} numberOfLines={1}>
                    {event.title}
                  </Text>
                  <View style={styles.eventDetails}>
                    <View style={styles.eventDetail}>
                      <Calendar
                        size={14}
                        color={Colors.neutral.gray}
                        style={styles.eventDetailIcon}
                      />
                      <Text style={styles.eventDetailText}>
                        {formatDate(event.date)}
                      </Text>
                    </View>
                    <View style={styles.eventDetail}>
                      <MapPin
                        size={14}
                        color={Colors.neutral.gray}
                        style={styles.eventDetailIcon}
                      />
                      <Text style={styles.eventDetailText} numberOfLines={1}>
                        {event.location}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.quickActionsContainer}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => handleQuickAction("addProduct")}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: Colors.status.info },
                ]}
              >
                <Package size={24} color={Colors.neutral.white} />
              </View>
              <Text style={styles.quickActionText}>Add Product</Text>
            </TouchableOpacity>

                        <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => handleQuickAction("newOrder")}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: Colors.status.info },
                ]}
              >
                <ShoppingCart size={24} color={Colors.neutral.white} />
              </View>
              <Text style={styles.quickActionText}>New Order</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => handleQuickAction("salesReport")}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: Colors.status.success },
                ]}
              >
                <TrendingUp size={24} color={Colors.neutral.white} />
              </View>
              <Text style={styles.quickActionText}>Sales Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.extraLightGray,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
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
    marginBottom: 24,
  },
  salesContainer: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  salesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  salesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.neutral.black,
  },
  salesChange: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.neutral.extraLightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  salesChangeText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  salesAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.neutral.black,
    marginBottom: 12,
  },
  viewReportButton: {
    backgroundColor: Colors.primary.burgundy,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  viewReportText: {
    color: Colors.neutral.white,
    fontSize: 14,
    fontWeight: "500",
  },
  barChartContainer: {
    width: "100%",
    paddingHorizontal: 8,
  },
  barChartItem: {
    marginBottom: 16,
  },
  barChartLabel: {
    fontSize: 14,
    color: Colors.neutral.gray,
    marginBottom: 4,
  },
  barContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 24,
  },
  bar: {
    height: "100%",
    borderRadius: 4,
  },
  barValue: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    color: Colors.neutral.darkGray,
  },
  lowStockContainer: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  lowStockAlert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.status.warning + "10",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  lowStockIcon: {
    marginRight: 8,
  },
  lowStockText: {
    fontSize: 14,
    color: Colors.neutral.darkGray,
    flex: 1,
  },
  lowStockButton: {
    backgroundColor: Colors.status.warning + "20",
    borderWidth: 1,
    borderColor: Colors.status.warning,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  lowStockButtonText: {
    color: Colors.status.warning,
    fontSize: 14,
    fontWeight: "500",
  },
  upcomingEventsContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.neutral.black,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary.burgundy,
    fontWeight: "500",
  },
  eventCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    flexDirection: "row",
    height: 80,
  },
  eventImage: {
    width: 80,
    height: 80,
  },
  eventContent: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.neutral.black,
    marginBottom: 4,
  },
  eventDetails: {
    flexDirection: "column",
  },
  eventDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  eventDetailIcon: {
    marginRight: 4,
  },
  eventDetailText: {
    fontSize: 12,
    color: Colors.neutral.gray,
  },
  quickActionsContainer: {
    marginBottom: 24,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.neutral.black,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickActionButton: {
    width: "31%", // For 3 items instead of 4
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.neutral.black,
  },
});
