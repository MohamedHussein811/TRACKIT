import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { ArrowLeft, User, Building, MapPin, Phone, Mail, ChevronRight } from 'lucide-react-native';
import { suppliers } from '@/mocks/suppliers';

export default function OrderInformationScreen() {
  const { supplierId } = useLocalSearchParams();
  const router = useRouter();
  const supplier = suppliers.find(s => s.id === supplierId);

  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    address: '',
    city: '',
    zipCode: '',
    phone: '',
    email: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10,}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      // Navigate to payment screen
      router.push(`/order-payment?supplierId=${supplierId}&fromInfo=true`);
    } else {
      // Scroll to the first error
      Alert.alert('Please fill in all required fields correctly');
    }
  };

  if (!supplier) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'Order Information',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <ArrowLeft size={24} color={Colors.neutral.black} />
              </TouchableOpacity>
            ),
          }} 
        />
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Supplier not found</Text>
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
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Order Information',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={Colors.neutral.black} />
            </TouchableOpacity>
          ),
        }} 
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Your Information</Text>
            <Text style={styles.subtitle}>
              Please provide your contact and shipping information to place an order with {supplier.name}
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <User size={20} color={Colors.neutral.gray} />
                </View>
                <TextInput
                  style={[styles.input, errors.fullName && styles.inputError]}
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChangeText={(text) => handleChange('fullName', text)}
                />
              </View>
              {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
              
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Building size={20} color={Colors.neutral.gray} />
                </View>
                <TextInput
                  style={[styles.input, errors.companyName && styles.inputError]}
                  placeholder="Company Name"
                  value={formData.companyName}
                  onChangeText={(text) => handleChange('companyName', text)}
                />
              </View>
              {errors.companyName && <Text style={styles.errorText}>{errors.companyName}</Text>}
            </View>
            
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Shipping Address</Text>
              
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <MapPin size={20} color={Colors.neutral.gray} />
                </View>
                <TextInput
                  style={[styles.input, errors.address && styles.inputError]}
                  placeholder="Street Address"
                  value={formData.address}
                  onChangeText={(text) => handleChange('address', text)}
                />
              </View>
              {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
              
              <View style={styles.rowInputs}>
                <View style={[styles.inputContainer, styles.halfInput]}>
                  <TextInput
                    style={[styles.input, errors.city && styles.inputError]}
                    placeholder="City"
                    value={formData.city}
                    onChangeText={(text) => handleChange('city', text)}
                  />
                </View>
                
                <View style={[styles.inputContainer, styles.halfInput]}>
                  <TextInput
                    style={[styles.input, errors.zipCode && styles.inputError]}
                    placeholder="ZIP Code"
                    value={formData.zipCode}
                    onChangeText={(text) => handleChange('zipCode', text)}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              {(errors.city || errors.zipCode) && (
                <Text style={styles.errorText}>{errors.city || errors.zipCode}</Text>
              )}
            </View>
            
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Phone size={20} color={Colors.neutral.gray} />
                </View>
                <TextInput
                  style={[styles.input, errors.phone && styles.inputError]}
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChangeText={(text) => handleChange('phone', text)}
                  keyboardType="phone-pad"
                />
              </View>
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
              
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Mail size={20} color={Colors.neutral.gray} />
                </View>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="Email Address"
                  value={formData.email}
                  onChangeText={(text) => handleChange('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>
            
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Additional Notes</Text>
              
              <View style={styles.textAreaContainer}>
                <TextInput
                  style={styles.textArea}
                  placeholder="Add any special instructions or notes for your order"
                  value={formData.notes}
                  onChangeText={(text) => handleChange('notes', text)}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>
        </ScrollView>
        
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>Continue to Payment</Text>
            <ChevronRight size={20} color={Colors.neutral.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: Colors.neutral.white,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.neutral.black,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.neutral.gray,
    lineHeight: 22,
  },
  formContainer: {
    padding: 16,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: Colors.neutral.white,
  },
  inputIconContainer: {
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 12,
    fontSize: 16,
    color: Colors.neutral.black,
  },
  inputError: {
    borderColor: Colors.status.error,
  },
  errorText: {
    color: Colors.status.error,
    fontSize: 14,
    marginBottom: 12,
    marginTop: -8,
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 0.48,
  },
  textAreaContainer: {
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    borderRadius: 12,
    backgroundColor: Colors.neutral.white,
  },
  textArea: {
    height: 100,
    padding: 12,
    fontSize: 16,
    color: Colors.neutral.black,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.extraLightGray,
    backgroundColor: Colors.neutral.white,
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary.burgundy,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral.white,
    marginRight: 8,
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