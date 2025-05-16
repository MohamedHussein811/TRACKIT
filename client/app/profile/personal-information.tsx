import AppBar from '@/components/AppBar';
import DefaultAvatar from '@/components/DefaultAvatar';
import Colors from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import api from '@/utils/apiClient';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Building, Camera, Mail as MailIcon, User, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PersonalInformationScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(user?.avatar || null);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    businessName: user?.businessName || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    const formData = new FormData();
    
    if (!uri) {
      Alert.alert("Error", "Image URI is missing.");
      return null;
    }

    const imageUri = uri.startsWith("file://") ? uri : `file://${uri}`;

    const imageFile = {
      uri: imageUri,
      type: "image/jpeg",
      name: "profile_image.jpg",
    };

    formData.append("file", imageFile as any);
    formData.append("preset", "neena-bot");

    try {
      const imageResponse = await fetch(
        "https://api-novatech.vercel.app/upload-file",
        {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!imageResponse.ok) {
        const errorData = await imageResponse.json();
        console.error("Image upload error:", errorData);
        Alert.alert("Error", "Failed to upload profile image");
        return null;
      }

      const imageData = await imageResponse.json();
      return imageData.secure_url;
    } catch (error) {
      console.error("Image upload exception:", error);
      Alert.alert("Error", "An error occurred while uploading the image");
      return null;
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let avatarUrl = user?.avatar;

      if (profileImage && profileImage !== user?.avatar) {
        avatarUrl = await uploadImage(profileImage);
        if (!avatarUrl) {
          setIsSaving(false);
          return;
        }
      }

      const response = await api.put("/updateuser", {
        ...formData,
        avatar: avatarUrl,
      });

      if (response.status === 200) {
        updateUser({
          ...user,
          ...formData,
          avatar: avatarUrl,
        });
        Alert.alert("Success", "Profile updated successfully");
        router.back();
      } else {
        Alert.alert("Error", "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      Alert.alert("Error", "An error occurred while updating the profile");
    } finally {
      setIsSaving(false);
    }
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
            {profileImage ? (
              <>
                <Image 
                  source={{ uri: profileImage }} 
                  style={styles.profileImage} 
                />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => setProfileImage(null)}
                >
                  <X size={20} color={Colors.neutral.white} />
                </TouchableOpacity>
              </>
            ) : (
              <DefaultAvatar size={100} />
            )}
            <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
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
        <TouchableOpacity 
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color={Colors.neutral.white} />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
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
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.neutral.extraLightGray,
    justifyContent: 'center',
    alignItems: 'center',
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
  removeImageButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
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
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: '600',
  },
});