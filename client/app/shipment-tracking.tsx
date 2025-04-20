import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import Colors from '@/constants/colors';
import { X, Package, Truck, CheckCircle, Clock, MapPin, Calendar } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '@/utils/apiClient';

// HIGHLIGHT: New shipment tracking screen
export default function ShipmentTrackingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const orderId = params.id as string;
  const [orders,setOrders] = useState([]);


  useEffect(() => {
    // Fetch suppliers from the API
    const fetchSups = async () => {
      try {
        const resOrders = await api.get<any[]>('/moderator/orders');
        setOrders(resOrders.data.orders);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      }
    };

    fetchSups();
  }, []);
  
  // Find the order from mock data
  const order = orders.find(o => o._id === orderId);
  
  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'Shipment Tracking',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <X size={24} color={Colors.neutral.black} />
              </TouchableOpacity>
            ),
          }} 
        />
        <View style={styles.notFoundContainer}>
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

  // Mock shipment tracking data
  const shipmentData = {
    status: order.status,
    trackingNumber: order.trackingNumber || 'Not available',
    carrier: 'Express Logistics',
    estimatedDelivery: order.expectedDelivery || 'Not available',
    origin: 'Supplier Warehouse, CA',
    destination: 'Your Business, NY',
    trackingHistory: [
      {
        status: 'Delivered',
        location: 'Your Business, NY',
        date: '2023-10-22',
        time: '14:35',
        completed: order.status === 'delivered',
      },
      {
        status: 'Out for Delivery',
        location: 'Local Distribution Center, NY',
        date: '2023-10-22',
        time: '08:12',
        completed: ['delivered', 'shipped'].includes(order.status),
      },
      {
        status: 'Arrived at Distribution Center',
        location: 'Regional Hub, NJ',
        date: '2023-10-21',
        time: '19:45',
        completed: ['delivered', 'shipped'].includes(order.status),
      },
      {
        status: 'In Transit',
        location: 'En Route',
        date: '2023-10-20',
        time: '10:30',
        completed: ['delivered', 'shipped', 'processing'].includes(order.status),
      },
      {
        status: 'Shipped',
        location: 'Supplier Warehouse, CA',
        date: '2023-10-19',
        time: '15:22',
        completed: ['delivered', 'shipped', 'processing'].includes(order.status),
      },
      {
        status: 'Order Processed',
        location: 'Supplier Facility, CA',
        date: '2023-10-18',
        time: '09:15',
        completed: true,
      },
    ],
  };

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
        return <CheckCircle size={24} color={Colors.status.success} />;
      case 'shipped':
        return <Truck size={24} color={Colors.status.info} />;
      case 'processing':
        return <Package size={24} color={Colors.status.warning} />;
      case 'pending':
        return <Clock size={24} color={Colors.neutral.gray} />;
      case 'cancelled':
        return <X size={24} color={Colors.status.error} />;
      default:
        return <Package size={24} color={Colors.neutral.gray} />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'Not available') return dateString;
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Shipment Tracking',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Colors.neutral.extraLightGray },
          headerTitleStyle: { color: Colors.neutral.black, fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <X size={24} color={Colors.neutral.black} />
            </TouchableOpacity>
          ),
        }} 
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.orderInfoCard}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderNumber}>Order #{order.id}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
              {getStatusIcon(order.status)}
              <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Text>
            </View>
          </View>
          
          <View style={styles.orderDetails}>
            <View style={styles.orderDetail}>
              <Text style={styles.orderDetailLabel}>Supplier:</Text>
              <Text style={styles.orderDetailValue}>{order.supplierName}</Text>
            </View>
            <View style={styles.orderDetail}>
              <Text style={styles.orderDetailLabel}>Order Date:</Text>
              <Text style={styles.orderDetailValue}>{formatDate(order.orderDate)}</Text>
            </View>
            <View style={styles.orderDetail}>
              <Text style={styles.orderDetailLabel}>Total Amount:</Text>
              <Text style={styles.orderDetailValue}>${order.totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.trackingInfoCard}>
          <Text style={styles.sectionTitle}>Shipment Information</Text>
          
          <View style={styles.trackingDetails}>
            <View style={styles.trackingDetail}>
              <Text style={styles.trackingDetailLabel}>Tracking Number:</Text>
              <Text style={styles.trackingDetailValue}>{shipmentData.trackingNumber}</Text>
            </View>
            <View style={styles.trackingDetail}>
              <Text style={styles.trackingDetailLabel}>Carrier:</Text>
              <Text style={styles.trackingDetailValue}>{shipmentData.carrier}</Text>
            </View>
            <View style={styles.trackingDetail}>
              <Text style={styles.trackingDetailLabel}>Estimated Delivery:</Text>
              <Text style={styles.trackingDetailValue}>{formatDate(shipmentData.estimatedDelivery)}</Text>
            </View>
          </View>
          
          <View style={styles.locationContainer}>
            <View style={styles.locationItem}>
              <MapPin size={20} color={Colors.primary.burgundy} />
              <View style={styles.locationTextContainer}>
                <Text style={styles.locationLabel}>From</Text>
                <Text style={styles.locationValue}>{shipmentData.origin}</Text>
              </View>
            </View>
            
            <View style={styles.locationDivider}>
              <View style={styles.locationDividerLine} />
              <Truck size={20} color={Colors.neutral.gray} />
              <View style={styles.locationDividerLine} />
            </View>
            
            <View style={styles.locationItem}>
              <MapPin size={20} color={Colors.status.success} />
              <View style={styles.locationTextContainer}>
                <Text style={styles.locationLabel}>To</Text>
                <Text style={styles.locationValue}>{shipmentData.destination}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.trackingHistoryCard}>
          <Text style={styles.sectionTitle}>Tracking History</Text>
          
          <View style={styles.timeline}>
            {shipmentData.trackingHistory.map((event, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View 
                    style={[
                      styles.timelineDot,
                      { backgroundColor: event.completed ? Colors.status.success : Colors.neutral.lightGray }
                    ]}
                  />
                  {index < shipmentData.trackingHistory.length - 1 && (
                    <View 
                      style={[
                        styles.timelineLine,
                        { backgroundColor: shipmentData.trackingHistory[index + 1].completed ? Colors.status.success : Colors.neutral.lightGray }
                      ]}
                    />
                  )}
                </View>
                
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineStatus}>{event.status}</Text>
                  <Text style={styles.timelineLocation}>{event.location}</Text>
                  <View style={styles.timelineDateTime}>
                    <Calendar size={14} color={Colors.neutral.gray} style={styles.timelineDateTimeIcon} />
                    <Text style={styles.timelineDateTimeText}>{event.date}</Text>
                    <Clock size={14} color={Colors.neutral.gray} style={styles.timelineDateTimeIcon} />
                    <Text style={styles.timelineDateTimeText}>{event.time}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.contactButton}>
          <Text style={styles.contactButtonText}>Contact Carrier</Text>
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
  scrollView: {
    flex: 1,
    padding: 16,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  notFoundText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral.darkGray,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: Colors.primary.burgundy,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: '500',
  },
  orderInfoCard: {
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
    marginBottom: 16,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral.black,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  orderDetails: {
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.extraLightGray,
    paddingTop: 16,
  },
  orderDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderDetailLabel: {
    fontSize: 14,
    color: Colors.neutral.gray,
  },
  orderDetailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral.black,
  },
  trackingInfoCard: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral.black,
    marginBottom: 16,
  },
  trackingDetails: {
    marginBottom: 16,
  },
  trackingDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  trackingDetailLabel: {
    fontSize: 14,
    color: Colors.neutral.gray,
  },
  trackingDetailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral.black,
  },
  locationContainer: {
    backgroundColor: Colors.neutral.extraLightGray,
    borderRadius: 12,
    padding: 16,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationTextContainer: {
    marginLeft: 12,
  },
  locationLabel: {
    fontSize: 12,
    color: Colors.neutral.gray,
  },
  locationValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral.black,
  },
  locationDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  locationDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.neutral.lightGray,
  },
  trackingHistoryCard: {
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
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLeft: {
    width: 24,
    alignItems: 'center',
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.status.success,
    marginRight: 12,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.status.success,
    marginTop: 4,
    marginBottom: -8,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 16,
  },
  timelineStatus: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral.black,
    marginBottom: 4,
  },
  timelineLocation: {
    fontSize: 14,
    color: Colors.neutral.darkGray,
    marginBottom: 8,
  },
  timelineDateTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineDateTimeIcon: {
    marginRight: 4,
  },
  timelineDateTimeText: {
    fontSize: 12,
    color: Colors.neutral.gray,
    marginRight: 12,
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.extraLightGray,
  },
  contactButton: {
    backgroundColor: Colors.primary.burgundy,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  contactButtonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: '600',
  },
});