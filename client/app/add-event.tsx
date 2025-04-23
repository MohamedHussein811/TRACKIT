import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import Colors from "@/constants/colors";
import {
  Camera,
  X,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import api from "@/utils/apiClient";
import { useAuthStore } from "@/store/auth-store";

export default function AddEventScreen() {
  const router = useRouter();
  const [eventImage, setEventImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    category: "",
    price: "",
    image: null as string | null,
  });
  const { user } = useAuthStore();

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
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled) {
      setEventImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    // Validate form data
    if (
      !formData.title ||
      !formData.description ||
      !formData.date ||
      !formData.time ||
      !formData.location
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    // Create a proper FormData object for the image upload
    const imageFormData = new FormData();

    if (eventImage) {
      // Create the file object correctly for React Native
      const fileNameParts = eventImage.split("/");
      const fileName = fileNameParts[fileNameParts.length - 1];

      // Create a file object that matches what the server expects
      const fileObj = {
        uri: eventImage,
        name: fileName,
        type: "image/webp", // You might want to determine this dynamically based on the file
      };

      // Append as a file, not a string
      imageFormData.append("file", fileObj as any);
      imageFormData.append("preset", "neena-bot");
    }

    let imageUrl = null;

    if (eventImage) {
      try {
        const imageResponse = await fetch(
          "https://api-novatech.vercel.app/upload-file",
          {
            method: "POST",
            body: imageFormData,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (!imageResponse.ok) {
          const errorData = await imageResponse.json();
          console.error("Image upload error:", errorData);
          Alert.alert("Error", "Failed to upload Event image");
          return;
        }

        const imageData = await imageResponse.json();
        console.log("Image upload successful:", imageData);
        imageUrl = imageData.secure_url;
      } catch (error) {
        console.error("Image upload exception:", error);
        Alert.alert("Error", "An error occurred while uploading the image");
        return;
      }
    }

    // Now save the Event with the image URL if available
    try {
      const eventData = {
        ...formData,
        image: imageUrl,
        organizerId: user?._id,
        organizerName: user?.name,
      };

      const res = await api.post("/events", eventData);

      if (res.status !== 201) {
        console.error("Event creation error:", res.data);
        Alert.alert("Error", "Failed to add event");
        return;
      }

      Alert.alert("Success", "Event added successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Event creation exception:", error);
      Alert.alert("Error", "An error occurred while saving the Event");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "Add Event",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Colors.neutral.extraLightGray },
          headerTitleStyle: { color: Colors.neutral.black, fontWeight: "600" },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <X size={56} color={Colors.neutral.black} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ padding: 8 }}
          >
            <X size={24} color="black" />
          </TouchableOpacity>
          <Text style={{ marginLeft: 8, color: "black" }}>Back</Text>
        </View>

        <View style={styles.imageSection}>
          {eventImage ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: eventImage }} style={styles.eventImage} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setEventImage(null)}
              >
                <X size={20} color={Colors.neutral.white} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.imagePlaceholder}
              onPress={pickImage}
            >
              <Camera size={32} color={Colors.neutral.black} />
              <Text style={styles.imagePlaceholderText}>
                Add Event Cover Image
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Event Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Event Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter event title"
              value={formData.title}
              onChangeText={(text) => handleInputChange("title", text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter event description"
              value={formData.description}
              onChangeText={(text) => handleInputChange("description", text)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Category</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Workshop, Conference, Networking"
              value={formData.category}
              onChangeText={(text) => handleInputChange("category", text)}
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Date & Time</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date</Text>
            <View style={styles.iconInput}>
              <Calendar
                size={20}
                color={Colors.neutral.gray}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.iconTextInput}
                placeholder="YYYY-MM-DD"
                value={formData.date}
                onChangeText={(text) => handleInputChange("date", text)}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Time</Text>
            <View style={styles.iconInput}>
              <Clock
                size={20}
                color={Colors.neutral.gray}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.iconTextInput}
                placeholder="HH:MM - HH:MM"
                value={formData.time}
                onChangeText={(text) => handleInputChange("time", text)}
              />
            </View>
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Location & Price</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Location</Text>
            <View style={styles.iconInput}>
              <MapPin
                size={20}
                color={Colors.neutral.gray}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.iconTextInput}
                placeholder="Enter event location"
                value={formData.location}
                onChangeText={(text) => handleInputChange("location", text)}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Price ($)</Text>
            <View style={styles.iconInput}>
              <DollarSign
                size={20}
                color={Colors.neutral.gray}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.iconTextInput}
                placeholder="0.00 (leave empty for free event)"
                value={formData.price}
                onChangeText={(text) => handleInputChange("price", text)}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Create Event</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.extraLightGray,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  imageSection: {
    marginBottom: 24,
  },
  imagePlaceholder: {
    width: "100%",
    height: 200,
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.neutral.extraLightGray,
    borderStyle: "dashed",
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.neutral.gray,
  },
  imageContainer: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  eventImage: {
    width: "100%",
    height: "100%",
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  formSection: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
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
    backgroundColor: Colors.neutral.extraLightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.neutral.black,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  iconInput: {
    backgroundColor: Colors.neutral.extraLightGray,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  iconTextInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: Colors.neutral.black,
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.extraLightGray,
  },
  saveButton: {
    backgroundColor: Colors.primary.burgundy,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  saveButtonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
