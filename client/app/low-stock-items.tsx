import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import Colors from "@/constants/colors";
import {
  ArrowLeft,
  AlertTriangle,
  Package,
  ShoppingCart,
  X,
} from "lucide-react-native";
import { products } from "@/mocks/products";
import { Product } from "@/types";
import api from "@/utils/apiClient";
import AppBar from "@/components/AppBar";

export default function LowStockItemsScreen() {
  const router = useRouter();

  const [lowStockProducts, setLowStockProducts] = React.useState<Product[]>([]);

  useEffect(() => {
    // Fetch low stock products from the API
    const fetchLowStockProducts = async () => {
      try {
        const response = await api.get("/products");
        const filteredProducts = response.data.filter(
          (product: Product) => product.quantity <= product.minStockLevel
        );
        setLowStockProducts(filteredProducts);
      } catch (error) {
        console.error("Error fetching low stock products:", error);
      }
    };

    fetchLowStockProducts();
  }, []);

  const handleProductPress = (product: Product) => {
    router.push({
      pathname: "/product-details",
      params: { id: product._id },
    });
  };

  const handleOrderNow = (product: Product) => {
    Alert.alert(
      "Order Inventory",
      `Would you like to place an order for ${product.name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Order",
          onPress: () => {
            router.push({
              pathname: "/new-order",
              params: { productId: product._id },
            });
          },
        },
      ]
    );
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <View style={styles.productInfo}>
        <View style={styles.productNameContainer}>
          <Text style={styles.productName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.stockBadge}>
            <Text style={styles.stockBadgeText}>Low Stock</Text>
          </View>
        </View>

        <Text style={styles.productSku}>SKU: {item.sku}</Text>

        <View style={styles.stockInfo}>
          <View style={styles.stockLevel}>
            <Text style={styles.stockLabel}>Current Stock:</Text>
            <Text style={styles.stockValue}>{item.quantity}</Text>
          </View>

          <View style={styles.stockLevel}>
            <Text style={styles.stockLabel}>Min Level:</Text>
            <Text style={styles.stockValue}>{item.minStockLevel}</Text>
          </View>
        </View>

        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${(item.quantity / item.minStockLevel) * 100}%`,
                backgroundColor: getStockLevelColor(
                  item.quantity,
                  item.minStockLevel
                ),
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.productActions}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => handleProductPress(item)}
        >
          <Package
            size={16}
            color={Colors.primary.burgundy}
            style={styles.buttonIcon}
          />
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.orderButton}
          onPress={() => handleOrderNow(item)}
        >
          <ShoppingCart
            size={16}
            color={Colors.neutral.white}
            style={styles.buttonIcon}
          />
          <Text style={styles.orderButtonText}>Order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getStockLevelColor = (current: number, min: number) => {
    const ratio = current / min;
    if (ratio < 0.3) return Colors.status.error;
    if (ratio < 0.7) return Colors.status.warning;
    return Colors.status.success;
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "Low Stock Items",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={Colors.neutral.black} />
            </TouchableOpacity>
          ),
        }}
      />
      <AppBar title="Low Stock Items" isCanGoBack={true} />


      <View style={styles.header}>
        <View style={styles.warningBanner}>
          <AlertTriangle size={20} color={Colors.status.warning} />
          <Text style={styles.warningText}>
            {lowStockProducts.length} products below minimum stock level
          </Text>
        </View>
      </View>

      <FlatList
        data={lowStockProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <AlertTriangle size={48} color={Colors.neutral.lightGray} />
            <Text style={styles.emptyText}>No Low Stock Items</Text>
            <Text style={styles.emptySubtext}>
              All your products are above minimum stock levels
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
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.status.warning + "20",
    padding: 12,
    borderRadius: 8,
  },
  warningText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.neutral.darkGray,
    fontWeight: "500",
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  productCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  productInfo: {
    marginBottom: 16,
  },
  productNameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.neutral.black,
    flex: 1,
  },
  stockBadge: {
    backgroundColor: Colors.status.warning + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  stockBadgeText: {
    fontSize: 12,
    color: Colors.status.warning,
    fontWeight: "500",
  },
  productSku: {
    fontSize: 14,
    color: Colors.neutral.gray,
    marginBottom: 12,
  },
  stockInfo: {
    flexDirection: "row",
    marginBottom: 8,
  },
  stockLevel: {
    flexDirection: "row",
    marginRight: 16,
  },
  stockLabel: {
    fontSize: 14,
    color: Colors.neutral.darkGray,
    marginRight: 4,
  },
  stockValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.neutral.black,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.neutral.extraLightGray,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
  },
  productActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.neutral.extraLightGray,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.primary.burgundy,
  },
  orderButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary.burgundy,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  orderButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.neutral.white,
  },
  buttonIcon: {
    marginRight: 6,
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
  bulkOrderButton: {
    backgroundColor: Colors.primary.burgundy,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  bulkOrderButtonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
