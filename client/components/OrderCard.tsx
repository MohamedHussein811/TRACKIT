import Colors from '@/constants/colors';
import { Order } from '@/types';
import { Package, ShoppingCart, Truck } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface OrderCardProps {
  order: Order;
  onPress: (order: Order) => void;
}

export default function OrderCard({ order, onPress }: OrderCardProps) {
  // Function to get the color for the status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return Colors.status.success;
      case 'shipped':
        return Colors.status.info;
      case 'processing':
        return Colors.status.warning;
      case 'pending':
        return Colors.neutral.gray;
      case 'cancelled':
        return Colors.status.error;
      default:
        return Colors.neutral.gray;
    }
  };

  // Function to get the icon for the status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Package size={16} color={Colors.status.success} />;
      case 'shipped':
        return <Truck size={16} color={Colors.status.info} />;
      case 'processing':
        return <ShoppingCart size={16} color={Colors.status.warning} />;
      case 'pending':
        return <ShoppingCart size={16} color={Colors.neutral.gray} />;
      case 'cancelled':
        return <ShoppingCart size={16} color={Colors.status.error} />;
      default:
        return <ShoppingCart size={16} color={Colors.neutral.gray} />;
    }
  };

  // Format the date to a more readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Get supplier display name safely
  const getSupplierName = (order: Order) => {
    // Check if ownerId exists and has either name or email property
    if (!order.ownerId) {
      return 'Unknown Owner';
    }
    return order.ownerName || 'Unnamed Owner';
  };

  // Display the order card
  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => onPress(order)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.orderNumber}>Order #{order._id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
          {getStatusIcon(order.status)}
          <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Text>
        </View>
      </View>
      
      <View style={styles.details}>
        <Text style={styles.supplierName}>{getSupplierName(order)}</Text>
        <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
      </View>
      
      <View style={styles.items}>
        {order.items.map((orderItem, index) => {
          // Safely access product name
          const productName = orderItem.productId && orderItem.productId.name 
            ? orderItem.productId.name 
            : 'Unknown Product';
            
          return (
            <Text key={index} style={styles.itemText} numberOfLines={1}>
              {orderItem.quantity}x {productName}
            </Text>
          );
        })}
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalAmount}>${order.totalAmount.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral.black,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  supplierName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral.darkGray,
  },
  orderDate: {
    fontSize: 14,
    color: Colors.neutral.gray,
  },
  items: {
    marginBottom: 12,
  },
  itemText: {
    fontSize: 14,
    color: Colors.neutral.darkGray,
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.extraLightGray,
  },
  totalLabel: {
    fontSize: 14,
    color: Colors.neutral.gray,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.burgundy,
  },
});