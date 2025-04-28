import React from "react";
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

export default function OutOfStockScreen() {
  const router = useRouter();

  // Filter products that are out of stock
  const outOfStockProducts = products.filter(
    (product) => product.quantity <= 0
  );

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
            <Text style={styles.stockBadgeText}>Out of Stock</Text>
          </View>
        </View>

        <Text style={styles.productSku}>SKU: {item.sku}</Text>

        <View style={styles.productDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Price:</Text>
            <Text style={styles.detailValue}>${item.price.toFixed(2)}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Category:</Text>
            <Text style={styles.detailValue}>{item.category}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Supplier:</Text>
            <Text style={styles.detailValue}>
              {item.supplier || "Not specified"}
            </Text>
          </View>
        </View>

        <View style={styles.urgentLabel}>
          <AlertTriangle
            size={16}
            color={Colors.status.error}
            style={styles.urgentIcon}
          />
          <Text style={styles.urgentText}>Urgent: Restock Required</Text>
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

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "Out of Stock Items",
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
        <View style={styles.warningBanner}>
          <AlertTriangle size={20} color={Colors.status.error} />
          <Text style={styles.warningText}>
            {outOfStockProducts.length} products are out of stock
          </Text>
        </View>
      </View>

      <FlatList
        data={outOfStockProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Package size={48} color={Colors.neutral.lightGray} />
            <Text style={styles.emptyText}>No Out of Stock Items</Text>
            <Text style={styles.emptySubtext}>
              All your products have inventory available
            </Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.bulkOrderButton}
          onPress={() => router.push("/new-order")}
        >
          <Text style={styles.bulkOrderButtonText}>Order Inventory</Text>
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
  header: {
    padding: 16,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.status.error + "20",
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
    borderLeftWidth: 4,
    borderLeftColor: Colors.status.error,
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
    backgroundColor: Colors.status.error + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  stockBadgeText: {
    fontSize: 12,
    color: Colors.status.error,
    fontWeight: "500",
  },
  productSku: {
    fontSize: 14,
    color: Colors.neutral.gray,
    marginBottom: 12,
  },
  productDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: "row",
    marginRight: 16,
    marginBottom: 4,
    minWidth: "40%",
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.neutral.darkGray,
    marginRight: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.neutral.black,
  },
  urgentLabel: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.status.error + "10",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  urgentIcon: {
    marginRight: 6,
  },
  urgentText: {
    fontSize: 12,
    color: Colors.status.error,
    fontWeight: "500",
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
