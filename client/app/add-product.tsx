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
import { Camera, X, Plus, ChevronDown } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuthStore } from "@/store/auth-store";
import api from "@/utils/apiClient";
import { fetchSuppliers } from "@/mocks/suppliers";
import { User } from "@/types";

export default function AddProductScreen() {
  const router = useRouter();
  const { hasPermission } = useAuthStore();
  const [suppliers, setSuppliers] = useState<User[]>([]);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    category: "",
    price: "",
    quantity: "",
    minStockLevel: "",
    supplierId: "",
    image: null as string | null,
  });
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);

  // HIGHLIGHT: Changed to allow adding custom categories
  const [categories, setCategories] = useState([
    "Beverages",
    "Baking",
    "Kitchen",
    "Confectionery",
    "Cooking",
    "Dining",
  ]);

  // Check if user has permission to add products
  React.useEffect(() => {
    if (!hasPermission("add_product")) {
      Alert.alert(
        "Permission Denied",
        "You do not have permission to add products",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    }
  }, [hasPermission, router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  React.useEffect(() => {
    const fetchSuppliersData = async () => {
      try {
        const suppliers = await fetchSuppliers();
        setSuppliers(suppliers);
        console.log("suppliers", suppliers);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };

    fetchSuppliersData();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setProductImage(result.assets[0].uri);
    }
  };

  // HIGHLIGHT: Added function to add a new category
  const handleAddNewCategory = () => {
    if (newCategory.trim() === "") {
      Alert.alert("Error", "Please enter a category name");
      return;
    }

    if (categories.includes(newCategory.trim())) {
      Alert.alert("Error", "This category already exists");
      return;
    }

    setCategories([...categories, newCategory.trim()]);
    setFormData({
      ...formData,
      category: newCategory.trim(),
    });
    setNewCategory("");
    setShowAddCategory(false);
    setShowCategoryDropdown(false);
  };

  const handleSave = async () => {
    // Validate form data
    if (!formData.name) {
      Alert.alert("Error", "Product name is required");
      return;
    }
  
    if (!formData.price) {
      Alert.alert("Error", "Product price is required");
      return;
    }
  
    // Create a proper FormData object for the image upload
    const imageFormData = new FormData();
    
    if (productImage) {
      // Create the file object correctly for React Native
      const fileNameParts = productImage.split('/');
      const fileName = fileNameParts[fileNameParts.length - 1];
      
      // Create a file object that matches what the server expects
      const fileObj = {
        uri: productImage,
        name: fileName,
        type: 'image/jpeg' // You might want to determine this dynamically based on the file
      };
      
      // Append as a file, not a string
      imageFormData.append('file', fileObj as any);
      imageFormData.append('preset', 'neena-bot');
    }
  
    let imageUrl = null;
    
    if (productImage) {
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
          Alert.alert("Error", "Failed to upload product image");
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
  
    // Now save the product with the image URL if available
    try {
      const productData = {
        ...formData,
        image: imageUrl
      };
      
      console.log("Sending product data:", productData);
      
      const res = await api.post("/products", productData);
      
      if (res.status !== 201) {
        console.error("Product creation error:", res.data);
        Alert.alert("Error", "Failed to add product");
        return;
      }
  
      Alert.alert("Success", "Product added successfully", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error("Product creation exception:", error);
      Alert.alert("Error", "An error occurred while saving the product");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "Add Product",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Colors.neutral.extraLightGray },
          headerTitleStyle: { color: Colors.neutral.black, fontWeight: "600" },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <X size={24} color={Colors.neutral.black} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageSection}>
          {productImage ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: productImage }}
                style={styles.productImage}
              />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setProductImage(null)}
              >
                <X size={20} color={Colors.neutral.white} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.imagePlaceholder}
              onPress={pickImage}
            >
              <Camera size={32} color={Colors.neutral.gray} />
              <Text style={styles.imagePlaceholderText}>Add Product Image</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Product Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Product Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter product name"
              value={formData.name}
              onChangeText={(text) => handleInputChange("name", text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>SKU</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter SKU"
              value={formData.sku}
              onChangeText={(text) => handleInputChange("sku", text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter product description"
              value={formData.description}
              onChangeText={(text) => handleInputChange("description", text)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Category</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              <Text
                style={
                  formData.category
                    ? styles.dropdownText
                    : styles.dropdownPlaceholder
                }
              >
                {formData.category || "Add category"}
              </Text>
              <ChevronDown size={20} color={Colors.neutral.gray} />
            </TouchableOpacity>

            {showCategoryDropdown && (
              <View style={styles.dropdownMenu}>
                {/* HIGHLIGHT: Added option to add a new category */}
                <TouchableOpacity
                  style={[styles.dropdownItem, styles.addCategoryButton]}
                  onPress={() => setShowAddCategory(true)}
                >
                  <Plus size={16} color={Colors.primary.burgundy} />
                  <Text
                    style={[
                      styles.dropdownItemText,
                      { color: Colors.primary.burgundy },
                    ]}
                  >
                    Add New Category
                  </Text>
                </TouchableOpacity>

                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={styles.dropdownItem}
                    onPress={() => {
                      handleInputChange("category", category);
                      setShowCategoryDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{category}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* HIGHLIGHT: Add new category input */}
            {showAddCategory && (
              <View style={styles.addCategoryContainer}>
                <TextInput
                  style={styles.addCategoryInput}
                  placeholder="Enter new category name"
                  value={newCategory}
                  onChangeText={setNewCategory}
                  autoFocus
                />
                <View style={styles.addCategoryActions}>
                  <TouchableOpacity
                    style={[styles.addCategoryAction, styles.cancelButton]}
                    onPress={() => {
                      setShowAddCategory(false);
                      setNewCategory("");
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.addCategoryAction, styles.addButton]}
                    onPress={handleAddNewCategory}
                  >
                    <Text style={styles.addButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Inventory Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Price ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={formData.price}
              onChangeText={(text) => handleInputChange("price", text)}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Quantity</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={formData.quantity}
              onChangeText={(text) => handleInputChange("quantity", text)}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Minimum Stock Level</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={formData.minStockLevel}
              onChangeText={(text) => handleInputChange("minStockLevel", text)}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Supplier Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Supplier</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowSupplierDropdown(!showSupplierDropdown)}
            >
              <Text
                style={
                  formData.supplierId
                    ? styles.dropdownText
                    : styles.dropdownPlaceholder
                }
              >
                {formData.supplierId
                  ? suppliers.find((s) => s._id === formData.supplierId)
                      ?.name || "Select supplier"
                  : "Select supplier"}
              </Text>
              <ChevronDown size={20} color={Colors.neutral.gray} />
            </TouchableOpacity>

            {showSupplierDropdown && (
              <View style={styles.dropdownMenu}>
                {suppliers.map((supplier) => (
                  <TouchableOpacity
                    key={supplier._id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      handleInputChange("supplierId", supplier._id);
                      setShowSupplierDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>
                      {supplier.name || supplier.email}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Product</Text>
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
    alignItems: "center",
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
  productImage: {
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
  dropdownButton: {
    backgroundColor: Colors.neutral.extraLightGray,
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownText: {
    fontSize: 16,
    color: Colors.neutral.black,
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: Colors.neutral.gray,
  },
  dropdownMenu: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: Colors.neutral.extraLightGray,
    ...Platform.select({
      ios: {
        shadowColor: Colors.neutral.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.extraLightGray,
  },
  dropdownItemText: {
    fontSize: 16,
    color: Colors.neutral.black,
  },
  // HIGHLIGHT: Added styles for add category functionality
  addCategoryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary.burgundy + "10",
  },
  addCategoryContainer: {
    marginTop: 8,
    backgroundColor: Colors.neutral.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.neutral.extraLightGray,
    padding: 12,
    ...Platform.select({
      ios: {
        shadowColor: Colors.neutral.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  addCategoryInput: {
    backgroundColor: Colors.neutral.extraLightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.neutral.black,
    marginBottom: 12,
  },
  addCategoryActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  addCategoryAction: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: Colors.neutral.extraLightGray,
  },
  cancelButtonText: {
    color: Colors.neutral.darkGray,
    fontWeight: "500",
  },
  addButton: {
    backgroundColor: Colors.primary.burgundy,
  },
  addButtonText: {
    color: Colors.neutral.white,
    fontWeight: "500",
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
