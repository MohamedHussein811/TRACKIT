import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { ArrowLeft, CheckCircle, Clock, Truck, Calendar, Package } from 'lucide-react-native';
import { suppliers } from '@/mocks/suppliers';

export default function OrderStatusScreen() {
  const router = useRouter();
  const { supplierId, orderId } = useLocalSearchParams();
  
  // Find supplier
  const supplier = suppliers.find(s => s.id === supplierId);
  
  // Mock order data
  const orderData = {
    id: orderId || 'ORD-' + Math.floor(Math.random() * 10000),
    status: 'pending',
    date: new Date().toISOString(),
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      { name: 'Coffee Beans - Dark Roast', quantity: 5, price: 12.99 },
      { name: 'Organic Tea Assortment', quantity: 2, price: 18.50 },
      { name: 'Specialty Sugar', quantity: 3, price: 8.75 }
    ],
    total: 114.20
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleViewOrderDetails = () => {
    // Navigate to order details
    router.push(`/order-details?id=${orderData.id}`);
  };

  const handleContactSupplier = () => {
    if (!supplier) return;
    
    // Navigate back to supplier details
    router.push(`/supplier-details?id=${supplierId}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Order Status',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.push('/(tabs)')}>
              <ArrowLeft size={24} color={Colors.neutral.black} />
            </TouchableOpacity>
          ),
        }} 
      />

      <View style={styles.content}>
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <CheckCircle size={64} color={Colors.status.success} />
            <Text style={styles.statusTitle}>Order Placed Successfully!</Text>
            <Text style={styles.statusMessage}>
              Your order has been received and is awaiting approval from the supplier.
            </Text>
          </View>
          
          <View style={styles.orderInfo}>
            <Text style={styles.orderInfoLabel}>Order Number:</Text>
            <Text style={styles.orderInfoValue}>{orderData.id}</Text>
          </View>
          
          <View style={styles.orderInfo}>
            <Text style={styles.orderInfoLabel}>Order Date:</Text>
            <Text style={styles.orderInfoValue}>{formatDate(orderData.date)}</Text>
          </View>
          
          <View style={styles.orderInfo}>
            <Text style={styles.orderInfoLabel}>Estimated Delivery:</Text>
            <Text style={styles.orderInfoValue}>{formatDate(orderData.estimatedDelivery)}</Text>
          </View>
          
          <View style={styles.orderInfo}>
            <Text style={styles.orderInfoLabel}>Total Amount:</Text>
            <Text style={styles.orderInfoValue}>${orderData.total.toFixed(2)}</Text>
          </View>
        </View>
        
        <View style={styles.statusTimeline}>
          <Text style={styles.timelineTitle}>Order Status</Text>
          
          <View style={styles.timelineItem}>
            <View style={[styles.timelineIcon, styles.completedIcon]}>
              <CheckCircle size={24} color={Colors.neutral.white} />
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineItemTitle}>Order Placed</Text>
              <Text style={styles.timelineItemDate}>{formatDate(orderData.date)}</Text>
            </View>
          </View>
          
          <View style={[styles.timelineLine, styles.activeLine]} />
          
          <View style={styles.timelineItem}>
            <View style={[styles.timelineIcon, styles.activeIcon]}>
              <Clock size={24} color={Colors.neutral.white} />
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineItemTitle}>Awaiting Approval</Text>
              <Text style={styles.timelineItemDate}>Pending supplier confirmation</Text>
            </View>
          </View>
          
          <View style={[styles.timelineLine, styles.inactiveLine]} />
          
          <View style={styles.timelineItem}>
            <View style={[styles.timelineIcon, styles.inactiveIcon]}>
              <Package size={24} color={Colors.neutral.lightGray} />
            </View>
            <View style={styles.timelineContent}>
              <Text style={[styles.timelineItemTitle, styles.inactiveText]}>Processing</Text>
              <Text style={[styles.timelineItemDate, styles.inactiveText]}>Order preparation</Text>
            </View>
          </View>
          
          <View style={[styles.timelineLine, styles.inactiveLine]} />
          
          <View style={styles.timelineItem}>
            <View style={[styles.timelineIcon, styles.inactiveIcon]}>
              <Truck size={24} color={Colors.neutral.lightGray} />
            </View>
            <View style={styles.timelineContent}>
              <Text style={[styles.timelineItemTitle, styles.inactiveText]}>Shipping</Text>
              <Text style={[styles.timelineItemDate, styles.inactiveText]}>Order in transit</Text>
            </View>
          </View>
          
          <View style={[styles.timelineLine, styles.inactiveLine]} />
          
          <View style={styles.timelineItem}>
            <View style={[styles.timelineIcon, styles.inactiveIcon]}>
              <Calendar size={24} color={Colors.neutral.lightGray} />
            </View>
            <View style={styles.timelineContent}>
              <Text style={[styles.timelineItemTitle, styles.inactiveText]}>Delivered</Text>
              <Text style={[styles.timelineItemDate, styles.inactiveText]}>
                Estimated: {formatDate(orderData.estimatedDelivery)}
              </Text>
            </View>
          </View>
        </View>
        
        {supplier && (
          <View style={styles.supplierCard}>
            <Text style={styles.supplierTitle}>Supplier Information</Text>
            
            <View style={styles.supplierInfo}>
              <Image 
                source={{ uri: supplier.image || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0' }} 
                style={styles.supplierImage} 
              />
              <View style={styles.supplierDetails}>
                <Text style={styles.supplierName}>{supplier.name}</Text>
                <Text style={styles.supplierContact}>{supplier.phone}</Text>
                <Text style={styles.supplierContact}>{supplier.email}</Text>
              </View>
            </View>
          </View>
        )}
      </View>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={handleViewOrderDetails}
        >
          <Text style={styles.secondaryButtonText}>View Order Details</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={handleContactSupplier}
        >
          <Text style={styles.primaryButtonText}>Contact Supplier</Text>
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
  content: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.neutral.black,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  statusMessage: {
    fontSize: 16,
    color: Colors.neutral.gray,
    textAlign: 'center',
    lineHeight: 22,
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderInfoLabel: {
    fontSize: 16,
    color: Colors.neutral.gray,
  },
  orderInfoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.neutral.black,
  },
  statusTimeline: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral.black,
    marginBottom: 24,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    zIndex: 1,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  completedIcon: {
    backgroundColor: Colors.status.success,
  },
  activeIcon: {
    backgroundColor: Colors.primary.burgundy,
  },
  inactiveIcon: {
    backgroundColor: Colors.neutral.extraLightGray,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 24,
  },
  timelineItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral.black,
    marginBottom: 4,
  },
  timelineItemDate: {
    fontSize: 14,
    color: Colors.neutral.gray,
  },
  inactiveText: {
    color: Colors.neutral.lightGray,
  },
  timelineLine: {
    position: 'absolute',
    width: 2,
    left: 19,
    top: 40,
    bottom: 0,
    zIndex: 0,
  },
  activeLine: {
    backgroundColor: Colors.primary.burgundy,
    height: 40,
  },
  inactiveLine: {
    backgroundColor: Colors.neutral.lightGray,
    height: 40,
  },
  supplierCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  supplierTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral.black,
    marginBottom: 16,
  },
  supplierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supplierImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  supplierDetails: {
    flex: 1,
  },
  supplierName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral.black,
    marginBottom: 4,
  },
  supplierContact: {
    fontSize: 14,
    color: Colors.neutral.gray,
    marginBottom: 2,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.extraLightGray,
  },
  secondaryButton: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderColor: Colors.primary.burgundy,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.burgundy,
  },
  primaryButton: {
    flex: 1,
    height: 56,
    backgroundColor: Colors.primary.burgundy,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral.white,
  },
});