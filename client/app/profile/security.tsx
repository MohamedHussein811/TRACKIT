import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { ArrowLeft, Lock, Eye, EyeOff, Fingerprint, ShieldCheck, AlertTriangle } from 'lucide-react-native';

export default function SecurityScreen() {
  const router = useRouter();
  
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    biometricLogin: true,
    loginNotifications: true,
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const toggleSetting = (key: string) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleInputChange = (field: string, value: string) => {
    setPasswordForm({
      ...passwordForm,
      [field]: value,
    });
  };

  const handleChangePassword = () => {
    // In a real app, you would validate and change the password
    if (!passwordForm.currentPassword) {
      alert('Please enter your current password');
      return;
    }
    
    if (!passwordForm.newPassword) {
      alert('Please enter a new password');
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    // Reset form and show success message
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    
    alert('Password changed successfully');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Security',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={Colors.neutral.black} />
            </TouchableOpacity>
          ),
        }} 
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <ShieldCheck size={20} color={Colors.primary.burgundy} style={styles.settingIcon} />
              <View>
                <Text style={styles.settingText}>Two-Factor Authentication</Text>
                <Text style={styles.settingDescription}>Add an extra layer of security to your account</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: Colors.neutral.lightGray, true: Colors.primary.burgundyLight }}
              thumbColor={securitySettings.twoFactorAuth ? Colors.primary.burgundy : Colors.neutral.white}
              ios_backgroundColor={Colors.neutral.lightGray}
              onValueChange={() => toggleSetting('twoFactorAuth')}
              value={securitySettings.twoFactorAuth}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Fingerprint size={20} color={Colors.primary.burgundy} style={styles.settingIcon} />
              <View>
                <Text style={styles.settingText}>Biometric Login</Text>
                <Text style={styles.settingDescription}>Use fingerprint or face recognition to log in</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: Colors.neutral.lightGray, true: Colors.primary.burgundyLight }}
              thumbColor={securitySettings.biometricLogin ? Colors.primary.burgundy : Colors.neutral.white}
              ios_backgroundColor={Colors.neutral.lightGray}
              onValueChange={() => toggleSetting('biometricLogin')}
              value={securitySettings.biometricLogin}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <AlertTriangle size={20} color={Colors.primary.burgundy} style={styles.settingIcon} />
              <View>
                <Text style={styles.settingText}>Login Notifications</Text>
                <Text style={styles.settingDescription}>Get notified of new logins to your account</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: Colors.neutral.lightGray, true: Colors.primary.burgundyLight }}
              thumbColor={securitySettings.loginNotifications ? Colors.primary.burgundy : Colors.neutral.white}
              ios_backgroundColor={Colors.neutral.lightGray}
              onValueChange={() => toggleSetting('loginNotifications')}
              value={securitySettings.loginNotifications}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Change Password</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Current Password</Text>
            <View style={styles.inputContainer}>
              <Lock size={20} color={Colors.neutral.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter current password"
                value={passwordForm.currentPassword}
                onChangeText={(text) => handleInputChange('currentPassword', text)}
                secureTextEntry={!showCurrentPassword}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff size={20} color={Colors.neutral.gray} />
                ) : (
                  <Eye size={20} color={Colors.neutral.gray} />
                )}
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>New Password</Text>
            <View style={styles.inputContainer}>
              <Lock size={20} color={Colors.neutral.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                value={passwordForm.newPassword}
                onChangeText={(text) => handleInputChange('newPassword', text)}
                secureTextEntry={!showNewPassword}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff size={20} color={Colors.neutral.gray} />
                ) : (
                  <Eye size={20} color={Colors.neutral.gray} />
                )}
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <View style={styles.inputContainer}>
              <Lock size={20} color={Colors.neutral.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                value={passwordForm.confirmPassword}
                onChangeText={(text) => handleInputChange('confirmPassword', text)}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color={Colors.neutral.gray} />
                ) : (
                  <Eye size={20} color={Colors.neutral.gray} />
                )}
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.changePasswordButton}
            onPress={handleChangePassword}
          >
            <Text style={styles.changePasswordText}>Change Password</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Information</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Last Login</Text>
            <Text style={styles.infoValue}>Today, 10:30 AM</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Last Password Change</Text>
            <Text style={styles.infoValue}>30 days ago</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Active Sessions</Text>
            <Text style={styles.infoValue}>1 device</Text>
          </View>
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
  },
  section: {
    padding: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.extraLightGray,
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
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: Colors.neutral.black,
  },
  passwordToggle: {
    padding: 8,
  },
  changePasswordButton: {
    backgroundColor: Colors.primary.burgundy,
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  changePasswordText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: '600',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.extraLightGray,
  },
  infoLabel: {
    fontSize: 16,
    color: Colors.neutral.gray,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.neutral.black,
  },
});