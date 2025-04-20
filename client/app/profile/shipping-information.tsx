import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { ArrowLeft, MapPin, Plus, Edit2, Trash2, Check } from 'lucide-react-native';

// Mock shipping addresses
const mockAddresses = [
  {
    id: '1',
    name: 'Main Warehouse',
    street: '123 Business Street, Suite 101',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'United States',
    isDefault: true,
  },
  {
    id: '2',
    name: 'Secondary Location',
    street: '456 Commerce Avenue',
    city: 'Chicago',
    state: 'IL',
    zip: '60601',
    country: 'United States',
    isDefault: false,
  }
];

export default function ShippingInformationScreen() {
  const router = useRouter();
  const [addresses, setAddresses] = useState(mockAddresses);
  const [editMode, setEditMode] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<any>(null);

  const handleAddAddress = () => {
    setCurrentAddress({
      id: `new-${Date.now()}`,
      name: '',
      street: '',
      city: '',
      state: '',
      zip: '',
      country: '',
      isDefault: addresses.length === 0,
    });
    setEditMode(true);
  };

  const handleEditAddress = (address: any) => {
    setCurrentAddress(address);
    setEditMode(true);
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter(address => address.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setAddresses(addresses.map(address => ({
      ...address,
      isDefault: address.id === id
    })));
  };

  const handleSaveAddress = () => {
    if (!currentAddress.name || !currentAddress.street || !currentAddress.city || 
        !currentAddress.state || !currentAddress.zip || !currentAddress.country) {
      alert('Please fill in all fields');
      return;
    }
    
    if (currentAddress.id.startsWith('new-')) {
      // Add new address
      setAddresses([...addresses, {
        ...currentAddress,
        id: `address-${Date.now()}`
      }]);
    } else {
      // Update existing address
      setAddresses(addresses.map(address => 
        address.id === currentAddress.id ? currentAddress : address
      ));
    }
    
    setEditMode(false);
    setCurrentAddress(null);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setCurrentAddress(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setCurrentAddress({
      ...currentAddress,
      [field]: value
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Shipping Information',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={Colors.neutral.black} />
            </TouchableOpacity>
          ),
        }} 
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {!editMode ? (
          <>
            <View style={styles.header}>
              <Text style={styles.sectionTitle}>Your Shipping Addresses</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={handleAddAddress}
              >
                <Plus size={20} color={Colors.neutral.white} />
              </TouchableOpacity>
            </View>
            
            {addresses.map(address => (
              <View key={address.id} style={styles.addressCard}>
                <View style={styles.addressHeader}>
                  <View style={styles.addressNameContainer}>
                    <Text style={styles.addressName}>{address.name}</Text>
                    {address.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultText}>Default</Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.addressActions}>
                    <TouchableOpacity 
                      style={styles.addressAction}
                      onPress={() => handleEditAddress(address)}
                    >
                      <Edit2 size={16} color={Colors.primary.burgundy} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.addressAction}
                      onPress={() => handleDeleteAddress(address.id)}
                    >
                      <Trash2 size={16} color={Colors.status.error} />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.addressContent}>
                  <MapPin size={20} color={Colors.primary.burgundy} style={styles.addressIcon} />
                  <View style={styles.addressDetails}>
                    <Text style={styles.addressText}>{address.street}</Text>
                    <Text style={styles.addressText}>{address.city}, {address.state} {address.zip}</Text>
                    <Text style={styles.addressText}>{address.country}</Text>
                  </View>
                </View>
                
                {!address.isDefault && (
                  <TouchableOpacity 
                    style={styles.setDefaultButton}
                    onPress={() => handleSetDefault(address.id)}
                  >
                    <Check size={16} color={Colors.primary.burgundy} />
                    <Text style={styles.setDefaultText}>Set as Default</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            
            {addresses.length === 0 && (
              <View style={styles.emptyContainer}>
                <MapPin size={48} color={Colors.neutral.lightGray} />
                <Text style={styles.emptyText}>No addresses found</Text>
                <Text style={styles.emptySubtext}>Add a shipping address to get started</Text>
                <TouchableOpacity 
                  style={styles.addAddressButton}
                  onPress={handleAddAddress}
                >
                  <Text style={styles.addAddressText}>Add Address</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <View style={styles.editForm}>
            <Text style={styles.formTitle}>
              {currentAddress.id.startsWith('new-') ? 'Add New Address' : 'Edit Address'}
            </Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Main Warehouse, Office, etc."
                value={currentAddress.name}
                onChangeText={(text) => handleInputChange('name', text)}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Street Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Street address"
                value={currentAddress.street}
                onChangeText={(text) => handleInputChange('street', text)}
              />
            </View>
            
            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>City</Text>
                <TextInput
                  style={styles.input}
                  placeholder="City"
                  value={currentAddress.city}
                  onChangeText={(text) => handleInputChange('city', text)}
                />
              </View>
              
              <View style={[styles.inputGroup, { width: '30%' }]}>
                <Text style={styles.inputLabel}>State</Text>
                <TextInput
                  style={styles.input}
                  placeholder="State"
                  value={currentAddress.state}
                  onChangeText={(text) => handleInputChange('state', text)}
                />
              </View>
            </View>
            
            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { width: '40%', marginRight: 8 }]}>
                <Text style={styles.inputLabel}>ZIP Code</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ZIP Code"
                  value={currentAddress.zip}
                  onChangeText={(text) => handleInputChange('zip', text)}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Country</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Country"
                  value={currentAddress.country}
                  onChangeText={(text) => handleInputChange('country', text)}
                />
              </View>
            </View>
            
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  currentAddress.isDefault && styles.checkboxChecked
                ]}
                onPress={() => handleInputChange('isDefault', !currentAddress.isDefault)}
              >
                {currentAddress.isDefault && <Check size={16} color={Colors.neutral.white} />}
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>Set as default shipping address</Text>
            </View>
            
            <View style={styles.formButtons}>
              <TouchableOpacity 
                style={[styles.formButton, styles.cancelButton]}
                onPress={handleCancelEdit}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.formButton, styles.saveButton]}
                onPress={handleSaveAddress}
              >
                <Text style={styles.saveButtonText}>Save Address</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral.black,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary.burgundy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressCard: {
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
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral.black,
    marginRight: 8,
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
  addressActions: {
    flexDirection: 'row',
  },
  addressAction: {
    padding: 8,
    marginLeft: 8,
  },
  addressContent: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  addressIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  addressDetails: {
    flex: 1,
  },
  addressText: {
    fontSize: 14,
    color: Colors.neutral.darkGray,
    lineHeight: 20,
  },
  setDefaultButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.extraLightGray,
  },
  setDefaultText: {
    fontSize: 14,
    color: Colors.primary.burgundy,
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral.darkGray,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.neutral.gray,
    textAlign: 'center',
    marginBottom: 24,
  },
  addAddressButton: {
    backgroundColor: Colors.primary.burgundy,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addAddressText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: '500',
  },
  editForm: {
    padding: 16,
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral.black,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.neutral.gray,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.neutral.extraLightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.neutral.black,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.neutral.gray,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary.burgundy,
    borderColor: Colors.primary.burgundy,
  },
  checkboxLabel: {
    fontSize: 14,
    color: Colors.neutral.black,
  },
  formButtons: {
    flexDirection: 'row',
  },
  formButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.neutral.extraLightGray,
    marginRight: 8,
  },
  cancelButtonText: {
    color: Colors.neutral.darkGray,
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: Colors.primary.burgundy,
  },
  saveButtonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: '500',
  },
});