import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { Store, Truck, Package, Calendar, ArrowLeft, Check } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

type AccountType = 'business' | 'supplier' | 'organizer';

interface AccountOption {
  type: AccountType;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function AccountTypeScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<AccountType | null>(null);

  // HIGHLIGHT: Merged suppliers and distributors into a single option
  const accountOptions: AccountOption[] = [
    {
      type: 'business',
      title: 'Small Business Owner',
      description: 'Manage inventory, track sales, and connect with suppliers',
      icon: <Store size={24} color={Colors.neutral.white} />,
    },
    {
      type: 'supplier',
      title: 'Supplier / Distributor',
      description: 'Manage products, shipments and logistics between businesses',
      icon: <Truck size={24} color={Colors.neutral.white} />,
    },
    {
      type: 'organizer',
      title: 'Event Organizer',
      description: 'Create and manage events for businesses and suppliers',
      icon: <Calendar size={24} color={Colors.neutral.white} />,
    },
  ];

  const handleBack = () => {
    router.back();
  };

  const handleContinue = async () => {
    if (selectedType) {
      // HIGHLIGHT: Navigate to login-info screen instead of directly signing up
      router.push({
        pathname: '/(auth)/login-info',
        params: { accountType: selectedType }
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={Colors.neutral.black} />
        </TouchableOpacity>
        <Text style={styles.title}>Select Account Type</Text>
        <View style={styles.placeholder} />
      </View>

      <Text style={styles.subtitle}>Choose the type of account that best describes your role</Text>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {accountOptions.map((option) => (
          <TouchableOpacity
            key={option.type}
            style={[
              styles.optionCard,
              selectedType === option.type && styles.selectedCard,
            ]}
            onPress={() => setSelectedType(option.type)}
          >
            <View style={styles.optionContent}>
              <LinearGradient
                colors={[Colors.primary.burgundyLight, Colors.primary.burgundy]}
                style={styles.iconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {option.icon}
              </LinearGradient>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
            </View>
            {selectedType === option.type && (
              <View style={styles.checkContainer}>
                <Check size={20} color={Colors.primary.burgundy} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedType && styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={!selectedType}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.neutral.black,
  },
  placeholder: {
    width: 40,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.neutral.gray,
    marginBottom: 24,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  optionCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.neutral.extraLightGray,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedCard: {
    borderColor: Colors.primary.burgundy,
    borderWidth: 2,
    backgroundColor: Colors.neutral.extraLightGray + '20',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral.black,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.neutral.gray,
  },
  checkContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.neutral.extraLightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  footer: {
    marginTop: 24,
  },
  continueButton: {
    backgroundColor: Colors.primary.burgundy,
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: Colors.neutral.lightGray,
  },
  continueButtonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: '600',
  },
});