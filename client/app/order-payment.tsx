import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { ArrowLeft, CreditCard, CheckCircle, User, Mail, Phone, Building, MapPin, ShoppingCart } from 'lucide-react-native';
import { products } from '@/mocks/products';

export default function OrderPaymentScreen() {
  const { supplierId, supplierName, productId } = useLocalSearchParams();
  const router = useRouter();
  
  // Get selected product if productId is provided
  const selectedProduct = productId ? products.find(p => p.id === productId) : null;
  
  // Mock order items
  const [orderItems, setOrderItems] = useState([
    ...(selectedProduct ? [{ 
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      quantity: 10,
      total: selectedProduct.price * 10
    }] : []),
    {
      id: 'item1',
      name: 'Coffee Beans - Dark Roast',
      price: 12.99,
      quantity: 20,
      total: 259.80
    },
    {
      id: 'item2',
      name: 'Tea Bags - Assorted',
      price: 8.49,
      quantity: 15,
      total: 127.35
    }
  ]);
  
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('creditCard');
  
  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.total, 0);
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }
    
    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Contact name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (selectedPaymentMethod === 'creditCard') {
      if (!formData.cardNumber.trim()) {
        newErrors.cardNumber = 'Card number is required';
      } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
        newErrors.cardNumber = 'Card number must be 16 digits';
      }
      
      if (!formData.expiryDate.trim()) {
        newErrors.expiryDate = 'Expiry date is required';
      } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
        newErrors.expiryDate = 'Expiry date must be in MM/YY format';
      }
      
      if (!formData.cvv.trim()) {
        newErrors.cvv = 'CVV is required';
      } else if (!/^\d{3,4}$/.test(formData.cvv)) {
        newErrors.cvv = 'CVV must be 3 or 4 digits';
      }
      
      if (!formData.nameOnCard.trim()) {
        newErrors.nameOnCard = 'Name on card is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleInputChange = (field: string, value: string) => {
    // Format card number with spaces
    if (field === 'cardNumber') {
      value = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    }
    
    // Format expiry date with slash
    if (field === 'expiryDate') {
      value = value.replace(/\//g, '');
      if (value.length > 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
      }
    }
    
    setFormData({ ...formData, [field]: value });
    
    // Clear error when typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };
  
  const handlePlaceOrder = () => {
    if (validateForm()) {
      // Show loading or processing state in a real app
      setTimeout(() => {
        Alert.alert(
          "Order Placed Successfully",
          "Your order has been placed and will be processed by the supplier.",
          [
            {
              text: "OK",
              onPress: () => {
                // Navigate back to inventory screen
                router.push('/(tabs)/inventory');
              }
            }
          ]
        );
      }, 1500);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Place Order',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={Colors.neutral.black} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.orderSummary}>
          <View style={styles.supplierInfo}>
            <ShoppingCart size={20} color={Colors.primary.burgundy} style={styles.supplierIcon} />
            <Text style={styles.supplierName}>
              Order from: {Array.isArray(supplierName) ? supplierName[0] : supplierName}
            </Text>
          </View>
          
          <View style={styles.orderItems}>
            {orderItems.map((item, index) => (
              <View key={item.id} style={styles.orderItem}>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>${item.price.toFixed(2)} × {item.quantity}</Text>
                </View>
                <Text style={styles.itemTotal}>${item.total.toFixed(2)}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>${calculateTotal().toFixed(2)}</Text>
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Business Information</Text>
          
          <View style={styles.inputGroup}>
            <View style={styles.inputIconContainer}>
              <Building size={20} color={Colors.neutral.gray} />
            </View>
            <TextInput
              style={[styles.input, errors.businessName ? styles.inputError : null]}
              placeholder="Business Name"
              value={formData.businessName}
              onChangeText={(text) => handleInputChange('businessName', text)}
            />
          </View>
          {errors.businessName && <Text style={styles.errorText}>{errors.businessName}</Text>}
          
          <View style={styles.inputGroup}>
            <View style={styles.inputIconContainer}>
              <User size={20} color={Colors.neutral.gray} />
            </View>
            <TextInput
              style={[styles.input, errors.contactName ? styles.inputError : null]}
              placeholder="Contact Name"
              value={formData.contactName}
              onChangeText={(text) => handleInputChange('contactName', text)}
            />
          </View>
          {errors.contactName && <Text style={styles.errorText}>{errors.contactName}</Text>}
          
          <View style={styles.inputGroup}>
            <View style={styles.inputIconContainer}>
              <Mail size={20} color={Colors.neutral.gray} />
            </View>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              placeholder="Email Address"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
            />
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          
          <View style={styles.inputGroup}>
            <View style={styles.inputIconContainer}>
              <Phone size={20} color={Colors.neutral.gray} />
            </View>
            <TextInput
              style={[styles.input, errors.phone ? styles.inputError : null]}
              placeholder="Phone Number"
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={(text) => handleInputChange('phone', text)}
            />
          </View>
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          
          <View style={styles.inputGroup}>
            <View style={styles.inputIconContainer}>
              <MapPin size={20} color={Colors.neutral.gray} />
            </View>
            <TextInput
              style={[styles.input, errors.address ? styles.inputError : null]}
              placeholder="Shipping Address"
              value={formData.address}
              onChangeText={(text) => handleInputChange('address', text)}
            />
          </View>
          {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          
          <View style={styles.paymentMethods}>
            <TouchableOpacity
              style={[
                styles.paymentMethodCard,
                selectedPaymentMethod === 'creditCard' && styles.selectedPaymentMethod
              ]}
              onPress={() => setSelectedPaymentMethod('creditCard')}
            >
              <View style={styles.paymentMethodContent}>
                <CreditCard size={24} color={Colors.primary.burgundy} />
                <Text style={styles.paymentMethodText}>Credit Card</Text>
              </View>
              {selectedPaymentMethod === 'creditCard' && (
                <CheckCircle size={20} color={Colors.primary.burgundy} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.paymentMethodCard,
                selectedPaymentMethod === 'bankTransfer' && styles.selectedPaymentMethod
              ]}
              onPress={() => setSelectedPaymentMethod('bankTransfer')}
            >
              <View style={styles.paymentMethodContent}>
                <Building size={24} color={Colors.primary.burgundy} />
                <Text style={styles.paymentMethodText}>Bank Transfer</Text>
              </View>
              {selectedPaymentMethod === 'bankTransfer' && (
                <CheckCircle size={20} color={Colors.primary.burgundy} />
              )}
            </TouchableOpacity>
          </View>
          
          {selectedPaymentMethod === 'creditCard' && (
            <View style={styles.creditCardForm}>
              <View style={styles.inputGroup}>
                <TextInput
                  style={[styles.input, errors.cardNumber ? styles.inputError : null]}
                  placeholder="Card Number"
                  keyboardType="numeric"
                  maxLength={19} // 16 digits + 3 spaces
                  value={formData.cardNumber}
                  onChangeText={(text) => handleInputChange('cardNumber', text)}
                />
              </View>
              {errors.cardNumber && <Text style={styles.errorText}>{errors.cardNumber}</Text>}
              
              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <TextInput
                    style={[styles.input, errors.expiryDate ? styles.inputError : null]}
                    placeholder="MM/YY"
                    keyboardType="numeric"
                    maxLength={5} // MM/YY
                    value={formData.expiryDate}
                    onChangeText={(text) => handleInputChange('expiryDate', text)}
                  />
                </View>
                
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <TextInput
                    style={[styles.input, errors.cvv ? styles.inputError : null]}
                    placeholder="CVV"
                    keyboardType="numeric"
                    maxLength={4}
                    value={formData.cvv}
                    onChangeText={(text) => handleInputChange('cvv', text)}
                    secureTextEntry
                  />
                </View>
              </View>
              
              {(errors.expiryDate || errors.cvv) && (
                <Text style={styles.errorText}>
                  {errors.expiryDate || errors.cvv}
                </Text>
              )}
              
              <View style={styles.inputGroup}>
                <TextInput
                  style={[styles.input, errors.nameOnCard ? styles.inputError : null]}
                  placeholder="Name on Card"
                  value={formData.nameOnCard}
                  onChangeText={(text) => handleInputChange('nameOnCard', text)}
                />
              </View>
              {errors.nameOnCard && <Text style={styles.errorText}>{errors.nameOnCard}</Text>}
            </View>
          )}
          
          {selectedPaymentMethod === 'bankTransfer' && (
            <View style={styles.bankTransferInfo}>
              <Text style={styles.bankTransferText}>
                You will receive bank transfer details after placing the order.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.placeOrderButton}
          onPress={handlePlaceOrder}
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
    backgroundColor: Colors.neutral.white,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  orderSummary: {
    backgroundColor: Colors.neutral.extraLightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  supplierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  supplierIcon: {
    marginRight: 8,
  },
  supplierName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral.black,
  },
  orderItems: {
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral.black,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 12,
    color: Colors.neutral.gray,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral.black,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral.black,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.burgundy,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral.black,
    marginBottom: 16,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.extraLightGray,
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  inputIconContainer: {
    padding: 12,
    backgroundColor: Colors.neutral.extraLightGray,
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 12,
    fontSize: 16,
    color: Colors.neutral.black,
  },
  inputError: {
    borderWidth: 1,
    borderColor: Colors.status.error,
  },
  errorText: {
    color: Colors.status.error,
    fontSize: 12,
    marginBottom: 12,
    marginTop: -8,
  },
  paymentMethods: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  paymentMethodCard: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.neutral.extraLightGray,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: Colors.neutral.extraLightGray,
  },
  selectedPaymentMethod: {
    borderColor: Colors.primary.burgundy,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral.darkGray,
  },
  creditCardForm: {
    marginTop: 8,
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bankTransferInfo: {
    backgroundColor: Colors.neutral.extraLightGray,
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  bankTransferText: {
    fontSize: 14,
    color: Colors.neutral.darkGray,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.extraLightGray,
  },
  placeOrderButton: {
    backgroundColor: Colors.primary.burgundy,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  placeOrderButtonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: '600',
  },
});