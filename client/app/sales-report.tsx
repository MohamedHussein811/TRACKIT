import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import Colors from "@/constants/colors";
import {
  X,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Calendar,
  ShoppingCart,
} from "lucide-react-native";
import AppBar from "@/components/AppBar";

// Mock data for sales report
const salesData = {
  totalSales: 24680.5,
  salesGrowth: 12.5,
  averageOrderValue: 245.75,
  totalSoldQuantity: 432, // Added total sold quantity
  topSellingProducts: [
    {
      name: "Premium Coffee Beans",
      sales: 4250.0,
      quantity: 170,
      soldQuantity: 85,
    }, // Added soldQuantity
    {
      name: "Artisanal Chocolate Bars",
      sales: 3187.5,
      quantity: 255,
      soldQuantity: 127,
    },
    {
      name: "Organic Olive Oil",
      sales: 2812.5,
      quantity: 150,
      soldQuantity: 75,
    },
    {
      name: "Specialty Tea Collection",
      sales: 2309.3,
      quantity: 70,
      soldQuantity: 35,
    },
    {
      name: "Gourmet Spice Set",
      sales: 1820.0,
      quantity: 40,
      soldQuantity: 20,
    },
  ],
  monthlySales: [
    { month: "Jan", amount: 15420.3, soldQuantity: 310 }, // Added soldQuantity
    { month: "Feb", amount: 18750.25, soldQuantity: 375 },
    { month: "Mar", amount: 16890.75, soldQuantity: 338 },
    { month: "Apr", amount: 19250.5, soldQuantity: 385 },
    { month: "May", amount: 21340.8, soldQuantity: 427 },
    { month: "Jun", amount: 24680.5, soldQuantity: 432 },
  ],
};

export default function SalesReportScreen() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState("Last 30 Days");
  const [showTimeRangeDropdown, setShowTimeRangeDropdown] = useState(false);

  const timeRangeOptions = [
    "Last 7 Days",
    "Last 30 Days",
    "Last 90 Days",
    "This Year",
    "All Time",
  ];

  // Simple bar chart component for monthly sales
  const BarChart = () => {
    const maxSales = Math.max(
      ...salesData.monthlySales.map((item) => item.amount)
    );

    return (
      <View style={styles.barChartContainer}>
        {salesData.monthlySales.map((item, index) => (
          <View key={index} style={styles.barChartItem}>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  {
                    width: `${(item.amount / maxSales) * 100}%`,
                    backgroundColor:
                      index === salesData.monthlySales.length - 1
                        ? Colors.primary.burgundy
                        : Colors.primary.burgundyLight,
                  },
                ]}
              />
              <Text style={styles.barValue}>
                $
                {item.amount.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </Text>
            </View>
            <View style={styles.barLabelContainer}>
              <Text style={styles.barLabel}>{item.month}</Text>
              <Text style={styles.barSoldQuantity}>
                {item.soldQuantity} units
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "Sales Report",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Colors.neutral.extraLightGray },
          headerTitleStyle: { color: Colors.neutral.black, fontWeight: "600" },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <X size={24} color={Colors.neutral.black} />
            </TouchableOpacity>
          ),
        }}
      />
      <AppBar title="Sales Report"  isCanGoBack/>

      <View style={styles.timeRangeSelector}>
        <Text style={styles.timeRangeLabel}>Time Range:</Text>
        <TouchableOpacity
          style={styles.timeRangeButton}
          onPress={() => setShowTimeRangeDropdown(!showTimeRangeDropdown)}
        >
          <Text style={styles.timeRangeText}>{timeRange}</Text>
          <ChevronDown size={20} color={Colors.neutral.gray} />
        </TouchableOpacity>

        {showTimeRangeDropdown && (
          <View style={styles.timeRangeDropdown}>
            {timeRangeOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.timeRangeOption}
                onPress={() => {
                  setTimeRange(option);
                  setShowTimeRangeDropdown(false);
                }}
              >
                <Text
                  style={[
                    styles.timeRangeOptionText,
                    option === timeRange && styles.selectedTimeRangeOptionText,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <DollarSign size={24} color={Colors.primary.burgundy} />
            </View>
            <Text style={styles.statValue}>
              ${salesData.totalSales.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Total Sales</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              {salesData.salesGrowth >= 0 ? (
                <TrendingUp size={24} color={Colors.status.success} />
              ) : (
                <TrendingDown size={24} color={Colors.status.error} />
              )}
            </View>
            <Text
              style={[
                styles.statValue,
                {
                  color:
                    salesData.salesGrowth >= 0
                      ? Colors.status.success
                      : Colors.status.error,
                },
              ]}
            >
              {salesData.salesGrowth >= 0 ? "+" : ""}
              {salesData.salesGrowth}%
            </Text>
            <Text style={styles.statLabel}>Growth</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Package size={24} color={Colors.status.info} />
            </View>
            <Text style={styles.statValue}>${salesData.averageOrderValue}</Text>
            <Text style={styles.statLabel}>Avg. Order</Text>
          </View>

          {/* Added new stat card for total sold quantity */}
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <ShoppingCart size={24} color={Colors.status.warning} />
            </View>
            <Text style={styles.statValue}>{salesData.totalSoldQuantity}</Text>
            <Text style={styles.statLabel}>Units Sold</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Sales</Text>
          <BarChart />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Selling Products</Text>

          {salesData.topSellingProducts.map((product, index) => (
            <View key={index} style={styles.productItem}>
              <View style={styles.productRank}>
                <Text style={styles.productRankText}>{index + 1}</Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <View style={styles.productStats}>
                  <Text style={styles.productStat}>
                    {product.soldQuantity} sold
                  </Text>
                  <Text style={styles.productStat}>
                    {product.quantity} in stock
                  </Text>
                  <Text style={styles.productStat}>
                    ${product.sales.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sales Breakdown</Text>

          <View style={styles.pieChartContainer}>
            <View style={styles.pieChart}>
              <View style={[styles.pieSlice, styles.pieSlice1]} />
              <View style={[styles.pieSlice, styles.pieSlice2]} />
              <View style={[styles.pieSlice, styles.pieSlice3]} />
              <View style={styles.pieCenter} />
            </View>

            <View style={styles.pieChartLegend}>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendColor,
                    { backgroundColor: Colors.primary.burgundy },
                  ]}
                />
                <Text style={styles.legendText}>Beverages (45%)</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendColor,
                    { backgroundColor: Colors.primary.burgundyLight },
                  ]}
                />
                <Text style={styles.legendText}>Confectionery (30%)</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendColor,
                    { backgroundColor: Colors.neutral.lightGray },
                  ]}
                />
                <Text style={styles.legendText}>Other (25%)</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.exportButton}>
          <Text style={styles.exportButtonText}
            onPress={() => {
              alert("Report exported successfully!");
            }}
          >Export Report</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.extraLightGray,
  },
  timeRangeSelector: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.extraLightGray,
    position: "relative",
    zIndex: 10,
  },
  timeRangeLabel: {
    fontSize: 16,
    color: Colors.neutral.gray,
    marginRight: 8,
  },
  timeRangeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.neutral.extraLightGray,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  timeRangeText: {
    fontSize: 16,
    color: Colors.neutral.black,
    marginRight: 8,
  },
  timeRangeDropdown: {
    position: "absolute",
    top: 60,
    right: 16,
    backgroundColor: Colors.neutral.white,
    borderRadius: 8,
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 20,
    width: 150,
  },
  timeRangeOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.extraLightGray,
  },
  timeRangeOptionText: {
    fontSize: 16,
    color: Colors.neutral.black,
  },
  selectedTimeRangeOptionText: {
    color: Colors.primary.burgundy,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
    padding: 16,
    zIndex: 1,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 16,
    width: "48%",
    marginBottom: 16,
    alignItems: "center",
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.neutral.extraLightGray,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.neutral.black,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.neutral.gray,
  },
  section: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.neutral.black,
    marginBottom: 16,
  },
  barChartContainer: {
    width: "100%",
  },
  barChartItem: {
    marginBottom: 16,
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
  barLabelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  barLabel: {
    fontSize: 14,
    color: Colors.neutral.gray,
  },
  barSoldQuantity: {
    fontSize: 14,
    color: Colors.neutral.gray,
    fontWeight: "500",
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  productRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary.burgundyLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  productRankText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.neutral.white,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    color: Colors.neutral.black,
    marginBottom: 4,
  },
  productStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  productStat: {
    fontSize: 14,
    color: Colors.neutral.gray,
  },
  pieChartContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pieChart: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.neutral.extraLightGray,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  pieSlice: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  pieSlice1: {
    backgroundColor: Colors.primary.burgundy,
    transform: [{ rotate: "0deg" }],
    zIndex: 3,
    width: "100%",
    height: "100%",
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 60,
    borderBottomLeftRadius: 60,
    left: 60,
  },
  pieSlice2: {
    backgroundColor: Colors.primary.burgundyLight,
    transform: [{ rotate: "162deg" }],
    zIndex: 2,
    width: "100%",
    height: "100%",
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 60,
    borderBottomLeftRadius: 60,
    left: 60,
  },
  pieSlice3: {
    backgroundColor: Colors.neutral.lightGray,
    transform: [{ rotate: "270deg" }],
    zIndex: 1,
    width: "100%",
    height: "100%",
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 60,
    borderBottomLeftRadius: 60,
    left: 60,
  },
  pieCenter: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral.white,
    zIndex: 4,
  },
  pieChartLegend: {
    flex: 1,
    marginLeft: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: Colors.neutral.darkGray,
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.extraLightGray,
  },
  exportButton: {
    backgroundColor: Colors.primary.burgundy,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  exportButtonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
