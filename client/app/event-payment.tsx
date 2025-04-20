import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { ArrowLeft, Calendar, Clock, CreditCard, CheckCircle, User, Mail, Phone } from 'lucide-react-native';
import api from '@/utils/apiClient';

export default function EventPaymentScreen() {
  const { id, title, price, date, time } = useLocalSearchParams();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('creditCard');
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
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
  const handleReservation = async () => {
    try {
      // Simulate sending data to a server or database
      const reservationData = {
        eventId: id,
        attendeeName: formData.name,
        attendeeEmail: formData.email,
        ticketType: 'Standard', // You can update this dynamically
        price: parseFloat(Array.isArray(price) ? price[0] : price),
        nameOnCard: selectedPaymentMethod === 'creditCard' ? formData.nameOnCard : '',
        cardNumber: selectedPaymentMethod === 'creditCard' ? formData.cardNumber.replace(/\s/g, '') : '',
        cardExpiry: selectedPaymentMethod === 'creditCard' ? formData.expiryDate : '',
        cardCVC: selectedPaymentMethod === 'creditCard' ? formData.cvv : '',
      };
  
      // Replace this with your real API or DB logic
      console.log("Sending reservation to server:", reservationData);

      const res = await api.post('reservations', reservationData);
      if (res.status !== 201) {
        Alert.alert("Error", "Failed to reserve your spot.");
        return false;
      }


      
      // Example:
      // await fetch('https://your-api.com/reservations', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(reservationData),
      // });
      Alert.alert(
        "Reservation Successful",
        "Your spot has been reserved successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              router.push('/(tabs)/events');
            },
          },
        ]
      );
      // Reset form data
      return true;
    } catch (error) {
      console.error("Reservation failed:", error);
      Alert.alert("Error", "Something went wrong while reserving your spot.");
      return false;
    }
  };
  
  
  const handlePayment = async () => {
    if (validateForm()) {
      // Optional: show a loader/spinner here
  
      const reserved = await handleReservation();
  
      if (reserved) {
        setTimeout(() => {
          Alert.alert(
            "Payment Successful",
            "You have successfully registered for the event!",
            [
              {
                text: "OK",
                onPress: () => {
                  router.push('/(tabs)/events');
                },
              },
            ]
          );
        }, 1000);
      }
    }
  };
  
  
  const formatPrice = (priceStr: string | string[]) => {
    const numPrice = parseFloat(Array.isArray(priceStr) ? priceStr[0] : priceStr);
    return numPrice.toFixed(2);
  };
  
  const formatDate = (dateStr: string | string[]) => {
    const dateString = Array.isArray(dateStr) ? dateStr[0] : dateStr;
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Event Registration',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={Colors.neutral.black} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.eventSummary}>
          <Text style={styles.eventTitle}>{title}</Text>
          
          <View style={styles.eventDetails}>
            <View style={styles.eventDetailItem}>
              <Calendar size={16} color={Colors.neutral.gray} style={styles.eventDetailIcon} />
              <Text style={styles.eventDetailText}>{formatDate(date)}</Text>
            </View>
            
            <View style={styles.eventDetailItem}>
              <Clock size={16} color={Colors.neutral.gray} style={styles.eventDetailIcon} />
              <Text style={styles.eventDetailText}>{time}</Text>
            </View>
          </View>
          
          <View style={styles.priceSummary}>
            <Text style={styles.priceLabel}>Registration Fee</Text>
            <Text style={styles.priceValue}>${formatPrice(price)}</Text>
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputGroup}>
            <View style={styles.inputIconContainer}>
              <User size={20} color={Colors.neutral.gray} />
            </View>
            <TextInput
              style={[styles.input, errors.name ? styles.inputError : null]}
              placeholder="Full Name"
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
            />
          </View>
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          
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
                selectedPaymentMethod === 'paypal' && styles.selectedPaymentMethod
              ]}
              onPress={() => setSelectedPaymentMethod('paypal')}
            >
              <View style={styles.paymentMethodContent}>
                <Image 
                  source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/1200px-PayPal.svg.png' }} 
                  style={styles.paypalIcon} 
                  resizeMode="contain"
                />
                <Text style={styles.paymentMethodText}>PayPal</Text>
              </View>
              {selectedPaymentMethod === 'paypal' && (
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
          
          {selectedPaymentMethod === 'paypal' && (
            <View style={styles.paypalInfo}>
              <Text style={styles.paypalText}>
                You will be redirected to PayPal to complete your payment.
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>${formatPrice(price)}</Text>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.payButton}
          onPress={handlePayment}
        >
          <Text style={styles.payButtonText}>
            {selectedPaymentMethod === 'creditCard' ? 'Pay Now' : 'Continue to PayPal'}
          </Text>
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
  eventSummary: {
    backgroundColor: Colors.neutral.extraLightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral.black,
    marginBottom: 12,
  },
  eventDetails: {
    marginBottom: 16,
  },
  eventDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventDetailIcon: {
    marginRight: 8,
  },
  eventDetailText: {
    fontSize: 14,
    color: Colors.neutral.darkGray,
  },
  priceSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.lightGray,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.neutral.darkGray,
  },
  priceValue: {
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
  paypalIcon: {
    width: 24,
    height: 24,
  },
  creditCardForm: {
    marginTop: 8,
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paypalInfo: {
    backgroundColor: Colors.neutral.extraLightGray,
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  paypalText: {
    fontSize: 14,
    color: Colors.neutral.darkGray,
    textAlign: 'center',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.extraLightGray,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral.black,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary.burgundy,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.extraLightGray,
  },
  payButton: {
    backgroundColor: Colors.primary.burgundy,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  payButtonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: '600',
  },
});