import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import { ArrowLeft, Building2, MapPin, Phone } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BusinessInfoScreen() {
  const router = useRouter();
  const { signup, isLoading } = useAuthStore();
  
  // Get user data from previous screens (in a real app, you'd use a form state manager)
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  
  // Form validation
  const [businessNameError, setBusinessNameError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  
  const validateBusinessName = (value: string) => {
    if (!value.trim()) {
      setBusinessNameError('Business name is required');
      return false;
    }
    setBusinessNameError('');
    return true;
  };
  
  const validateAddress = (value: string) => {
    if (!value.trim()) {
      setAddressError('Address is required');
      return false;
    }
    setAddressError('');
    return true;
  };
  
  const validatePhone = (value: string) => {
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!value.trim()) {
      setPhoneError('Phone number is required');
      return false;
    } else if (!phoneRegex.test(value.replace(/\s/g, ''))) {
      setPhoneError('Please enter a valid phone number');
      return false;
    }
    setPhoneError('');
    return true;
  };
  
  const handleSubmit = async () => {
    const isBusinessNameValid = validateBusinessName(businessName);
    const isAddressValid = validateAddress(address);
    const isPhoneValid = validatePhone(phone);
    
    if (isBusinessNameValid && isAddressValid && isPhoneValid) {
      try {
        // In a real app, you'd collect all user data from previous screens


        
        // Call the signup function from the auth store
        
        // Navigate to the main app
        router.replace('/(tabs)');
      } catch (error) {
        console.error('Signup error:', error);
      }
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.neutral.black} />
          </TouchableOpacity>
          <Text style={styles.title}>Business Information</Text>
        </View>
        
        <Text style={styles.subtitle}>Tell us about your business</Text>
        
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Business Name</Text>
            <View style={styles.inputContainer}>
              <Building2 size={20} color={Colors.neutral.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your business name"
                value={businessName}
                onChangeText={setBusinessName}
                onBlur={() => validateBusinessName(businessName)}
              />
            </View>
            {businessNameError ? <Text style={styles.errorText}>{businessNameError}</Text> : null}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Business Address</Text>
            <View style={styles.inputContainer}>
              <MapPin size={20} color={Colors.neutral.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your business address"
                value={address}
                onChangeText={setAddress}
                onBlur={() => validateAddress(address)}
              />
            </View>
            {addressError ? <Text style={styles.errorText}>{addressError}</Text> : null}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <Phone size={20} color={Colors.neutral.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                onBlur={() => validatePhone(phone)}
              />
            </View>
            {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.neutral.white} />
          ) : (
            <Text style={styles.submitButtonText}>Complete Registration</Text>
          )}
        </TouchableOpacity>
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
    flexGrow: 1,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.neutral.black,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.neutral.gray,
    marginBottom: 32,
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral.darkGray,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral.extraLightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: Colors.neutral.black,
  },
  errorText: {
    color: Colors.status.error,
    fontSize: 14,
    marginTop: 8,
    marginLeft: 4,
  },
  submitButton: {
    backgroundColor: Colors.primary.burgundy,
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: '600',
  },
});