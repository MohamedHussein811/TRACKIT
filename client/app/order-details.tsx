import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Colors from "@/constants/colors";
import api from "@/utils/apiClient";
import { Ionicons } from "@expo/vector-icons"; // Make sure this is installed
import AppBar from "@/components/AppBar";

export default function OrderDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get(`/order`);
        const fetchedOrders = res.data.orders;
        const selectedOrder = fetchedOrders.find((order: any) => order._id === id);
        setOrder(selectedOrder || null);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [id]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.burgundy} />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFoundContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={Colors.neutral.gray} />
          <Text style={styles.notFoundText}>Order not found</Text>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppBar title="Order Details" isCanGoBack/>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.orderInfoHeader}>
            <View>
              <Text style={styles.orderId}>#{order._id.slice(-8)}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: Colors.primary.burgundy }]}>
              <Text style={styles.statusText}>{order.status}</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.customerInfo}>
            <Ionicons name="person-circle-outline" size={24} color={Colors.primary.burgundy} />
            <Text style={styles.customerName}>{order.userName}</Text>
          </View>
          
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Total Amount</Text>
            <Text style={styles.amount}>${order.totalAmount.toFixed(2)}</Text>
          </View>
        </View>
        
        <Text style={styles.sectionTitle}>Order Items</Text>
        
        {order.items.map((item: any, index: number) => (
          <View key={index} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemName}>{item.productId.name}</Text>
              <Text style={styles.itemQuantity}>x{item.quantity}</Text>
            </View>
            
            <View style={styles.itemPricing}>
              <Text style={styles.unitPrice}>${item.unitPrice.toFixed(2)} per unit</Text>
              <Text style={styles.subtotal}>${(item.unitPrice * item.quantity).toFixed(2)}</Text>
            </View>
          </View>
        ))}
        
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${order.totalAmount.toFixed(2)}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, styles.totalLabel]}>Total</Text>
            <Text style={styles.totalValue}>${order.totalAmount.toFixed(2)}</Text>
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
  header: {
    backgroundColor: Colors.primary.burgundy,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  headerTitle: {
    color: Colors.neutral.white,
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 16,
  },
  backBtn: {
    padding: 4,
  },
  scrollView: {
    padding: 16,
  },
  card: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  orderInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral.black,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    color: Colors.neutral.white,
    fontWeight: '600',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral.lightGray,
    marginVertical: 16,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: Colors.neutral.black,
  },
  amountContainer: {
    backgroundColor: Colors.neutral.extraLightGray,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 15,
    color: Colors.neutral.darkGray,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary.burgundy,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral.black,
    marginBottom: 12,
    marginTop: 8,
  },
  itemCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral.black,
    flex: 1,
  },
  itemQuantity: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary.burgundy,
    backgroundColor: 'rgba(128, 0, 32, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  itemPricing: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unitPrice: {
    fontSize: 14,
    color: Colors.neutral.gray,
  },
  subtotal: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral.black,
  },
  summaryCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: Colors.neutral.darkGray,
  },
  summaryValue: {
    fontSize: 15,
    color: Colors.neutral.black,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary.burgundy,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.neutral.gray,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 18,
    color: Colors.neutral.gray,
    textAlign: 'center',
    marginTop: 16,
  },
  backButton: {
    marginTop: 20,
    backgroundColor: Colors.primary.burgundy,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: Colors.neutral.white,
    fontWeight: '600',
  },
});
