import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { ArrowLeft, User, Mail as MailIcon, Building, Camera } from 'lucide-react-native';
import AppBar from '@/components/AppBar';

export default function PersonalInformationScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    businessName: user?.businessName || '',
    phone: '555-123-4567', // Mock data
    address: '123 Business St, New York, NY 10001', // Mock data
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSave = () => {
    // In a real app, you would update the user profile here
    // For now, just go back
    router.back();
  };

  const handleChangePhoto = () => {
    // In a real app, you would implement image picking functionality
    alert('Change photo functionality would be implemented here');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Personal Information',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={Colors.neutral.black} />
            </TouchableOpacity>
          ),
        }} 
      />

      <AppBar title='Personal Information' isCanGoBack/>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.photoSection}>
          <View style={styles.photoContainer}>
            <Image 
              source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e' }} 
              style={styles.profileImage} 
            />
            <TouchableOpacity style={styles.cameraButton} onPress={handleChangePhoto}>
              <Camera size={20} color={Colors.neutral.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.changePhotoText}>Change Profile Photo</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputContainer}>
              <User size={20} color={Colors.neutral.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={formData.name}
                onChangeText={(text) => handleInputChange('name', text)}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputContainer}>
              <MailIcon size={20} color={Colors.neutral.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(text) => handleInputChange('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Business Name</Text>
            <View style={styles.inputContainer}>
              <Building size={20} color={Colors.neutral.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your business name"
                value={formData.businessName}
                onChangeText={(text) => handleInputChange('businessName', text)}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <User size={20} color={Colors.neutral.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                value={formData.phone}
                onChangeText={(text) => handleInputChange('phone', text)}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Address</Text>
            <View style={[styles.inputContainer, styles.multilineInput]}>
              <User size={20} color={Colors.neutral.gray} style={[styles.inputIcon, { marginTop: 12 }]} />
              <TextInput
                style={[styles.input, { textAlignVertical: 'top' }]}
                placeholder="Enter your address"
                value={formData.address}
                onChangeText={(text) => handleInputChange('address', text)}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
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
  photoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary.burgundy,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.neutral.white,
  },
  changePhotoText: {
    fontSize: 14,
    color: Colors.primary.burgundy,
    fontWeight: '500',
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.neutral.gray,
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
    backgroundColor: Colors.neutral.white,
  },
  multilineInput: {
    height: 100,
    alignItems: 'flex-start',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: Colors.neutral.black,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.extraLightGray,
  },
  saveButton: {
    backgroundColor: Colors.primary.burgundy,
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: '600',
  },
});