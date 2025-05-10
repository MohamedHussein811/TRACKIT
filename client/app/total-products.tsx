import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import Colors from "@/constants/colors";
import {
  ArrowLeft,
  Search,
  Filter,
  ArrowUpDown,
  Package,
  X,
} from "lucide-react-native";
import { Product } from "@/types";
import axios from "axios";
import api from "@/utils/apiClient";
import AppBar from "@/components/AppBar";

export default function TotalProductsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [originalProducts, setOriginalProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [sortField, setSortField] = useState<"name" | "quantity">("name");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products"); // Adjust endpoint based on your backend
        setOriginalProducts(res.data);
        setFilteredProducts(res.data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === "") {
      setFilteredProducts(originalProducts);
    } else {
      const filtered = originalProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(text.toLowerCase()) ||
          product.sku.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  const handleSort = (field: "name" | "quantity") => {
    const newSortOrder =
      field === sortField ? (sortOrder === "asc" ? "desc" : "asc") : "asc";
    setSortField(field);
    setSortOrder(newSortOrder);

    const sorted = [...filteredProducts].sort((a, b) => {
      if (field === "name") {
        return newSortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        return newSortOrder === "asc"
          ? a.quantity - b.quantity
          : b.quantity - a.quantity;
      }
    });

    setFilteredProducts(sorted);
  };

  const handleProductPress = (product: Product) => {
    router.push({
      pathname: "/product-details",
      params: { id: product._id },
    });
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(item)}
    >
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.productSku}>SKU: {item.sku}</Text>

        <View style={styles.productDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Price:</Text>
            <Text style={styles.detailValue}>${item.price.toFixed(2)}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Stock:</Text>
            <Text
              style={[
                styles.detailValue,
                item.quantity <= 0
                  ? styles.outOfStock
                  : item.quantity < item.minStockLevel
                  ? styles.lowStock
                  : styles.inStock,
              ]}
            >
              {item.quantity}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Category:</Text>
            <Text style={styles.detailValue}>{item.category}</Text>
          </View>
        </View>
      </View>

      <View
        style={[
          styles.stockIndicator,
          item.quantity <= 0
            ? styles.outOfStockIndicator
            : item.quantity < item.minStockLevel
            ? styles.lowStockIndicator
            : styles.inStockIndicator,
        ]}
      />
    </TouchableOpacity>
  );

  const totalCount = originalProducts.length;
  const lowStockCount = originalProducts.filter(
    (p) => p.quantity < p.minStockLevel && p.quantity > 0
  ).length;
  const outOfStockCount = originalProducts.filter(
    (p) => p.quantity <= 0
  ).length;

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "All Products",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={Colors.neutral.black} />
            </TouchableOpacity>
          ),
        }}
      />
      <AppBar title="All Products" isCanGoBack={true} />

      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search
            size={20}
            color={Colors.neutral.gray}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products by name or SKU"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => handleSort("name")}
          >
            <Text
              style={[
                styles.filterButtonText,
                sortField === "name" && styles.activeFilterText,
              ]}
            >
              Name
            </Text>
            {sortField === "name" && (
              <ArrowUpDown size={16} color={Colors.primary.burgundy} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => handleSort("quantity")}
          >
            <Text
              style={[
                styles.filterButtonText,
                sortField === "quantity" && styles.activeFilterText,
              ]}
            >
              Stock
            </Text>
            {sortField === "quantity" && (
              <ArrowUpDown size={16} color={Colors.primary.burgundy} />
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterButtonText}>Filter</Text>
            <Filter size={16} color={Colors.neutral.gray} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalCount}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{lowStockCount}</Text>
          <Text style={styles.statLabel}>Low Stock</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{outOfStockCount}</Text>
          <Text style={styles.statLabel}>Out of Stock</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={Colors.primary.burgundy}
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item._id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Package size={48} color={Colors.neutral.lightGray} />
              <Text style={styles.emptyText}>No products found</Text>
              <Text style={styles.emptySubtext}>
                Try adjusting your search criteria
              </Text>
            </View>
          )}
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/add-product")}
        >
          <Text style={styles.addButtonText}>Add New Product</Text>
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.neutral.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: Colors.neutral.black,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.neutral.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  filterButtonText: {
    fontSize: 14,
    color: Colors.neutral.gray,
    marginRight: 4,
  },
  activeFilterText: {
    color: Colors.primary.burgundy,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.neutral.black,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.neutral.gray,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  productCard: {
    flexDirection: "row",
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.neutral.black,
    marginBottom: 4,
  },
  productSku: {
    fontSize: 14,
    color: Colors.neutral.gray,
    marginBottom: 8,
  },
  productDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  detailItem: {
    flexDirection: "row",
    marginRight: 16,
    marginBottom: 4,
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
  inStock: {
    color: Colors.status.success,
  },
  lowStock: {
    color: Colors.status.warning,
  },
  outOfStock: {
    color: Colors.status.error,
  },
  stockIndicator: {
    width: 4,
    borderRadius: 2,
    marginLeft: 12,
  },
  inStockIndicator: {
    backgroundColor: Colors.status.success,
  },
  lowStockIndicator: {
    backgroundColor: Colors.status.warning,
  },
  outOfStockIndicator: {
    backgroundColor: Colors.status.error,
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
  addButton: {
    backgroundColor: Colors.primary.burgundy,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  addButtonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
