import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { ArrowLeft, Bell, ShoppingCart, Truck, AlertTriangle, Tag, Calendar, Mail } from 'lucide-react-native';
import AppBar from '@/components/AppBar';

export default function NotificationsScreen() {
  const router = useRouter();
  
  // Initial notification settings
  const [notifications, setNotifications] = useState({
    pushEnabled: true,
    emailEnabled: true,
    orderUpdates: true,
    shipmentUpdates: true,
    inventoryAlerts: true,
    promotions: false,
    events: true,
  });

  const toggleSwitch = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleSave = () => {
    // In a real app, you would save notification preferences
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Notifications',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={Colors.neutral.black} />
            </TouchableOpacity>
          ),
        }} 
      />

      <AppBar title='Notifications' isCanGoBack/>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Channels</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Bell size={20} color={Colors.primary.burgundy} style={styles.settingIcon} />
              <Text style={styles.settingText}>Push Notifications</Text>
            </View>
            <Switch
              trackColor={{ false: Colors.neutral.lightGray, true: Colors.primary.burgundyLight }}
              thumbColor={notifications.pushEnabled ? Colors.primary.burgundy : Colors.neutral.white}
              ios_backgroundColor={Colors.neutral.lightGray}
              onValueChange={() => toggleSwitch('pushEnabled')}
              value={notifications.pushEnabled}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Mail size={20} color={Colors.primary.burgundy} style={styles.settingIcon} />
              <Text style={styles.settingText}>Email Notifications</Text>
            </View>
            <Switch
              trackColor={{ false: Colors.neutral.lightGray, true: Colors.primary.burgundyLight }}
              thumbColor={notifications.emailEnabled ? Colors.primary.burgundy : Colors.neutral.white}
              ios_backgroundColor={Colors.neutral.lightGray}
              onValueChange={() => toggleSwitch('emailEnabled')}
              value={notifications.emailEnabled}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Types</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <ShoppingCart size={20} color={Colors.primary.burgundy} style={styles.settingIcon} />
              <View>
                <Text style={styles.settingText}>Order Updates</Text>
                <Text style={styles.settingDescription}>Notifications about new orders and status changes</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: Colors.neutral.lightGray, true: Colors.primary.burgundyLight }}
              thumbColor={notifications.orderUpdates ? Colors.primary.burgundy : Colors.neutral.white}
              ios_backgroundColor={Colors.neutral.lightGray}
              onValueChange={() => toggleSwitch('orderUpdates')}
              value={notifications.orderUpdates}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Truck size={20} color={Colors.primary.burgundy} style={styles.settingIcon} />
              <View>
                <Text style={styles.settingText}>Shipment Updates</Text>
                <Text style={styles.settingDescription}>Notifications about shipment status changes</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: Colors.neutral.lightGray, true: Colors.primary.burgundyLight }}
              thumbColor={notifications.shipmentUpdates ? Colors.primary.burgundy : Colors.neutral.white}
              ios_backgroundColor={Colors.neutral.lightGray}
              onValueChange={() => toggleSwitch('shipmentUpdates')}
              value={notifications.shipmentUpdates}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <AlertTriangle size={20} color={Colors.primary.burgundy} style={styles.settingIcon} />
              <View>
                <Text style={styles.settingText}>Inventory Alerts</Text>
                <Text style={styles.settingDescription}>Notifications about low stock and inventory issues</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: Colors.neutral.lightGray, true: Colors.primary.burgundyLight }}
              thumbColor={notifications.inventoryAlerts ? Colors.primary.burgundy : Colors.neutral.white}
              ios_backgroundColor={Colors.neutral.lightGray}
              onValueChange={() => toggleSwitch('inventoryAlerts')}
              value={notifications.inventoryAlerts}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Tag size={20} color={Colors.primary.burgundy} style={styles.settingIcon} />
              <View>
                <Text style={styles.settingText}>Promotions & Offers</Text>
                <Text style={styles.settingDescription}>Notifications about special deals and promotions</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: Colors.neutral.lightGray, true: Colors.primary.burgundyLight }}
              thumbColor={notifications.promotions ? Colors.primary.burgundy : Colors.neutral.white}
              ios_backgroundColor={Colors.neutral.lightGray}
              onValueChange={() => toggleSwitch('promotions')}
              value={notifications.promotions}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Calendar size={20} color={Colors.primary.burgundy} style={styles.settingIcon} />
              <View>
                <Text style={styles.settingText}>Events & Reminders</Text>
                <Text style={styles.settingDescription}>Notifications about upcoming events and reminders</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: Colors.neutral.lightGray, true: Colors.primary.burgundyLight }}
              thumbColor={notifications.events ? Colors.primary.burgundy : Colors.neutral.white}
              ios_backgroundColor={Colors.neutral.lightGray}
              onValueChange={() => toggleSwitch('events')}
              value={notifications.events}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Preferences</Text>
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
  },
  section: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral.black,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.extraLightGray,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    color: Colors.neutral.black,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.neutral.gray,
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