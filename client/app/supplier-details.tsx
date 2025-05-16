import AppBar from '@/components/AppBar';
import ProductCard from '@/components/ProductCard';
import Colors from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { Product, User } from '@/types';
import api from '@/utils/apiClient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Mail, MapPin, Package, Phone, Star, Tag } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SupplierDetailsScreen() {
  const { id } = useLocalSearchParams();
  const ownerId = typeof id === 'string' ? id : undefined;
  const router = useRouter();
  const { hasPermission } = useAuthStore();
  const { user } = useAuthStore();
  
  const [suppliers, setSuppliers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ownerId) return;

    const fetchSuppliers = async () => {
      try {
        const res = await api.get('/suppliers');
        const pro = await api.get(`/products/owner/${ownerId}`);
        setSuppliers(res.data);
        setProducts(pro.data);
        console.log('suppliers:', JSON.stringify(res.data, null, 2));
        console.log('products:', JSON.stringify(pro.data, null, 2));
        console.log('ownerId:', ownerId);
        console.log('user:', JSON.stringify(user, null, 2));
      } catch (err) {
        console.error('Failed to fetch suppliers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, [ownerId]);

  const supplier = suppliers.find(s => s._id === ownerId);
  const supplierProducts = products;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary.burgundy} />
      </SafeAreaView>
    );
  }

  if (!supplier) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Supplier Not Found',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <ArrowLeft size={24} color={Colors.neutral.black} />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.notFoundContainer}>
          <Package size={64} color={Colors.neutral.lightGray} />
          <Text style={styles.notFoundText}>Supplier not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleContactSupplier = (method: 'phone' | 'email') => {
    const message = method === 'phone'
      ? `Call ${supplier.name} at ${supplier.phone}?`
      : `Email ${supplier.name} at ${supplier.email}?`;

    Alert.alert('Contact Supplier', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: method === 'phone' ? 'Call' : 'Email', onPress: () => console.log(`${method === 'phone' ? 'Calling' : 'Emailing'} supplier`) }
    ]);
  };

  const handlePlaceOrder = () => {
    if (!hasPermission('place_order')) {
      Alert.alert('Permission Denied', 'You do not have permission to place orders');
      return;
    }

    router.push(`/order-information?supplierId=${supplier._id}`);
  };

  const handleProductPress = (product: any) => {
    router.push(`/product-details?id=${product._id}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Supplier Details',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={Colors.neutral.black} />
            </TouchableOpacity>
          ),
        }}
      />
      <AppBar title='Supplier Details' isCanGoBack={true} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: supplier?.avatar || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0' }}
          style={styles.supplierImage}
          resizeMode="cover"
        />

        <View style={styles.supplierInfo}>
          <Text style={styles.supplierName}>{supplier.name}</Text>

          <View style={styles.ratingContainer}>
            <Star size={16} color={Colors.status.warning} fill={Colors.status.warning} />
            <Text style={styles.ratingText}>{supplier.rating?.toFixed(1)}</Text>
            <Text style={styles.productsCount}>({supplier.productsCount} products)</Text>
          </View>

          <View style={styles.categoriesContainer}>
            {supplier.categories?.map((category, index) => (
              <View key={index} style={styles.categoryBadge}>
                <Tag size={14} color={Colors.neutral.darkGray} style={styles.categoryIcon} />
                <Text style={styles.categoryText}>{category}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Contact Information</Text>

          <View style={styles.contactItem}>
            <Phone size={20} color={Colors.primary.burgundy} />
            <Text style={styles.contactText}>{supplier.phone}</Text>
            <TouchableOpacity onPress={() => handleContactSupplier('phone')}>
              <Text style={styles.contactButtonText}>Call</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.contactItem}>
            <Mail size={20} color={Colors.primary.burgundy} />
            <Text style={styles.contactText}>{supplier.email}</Text>
            <TouchableOpacity onPress={() => handleContactSupplier('email')}>
              <Text style={styles.contactButtonText}>Email</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.contactItem}>
            <MapPin size={20} color={Colors.primary.burgundy} />
            <Text style={styles.contactText}>{supplier.address}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.productsHeader}>
            <Text style={styles.sectionTitle}>Products</Text>
            <Text style={styles.productsCount}>{supplierProducts.length} items</Text>
          </View>
        </View>

        <FlatList
          data={supplierProducts}
          renderItem={({ item }) => <ProductCard product={item} onPress={handleProductPress} />}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.productsList}
          scrollEnabled={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyProductsContainer}>
              <Package size={48} color={Colors.neutral.lightGray} />
              <Text style={styles.emptyProductsText}>No products available</Text>
            </View>
          )}
        />
      </ScrollView>

      {/*<View style={styles.footer}>
        <TouchableOpacity style={styles.orderButton} onPress={handlePlaceOrder}>
          <ShoppingCart size={20} color={Colors.neutral.white} />
          <Text style={styles.orderButtonText}>Place Order</Text>
        </TouchableOpacity>
      </View>*/}
    </SafeAreaView>
  );
}

// Add your styles below as you had them, or let me know if you need them rebuilt too.


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
  },
  scrollView: {
    flex: 1,
  },
  supplierImage: {
    width: '100%',
    height: 200,
  },
  supplierInfo: {
    padding: 16,
  },
  supplierName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.neutral.black,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.neutral.darkGray,
    marginLeft: 4,
    marginRight: 8,
  },
  productsCount: {
    fontSize: 14,
    color: Colors.neutral.gray,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.extraLightGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryIcon: {
    marginRight: 4,
  },
  categoryText: {
    fontSize: 14,
    color: Colors.neutral.darkGray,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral.extraLightGray,
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral.black,
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactIcon: {
    marginRight: 12,
  },
  contactText: {
    flex: 1,
    fontSize: 16,
    color: Colors.neutral.darkGray,
  },
  contactButton: {
    backgroundColor: Colors.primary.burgundy + '20',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary.burgundy,
  },
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productsList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyProductsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: Colors.neutral.extraLightGray,
    borderRadius: 12,
    marginBottom: 16,
  },
  emptyProductsText: {
    fontSize: 16,
    color: Colors.neutral.darkGray,
    marginTop: 12,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.extraLightGray,
  },
  orderButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary.burgundy,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  orderButtonIcon: {
    marginRight: 8,
  },
  orderButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral.white,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notFoundText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral.darkGray,
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: Colors.primary.burgundy,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: '500',
  },
});