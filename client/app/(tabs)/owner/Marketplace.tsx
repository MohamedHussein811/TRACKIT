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
import { router, useRouter } from "expo-router";
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
  const [orders, setOrders] = useState([]);
  const { user } = useAuthStore();
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Send the GET request to fetch all orders without the userName query parameter
        const res = await api.get("/order"); // No userName parameter needed

        if (res.status === 200) {
          console.log(res.data); // Log the response to check the data

          // Set the fetched orders in the state
          setOrders(res.data.orders); // Update state with the fetched orders
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        Alert.alert("Error", "An error occurred while fetching orders");
      }
    };

    fetchOrders(); // Call the function to fetch orders on component mount
  }, []); // Empty dependency array to only fetch orders on initial render

  return (
    <SafeAreaView style={styles.container}>


      <View style={styles.searchContainer}>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Filter color={Colors.neutral.gray} size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push("/barcode-scanner")}>
            <ScanBarcode color={Colors.neutral.gray} size={20} />
          </TouchableOpacity>
        </View>
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
