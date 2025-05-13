import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import Colors from "@/constants/colors";
import { Camera, X, Calendar, Clock, DollarSign } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import api from "@/utils/apiClient";
import { useAuthStore } from "@/store/auth-store";
import AppBar from "@/components/AppBar";
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

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

const uploadImage = async (uri: string) => {
  const formData = new FormData();
  
  // Check if URI is valid
  if (!uri) {
    Alert.alert("Error", "Image URI is missing.");
    return null;
  }

  const imageUri = uri.startsWith("file://") ? uri : `file://${uri}`;  // Ensure valid file URI format

  // Create a new file object for the image
  const imageFile = {
    uri: imageUri,
    type: "image/jpeg", // You may adjust the MIME type if needed
    name: "event_image.jpg",
  };

  // Append to FormData
  formData.append("file", imageFile);
  formData.append("preset", "neena-bot");


  console.log("Uploading image with FormData:", formData);  // Log the form data for debugging

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
      Alert.alert("Error", "Failed to upload event image");
      return null;
    }

    const imageData = await imageResponse.json();
    console.log("Image uploaded successfully:", imageData);
    return imageData.secure_url;
  } catch (error) {
    console.error("Image upload exception:", error);
    Alert.alert("Error", "An error occurred while uploading the image");
    return null;
  }
};


  const handleSave = async () => {
    if (
      !formData.title ||
      !formData.description.trim() ||
      !formData.date ||
      !formData.time ||
      !formData.location ||
      !formData.category ||
      !formData.price
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    let imageUrl = formData.image;
    if (eventImage) {
      const uploadedImageUrl = await uploadImage(eventImage);
      if (!uploadedImageUrl) return; // Stop if image upload fails
      imageUrl = uploadedImageUrl;
    }

    const eventData = {
      ...formData,
      image: imageUrl,
      organizerId: user?._id,
      organizerName: user?.name,
    };

    try {
      const res = await api.post("/events", eventData);
      if (res.status !== 201) {
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

    const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      setFormData({ ...formData, date: formattedDate });
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const formattedTime = selectedTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      setFormData({ ...formData, time: formattedTime });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "Add Event",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Colors.neutral.extraLightGray },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <X size={56} color={Colors.neutral.black} />
            </TouchableOpacity>
          ),
        }}
      />

      <AppBar title="Add Event" isCanGoBack={true} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageSection}>
          {eventImage ? (
            <Image source={{ uri: eventImage }} style={styles.eventImage} />
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
          <TextInput
            style={styles.input}
            placeholder="Enter event title"
            value={formData.title}
            onChangeText={(text) => handleInputChange("title", text)}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter event description"
            value={formData.description}
            onChangeText={(text) => handleInputChange("description", text)}
            multiline
          />

          <TextInput
            style={styles.input}
            placeholder="Enter event category"
            value={formData.category}
            onChangeText={(text) => handleInputChange("category", text)}
          />

          <TextInput
            style={styles.input}
            placeholder="Enter event price"
            value={formData.price}
            onChangeText={(text) => handleInputChange("price", text)}
            keyboardType="numeric"
          />

          <TouchableOpacity
            style={styles.datePicker}
            onPress={() => setShowDatePicker(true)}
          >
            <Calendar size={20} color={Colors.neutral.gray} />
            <Text style={styles.dateText}>
              {formData.date || "Select Date"}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              mode="date"
              value={new Date()}
              onChange={handleDateChange}
            />
          )}

          <TouchableOpacity
            style={styles.datePicker}
            onPress={() => setShowTimePicker(true)}
          >
            <Clock size={20} color={Colors.neutral.gray} />
            <Text style={styles.dateText}>
              {formData.time || "Select Time"}
            </Text>
          </TouchableOpacity>

          {showTimePicker && (
            <DateTimePicker
              mode="time"
              value={new Date()}
              onChange={handleTimeChange}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Enter event location"
            value={formData.location}
            onChangeText={(text) => handleInputChange("location", text)}
          />
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
    padding: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  imageSection: {
    alignItems: "center",
    marginBottom: 16,
  },
  eventImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: Colors.neutral.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: Colors.neutral.black,
  },
  formSection: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: Colors.neutral.white,
  },
  datePicker: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: Colors.neutral.white,
  },
  dateText: {
    marginLeft: 8,
    color: Colors.neutral.gray,
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.neutral.white,
  },

  saveButton: {
    backgroundColor: Colors.primary.burgundy,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
