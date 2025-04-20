import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import Colors from '@/constants/colors';
import { X, ChevronDown, Plus, Minus, ShoppingCart } from 'lucide-react-native';
import { Product, User } from '@/types';
import api from '@/utils/apiClient';

export default function NewOrderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialSupplierId = params.supplierId as string | undefined;
  const initialProductId = params.productId as string | undefined;

  const [suppliers, setSuppliers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<User | null>(null);
  const [initialProduct, setInitialProduct] = useState<Product | null>(null);
  const [orderItems, setOrderItems] = useState<{ product: Product; quantity: number }[]>([]);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supplierRes = await api.get('/suppliers');
        const productRes = await api.get('/products');

        const fetchedSuppliers: User[] = supplierRes.data;
        const fetchedProducts: Product[] = productRes.data;

        setSuppliers(fetchedSuppliers);
        setProducts(fetchedProducts);

        // Preselect supplier
        if (initialSupplierId) {
          const supplier = fetchedSuppliers.find(s => s._id === initialSupplierId);
          if (supplier) setSelectedSupplier(supplier);
        }

        // Preselect product
        if (initialProductId) {
          const product = fetchedProducts.find(p => p._id === initialProductId);
          if (product) {
            setInitialProduct(product);
            setOrderItems([{ product, quantity: 1 }]);
          }
        }
      } catch (err) {
        console.error("Error fetching suppliers/products:", err);
      }
    };

    fetchData();
  }, [initialSupplierId, initialProductId]);

  const filteredProducts = products.filter(product =>
    (selectedSupplier ? product.supplierId === selectedSupplier._id : true) &&
    (searchQuery
      ? product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      : true)
  );
  

  const addProductToOrder = (product: Product) => {
    const existingItemIndex = orderItems.findIndex(item => item.product._id === product._id);

    if (existingItemIndex >= 0) {
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += 1;
      setOrderItems(updatedItems);
    } else {
      setOrderItems([...orderItems, { product, quantity: 1 }]);
    }

    setShowProductSelector(false);
    setSearchQuery('');
  };

  const updateItemQuantity = (index: number, newQuantity: number) => {
    const updatedItems = [...orderItems];
    if (newQuantity <= 0) {
      updatedItems.splice(index, 1);
    } else {
      updatedItems[index].quantity = newQuantity;
    }
    setOrderItems(updatedItems);
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const handlePlaceOrder = () => {
    console.log('Order Placed:', {
      supplierId: selectedSupplier?._id,
      items: orderItems,
      total: calculateTotal()
    });

    const orderData = {
      supplierId: selectedSupplier?._id,
      items: orderItems.map(item => ({
        productId: item.product._id,
        quantity: item.quantity,
        unitPrice: item.product.price
      })),
      totalAmount: calculateTotal(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    api.post('/order', orderData)
      .then(response => {
        console.log('Order created successfully:', response.data);
        router.back();
      })
      .catch(error => {
        console.error('Error creating order:', error);
      });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'New Order',
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Supplier</Text>
          
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowSupplierDropdown(!showSupplierDropdown)}
          >
            <Text style={selectedSupplier ? styles.dropdownText : styles.dropdownPlaceholder}>
              {selectedSupplier ? selectedSupplier.name || selectedSupplier.email : "Select supplier"}
            </Text>
            <ChevronDown size={20} color={Colors.neutral.gray} />
          </TouchableOpacity>
          
          {showSupplierDropdown && (
            <View style={styles.dropdownMenu}>
              {suppliers.map((supplier) => (
                <TouchableOpacity
                  key={supplier._id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedSupplier(supplier);
                    setShowSupplierDropdown(false);
                    // Clear order items when changing supplier
                    setOrderItems([]);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{supplier.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {selectedSupplier && (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Order Items</Text>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => setShowProductSelector(true)}
                >
                  <Plus size={20} color={Colors.neutral.white} />
                  <Text style={styles.addButtonText}>Add Product</Text>
                </TouchableOpacity>
              </View>
              
              {orderItems.length === 0 ? (
                <View style={styles.emptyState}>
                  <ShoppingCart size={48} color={Colors.neutral.lightGray} />
                  <Text style={styles.emptyStateText}>No items added yet</Text>
                  <Text style={styles.emptyStateSubtext}>Tap "Add Product" to start your order</Text>
                </View>
              ) : (
                <View style={styles.orderItemsList}>
                  {orderItems.map((item, index) => (
                    <View key={index} style={styles.orderItem}>
                      <View style={styles.orderItemInfo}>
                        <Text style={styles.orderItemName}>{item.product.name}</Text>
                        <Text style={styles.orderItemPrice}>${item.product.price.toFixed(2)}</Text>
                      </View>
                      
                      <View style={styles.quantityControl}>
                        <TouchableOpacity 
                          style={styles.quantityButton}
                          onPress={() => updateItemQuantity(index, item.quantity - 1)}
                        >
                          <Minus size={16} color={Colors.neutral.gray} />
                        </TouchableOpacity>
                        
                        <Text style={styles.quantityText}>{item.quantity}</Text>
                        
                        <TouchableOpacity 
                          style={styles.quantityButton}
                          onPress={() => updateItemQuantity(index, item.quantity + 1)}
                        >
                          <Plus size={16} color={Colors.neutral.gray} />
                        </TouchableOpacity>
                      </View>
                      
                      <Text style={styles.orderItemTotal}>
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {orderItems.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Order Summary</Text>
                
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>${calculateTotal().toFixed(2)}</Text>
                </View>
                
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Shipping</Text>
                  <Text style={styles.summaryValue}>$0.00</Text>
                </View>
                
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Tax</Text>
                  <Text style={styles.summaryValue}>${(calculateTotal() * 0.1).toFixed(2)}</Text>
                </View>
                
                <View style={[styles.summaryItem, styles.totalItem]}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>${(calculateTotal() * 1.1).toFixed(2)}</Text>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {showProductSelector && (
        <View style={styles.productSelectorOverlay}>
          <View style={styles.productSelector}>
            <View style={styles.productSelectorHeader}>
              <Text style={styles.productSelectorTitle}>Select Products</Text>
              <TouchableOpacity onPress={() => setShowProductSelector(false)}>
                <X size={24} color={Colors.neutral.black} />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            
            <ScrollView style={styles.productList}>
              {filteredProducts.map((product) => (
                <TouchableOpacity
                  key={product._id}
                  style={styles.productItem}
                  onPress={() => addProductToOrder(product)}
                >
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productCategory}>{product.category}</Text>
                  </View>
                  <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
                </TouchableOpacity>
              ))}
              
              {filteredProducts.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No products found</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.placeOrderButton,
            (!selectedSupplier || orderItems.length === 0) && styles.disabledButton
          ]}
          onPress={handlePlaceOrder}
          disabled={!selectedSupplier || orderItems.length === 0}
        >
          <Text style={styles.placeOrderButtonText}>Place Order</Text>
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
  section: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral.black,
    marginBottom: 16,
  },
  dropdownButton: {
    backgroundColor: Colors.neutral.extraLightGray,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: Colors.neutral.black,
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: Colors.neutral.gray,
  },
  dropdownMenu: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: Colors.neutral.extraLightGray,
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.extraLightGray,
  },
  dropdownItemText: {
    fontSize: 16,
    color: Colors.neutral.black,
  },
  addButton: {
    backgroundColor: Colors.primary.burgundy,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: Colors.neutral.white,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.neutral.gray,
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.neutral.lightGray,
    marginTop: 4,
    textAlign: 'center',
  },
  orderItemsList: {
    marginTop: 8,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.extraLightGray,
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 16,
    color: Colors.neutral.black,
    marginBottom: 4,
  },
  orderItemPrice: {
    fontSize: 14,
    color: Colors.neutral.gray,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.neutral.extraLightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.neutral.black,
    marginHorizontal: 12,
    minWidth: 24,
    textAlign: 'center',
  },
  orderItemTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral.black,
    minWidth: 70,
    textAlign: 'right',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: Colors.neutral.gray,
  },
  summaryValue: {
    fontSize: 16,
    color: Colors.neutral.black,
  },
  totalItem: {
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.extraLightGray,
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral.black,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary.burgundy,
  },
  productSelectorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  productSelector: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    width: '100%',
    height: '80%',
    padding: 16,
  },
  productSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  productSelectorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral.black,
  },
  searchInput: {
    backgroundColor: Colors.neutral.extraLightGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  productList: {
    flex: 1,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.extraLightGray,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    color: Colors.neutral.black,
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    color: Colors.neutral.gray,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.burgundy,
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.extraLightGray,
  },
  placeOrderButton: {
    backgroundColor: Colors.primary.burgundy,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: Colors.neutral.lightGray,
  },
  placeOrderButtonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: '600',
  },
});