import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";
import {
  Search,
  Plus,
  Package,
  Filter,
  ScanBarcode,
  ArrowUpDown,
} from "lucide-react-native";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";
import { useAuthStore } from "@/store/auth-store";
import api from "@/utils/apiClient";

export default function InventoryScreen() {
  const router = useRouter();
  const { hasPermission } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([] as Product[]); // Assuming products are fetched from a store or API
  const [filteredProducts, setFilteredProducts] = useState([] as Product[]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await api.get("/products"); // Replace with your API endpoint
      if (res.status === 200) {
        setProducts(res.data);
        setFilteredProducts(res.data);
      } else {
        Alert.alert("Error", "Failed to fetch products");
      }
    };
    fetchProducts();
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(text.toLowerCase()) ||
          product.sku.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  const handleSort = () => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newSortOrder);

    const sorted = [...filteredProducts].sort((a, b) => {
      if (newSortOrder === "asc") {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });

    setFilteredProducts(sorted);
  };

  const handleFilter = () => {
    // Implement filter functionality
    Alert.alert("Filter", "Filter functionality to be implemented");
  };

  // Added barcode scanning functionality
  const handleScanBarcode = () => {
    if (!hasPermission("scan_barcode")) {
      Alert.alert(
        "Permission Denied",
        "You do not have permission to scan barcodes"
      );
      return;
    }

    if (Platform.OS === "web") {
      Alert.alert(
        "Barcode Scanner",
        "Barcode scanning is not available on web"
      );
      return;
    }

    router.push("/barcode-scanner"); // Make sure you have this screen implemented
  };

  const handleAddProduct = () => {
    if (!hasPermission("add_product")) {
      Alert.alert(
        "Permission Denied",
        "You do not have permission to add products"
      );
      return;
    }
    router.push("/add-product");
  };

  const handleProductPress = (product: Product) => {
    // Fixed syntax error here
    router.push(`/product-details?id=${product._id}`);
  };

  // Navigation handlers for inventory categories
  const handleViewTotalProducts = () => {
    router.push("/total-products");
  };

  const handleViewLowStock = () => {
    router.push("/low-stock-items");
  };

  const handleViewOutOfStock = () => {
    router.push("/out-of-stock");
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Inventory</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
          <Plus size={24} color={Colors.neutral.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
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

        <View style={styles.actionButtons}>
          {/* Added barcode scanner button */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleScanBarcode}
          >
            <ScanBarcode size={20} color={Colors.neutral.gray} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleSort}>
            <ArrowUpDown size={20} color={Colors.neutral.gray} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleFilter}>
            <Filter size={20} color={Colors.neutral.gray} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <TouchableOpacity
          style={styles.statCard}
          onPress={handleViewTotalProducts}
        >
          <View
            style={[
              styles.statIconContainer,
              { backgroundColor: Colors.primary.burgundy + "20" },
            ]}
          >
            <Package size={24} color={Colors.primary.burgundy} />
          </View>
          <Text style={styles.statValue}>{products.length}</Text>
          <Text style={styles.statLabel}>Total Products</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statCard} onPress={handleViewLowStock}>
          <View
            style={[
              styles.statIconContainer,
              { backgroundColor: Colors.status.warning + "20" },
            ]}
          >
            <Package size={24} color={Colors.status.warning} />
          </View>
          <Text style={styles.statValue}>
            {
              products.filter(
                (p) => p.quantity < p.minStockLevel && p.quantity > 0
              ).length
            }
          </Text>
          <Text style={styles.statLabel}>Low Stock</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statCard}
          onPress={handleViewOutOfStock}
        >
          <View
            style={[
              styles.statIconContainer,
              { backgroundColor: Colors.status.error + "20" },
            ]}
          >
            <Package size={24} color={Colors.status.error} />
          </View>
          <Text style={styles.statValue}>
            {products.filter((p) => p.quantity === 0).length}
          </Text>
          <Text style={styles.statLabel}>Out of Stock</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredProducts}
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={handleProductPress} />
        )}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.productList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Package size={48} color={Colors.neutral.lightGray} />
            <Text style={styles.emptyText}>No products found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your search or add a new product
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.neutral.black,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary.burgundy,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: Colors.neutral.black,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral.white,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 12,
    marginRight: 8,
    alignItems: "center",
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.neutral.black,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.neutral.gray,
    textAlign: "center",
  },
  productList: {
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
});
