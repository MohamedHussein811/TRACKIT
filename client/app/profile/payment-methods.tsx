import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { ArrowLeft, CreditCard, Plus, Check, Trash2 } from 'lucide-react-native';
import AppBar from '@/components/AppBar';

// Mock payment methods
const mockPaymentMethods = [
  {
    id: '1',
    type: 'visa',
    last4: '4242',
    expMonth: 12,
    expYear: 2024,
    isDefault: true,
  },
  {
    id: '2',
    type: 'mastercard',
    last4: '5555',
    expMonth: 10,
    expYear: 2025,
    isDefault: false,
  }
];

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState(mockPaymentMethods);

  const handleAddPaymentMethod = () => {
    // In a real app, you would navigate to a screen to add a new payment method
    alert('Add payment method functionality would be implemented here');
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(methods => 
      methods.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
  };

  const handleDeletePaymentMethod = (id: string) => {
    setPaymentMethods(methods => methods.filter(method => method.id !== id));
  };

  const getCardImage = (type: string) => {
    switch (type) {
      case 'visa':
        return 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png';
      case 'mastercard':
        return 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png';
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Payment Methods',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={Colors.neutral.black} />
            </TouchableOpacity>
          ),
        }} 
      />

      <AppBar title='Payment Methods' isCanGoBack/>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Your Payment Methods</Text>
        
        {paymentMethods.map(method => (
          <View key={method.id} style={styles.paymentCard}>
            <View style={styles.cardHeader}>
              <Image 
                source={{ uri: getCardImage(method.type) }} 
                style={styles.cardLogo} 
                resizeMode="contain"
              />
              {method.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>Default</Text>
                </View>
              )}
            </View>
            
            <Text style={styles.cardNumber}>•••• •••• •••• {method.last4}</Text>
            <Text style={styles.cardExpiry}>Expires {method.expMonth}/{method.expYear}</Text>
            
            <View style={styles.cardActions}>
              {!method.isDefault && (
                <TouchableOpacity 
                  style={styles.cardAction}
                  onPress={() => handleSetDefault(method.id)}
                >
                  <Check size={16} color={Colors.primary.burgundy} />
                  <Text style={styles.cardActionText}>Set as Default</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[styles.cardAction, styles.deleteAction]}
                onPress={() => handleDeletePaymentMethod(method.id)}
              >
                <Trash2 size={16} color={Colors.status.error} />
                <Text style={styles.deleteActionText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        
        <TouchableOpacity 
          style={styles.addPaymentButton}
          onPress={handleAddPaymentMethod}
        >
          <Plus size={20} color={Colors.primary.burgundy} />
          <Text style={styles.addPaymentText}>Add Payment Method</Text>
        </TouchableOpacity>
        
        <View style={styles.infoSection}>
          <CreditCard size={20} color={Colors.neutral.gray} style={styles.infoIcon} />
          <Text style={styles.infoText}>
            Your payment information is securely stored and processed. We do not store your full card details on our servers.
          </Text>
        </View>
      </ScrollView>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral.black,
    marginBottom: 16,
  },
  paymentCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.neutral.extraLightGray,
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLogo: {
    width: 60,
    height: 40,
  },
  defaultBadge: {
    backgroundColor: Colors.primary.burgundyLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  defaultText: {
    fontSize: 12,
    color: Colors.primary.burgundy,
    fontWeight: '500',
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral.black,
    marginBottom: 8,
  },
  cardExpiry: {
    fontSize: 14,
    color: Colors.neutral.gray,
    marginBottom: 16,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.extraLightGray,
    paddingTop: 12,
  },
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  cardActionText: {
    fontSize: 14,
    color: Colors.primary.burgundy,
    marginLeft: 4,
  },
  deleteAction: {
    marginLeft: 16,
  },
  deleteActionText: {
    fontSize: 14,
    color: Colors.status.error,
    marginLeft: 4,
  },
  addPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neutral.white,
    borderWidth: 1,
    borderColor: Colors.primary.burgundy,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  addPaymentText: {
    fontSize: 16,
    color: Colors.primary.burgundy,
    fontWeight: '500',
    marginLeft: 8,
  },
  infoSection: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral.extraLightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.neutral.gray,
    lineHeight: 20,
  },
});