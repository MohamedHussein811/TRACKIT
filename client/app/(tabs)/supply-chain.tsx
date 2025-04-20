import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { Order, User } from '@/types';
import { Star, Phone, Mail, Package, Truck, ShoppingCart } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import api from '@/utils/apiClient';

export default function SupplyChainScreen() {
  const router = useRouter();
  const { hasPermission } = useAuthStore();
  const [activeTab, setActiveTab] = useState('suppliers');

  const [suppliers, setSuppliers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Fetch suppliers from the API
    const fetchSups = async () => {
      try {
        const response = await api.get<any[]>('/suppliers');
        const resOrders = await api.get<any[]>('/moderator/orders');
        setSuppliers(response.data);
        setOrders(resOrders.data.orders);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      }
    };

    fetchSups();
  }, []);
  
  const handleSupplierPress = (supplier: User) => {
    // Navigate to supplier details
    router.push({
      pathname: '/supplier-details',
      params: { id: supplier._id }
    });
  };

  const handleOrderPress = (order: Order) => {
    // HIGHLIGHT: Navigate to shipment tracking screen
    if (order.status !== 'pending') {
      router.push({
        pathname: '/shipment-tracking',
        params: { id: order._id }
      });
    } else {
      // For pending orders, we might show a different screen or message
      router.push({
        pathname: '/order-details',
        params: { id: order._id }
      });
    }
  };

  const handlePlaceOrder = (supplier: User) => {
    if (!hasPermission('place_order')) {
      Alert.alert('Permission Denied', 'You do not have permission to place orders');
      return;
    }
    
    // Navigate to place order screen
    router.push({
      pathname: '/new-order',
      params: { supplierId: supplier._id }
    });
  };

  const handleContactSupplier = (method: 'phone' | 'email', supplier: User) => {
    if (method === 'phone') {
      Alert.alert(
        'Contact Supplier',
        `Call ${supplier.name} at ${supplier.phone}?`,
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Call',
            onPress: () => console.log('Calling supplier:', supplier.phone)
          }
        ]
      );
    } else {
      Alert.alert(
        'Contact Supplier',
        `Email ${supplier.name} at ${supplier.email}?`,
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Email',
            onPress: () => console.log('Emailing supplier:', supplier.email)
          }
        ]
      );
    }
  };

  const renderSupplierCard = ({ item }: { item: User }) => (
    <TouchableOpacity 
      style={styles.supplierCard} 
      onPress={() => handleSupplierPress(item)}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: item.avatar || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0'
        }} 
        style={styles.supplierImage} 
        resizeMode="cover"
      />
      <View style={styles.supplierContent}>
        <Text style={styles.supplierName}>{item.name || item.email}</Text>
        
        <View style={styles.ratingContainer}>
          <Star size={16} color={Colors.status.warning} fill={Colors.status.warning} />
          <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
        </View>
        
        <View style={styles.categoriesContainer}>
          {item.categories?.slice(0, 2).map((category, index) => (
            <View key={index} style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{category}</Text>
            </View>
          ))}
          {item.categories?.length > 2 && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>+{item.categories.length - 2}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.contactContainer}>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => handleContactSupplier('phone', item)}
          >
            <Phone size={16} color={Colors.primary.burgundy} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => handleContactSupplier('email', item)}
          >
            <Mail size={16} color={Colors.primary.burgundy} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.contactButton, styles.orderButton]}
            onPress={() => handlePlaceOrder(item)}
          >
            <Text style={styles.orderButtonText}>Order</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderOrderCard = ({ item }: { item: Order }) => {
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

    const formatDate = (dateString: string) => {
      const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
      return new Date(dateString).toLocaleDateString('en-US', options);
    };

    return (
      <TouchableOpacity 
        style={styles.orderCard} 
        onPress={() => handleOrderPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.orderHeader}>
          <Text style={styles.orderNumber}>Order #{item._id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            {getStatusIcon(item.status)}
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>
        
        <View style={styles.orderDetails}>
          <Text style={styles.supplierName}>{item.supplierId.name || item.supplierId.email}</Text>
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
        
        {/* HIGHLIGHT: Added tracking info for shipped/delivered orders */}
        {(item.status === 'shipped' || item.status === 'delivered') && (
          <View style={styles.trackingInfo}>
            <View style={styles.trackingHeader}>
              <Truck size={16} color={Colors.primary.burgundy} />
              <Text style={styles.trackingTitle}>Shipment Tracking</Text>
            </View>
            {item.trackingNumber && (
              <Text style={styles.trackingNumber}>Tracking #: {item.trackingNumber}</Text>
            )}
            {item.expectedDelivery && (
              <Text style={styles.deliveryDate}>
                Expected delivery: {formatDate(item.expectedDelivery)}
              </Text>
            )}
            <TouchableOpacity 
              style={styles.trackButton}
              onPress={() => handleOrderPress(item)}
            >
              <Text style={styles.trackButtonText}>Track Shipment</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Supply Chain</Text>
        
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'suppliers' && styles.activeTab]} 
            onPress={() => setActiveTab('suppliers')}
          >
            <Text style={[styles.tabText, activeTab === 'suppliers' && styles.activeTabText]}>
              Suppliers
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'orders' && styles.activeTab]} 
            onPress={() => setActiveTab('orders')}
          >
            <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>
              Orders
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'suppliers' ? (
        <FlatList
          data={suppliers}
          renderItem={renderSupplierCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.neutral.black,
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: Colors.primary.burgundy,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral.gray,
  },
  activeTabText: {
    color: Colors.neutral.white,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  supplierCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  supplierImage: {
    width: '100%',
    height: 120,
  },
  supplierContent: {
    padding: 16,
  },
  supplierName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral.black,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral.darkGray,
    marginLeft: 4,
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  categoryBadge: {
    backgroundColor: Colors.neutral.extraLightGray,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 12,
    color: Colors.neutral.darkGray,
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.neutral.extraLightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  orderButton: {
    width: 'auto',
    paddingHorizontal: 16,
    backgroundColor: Colors.primary.burgundy,
    marginLeft: 'auto',
    marginRight: 0,
  },
  orderButtonText: {
    color: Colors.neutral.white,
    fontSize: 14,
    fontWeight: '500',
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
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  // HIGHLIGHT: Added styles for tracking information
  trackingInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: Colors.neutral.extraLightGray,
    borderRadius: 8,
  },
  trackingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  trackingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral.black,
    marginLeft: 8,
  },
  trackingNumber: {
    fontSize: 12,
    color: Colors.neutral.darkGray,
    marginBottom: 4,
  },
  deliveryDate: {
    fontSize: 12,
    color: Colors.neutral.darkGray,
    marginBottom: 8,
  },
  trackButton: {
    backgroundColor: Colors.primary.burgundy,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  trackButtonText: {
    color: Colors.neutral.white,
    fontSize: 12,
    fontWeight: '500',
  },
});