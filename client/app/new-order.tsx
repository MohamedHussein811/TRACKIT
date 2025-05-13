import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
} from "react-native";
import Colors from "@/constants/colors";
import api from "@/utils/apiClient";
import { useAuthStore } from "@/store/auth-store";
import { router } from "expo-router";

export default function NewOrderScreen() {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const { user } = useAuthStore();
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const totalAmount = selectedProducts.reduce(
    (sum, product) => sum + product.price,
    0
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [supplierRes, productRes] = await Promise.all([
          api.get("/suppliers"),
          api.get("/products"),
        ]);
        const fetchedSuppliers = supplierRes.data;
        const fetchedProducts = productRes.data;

        setSuppliers(fetchedSuppliers);
        setProducts(fetchedProducts);
        console.log(`fetchedSuppliers: ${JSON.stringify(fetchedSuppliers)}`);
        console.log(`fetchedProducts: ${JSON.stringify(fetchedProducts)}`);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const selectSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setModalVisible(false);
    setSelectedProducts([]); // reset selection when switching supplier
  };

  const toggleProductSelection = (product) => {
    const isSelected = selectedProducts.some((p) => p._id === product._id);
    if (isSelected) {
      setSelectedProducts((prev) => prev.filter((p) => p._id !== product._id));
    } else {
      setSelectedProducts((prev) => [...prev, product]);
    }
  };

  const filteredProducts = selectedSupplier
    ? products.filter(
        (product) =>
          product.ownerId === selectedSupplier._id && product.quantity >= 1
      )
    : [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Supplier</Text>

      <TouchableOpacity style={styles.button} onPress={toggleModal}>
        <Text style={styles.buttonText}>
          {selectedSupplier ? selectedSupplier.name : "Select Supplier"}
        </Text>
      </TouchableOpacity>

      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={toggleModal}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select a Supplier</Text>
            <FlatList
              data={suppliers}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => {
                const supplierProducts = products.filter(
                  (product) => product.ownerId === item._id
                );
                return (
                  <View style={styles.modalItem}>
                    <TouchableOpacity onPress={() => selectSupplier(item)}>
                      <Text style={styles.modalItemText}>{item.name}</Text>
                    </TouchableOpacity>

                    {supplierProducts.length > 0 ? (
                      supplierProducts.map((product) => (
                        <Text key={product._id} style={styles.modalProductName}>
                          - {product.name}
                        </Text>
                      ))
                    ) : (
                      <Text style={styles.productName}>No products</Text>
                    )}
                  </View>
                );
              }}
            />
            <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          const isSelected = selectedProducts.some((p) => p._id === item._id);
          return (
            <TouchableOpacity onPress={() => toggleProductSelection(item)}>
              <View
                style={[
                  styles.productCard,
                  isSelected && styles.productCardSelected,
                ]}
              >
                <Image
                  source={{ uri: item.image }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productPrice}>${item.price}</Text>
                  <Text style={styles.productSku}>SKU: {item.sku}</Text>
                  <Text style={styles.productQty}>Qty: {item.quantity}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          selectedSupplier && (
            <Text style={styles.emptyText}>No products available</Text>
          )
        }
      />

      {selectedProducts.length > 0 && (
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmitProduct}
        >
          <Text style={styles.submitButtonText}>Buy</Text>
        </TouchableOpacity>
      )}
      {selectedProducts.length > 0 && (
        <View style={styles.totalPriceContainer}>
          <Text style={styles.totalPriceText}>
            Total Price: $
            {selectedProducts.reduce((acc, p) => acc + p.price, 0).toFixed(2)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.secondary,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: 300,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  modalItemText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  modalProductName: {
    fontSize: 14,
    marginLeft: 10,
    marginTop: 3,
    color: "#333",
  },
  productCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginVertical: 8,
    padding: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productCardSelected: {
    backgroundColor: "#d4edda",
    borderColor: "#28a745",
    borderWidth: 1,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
    justifyContent: "center",
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: "#2a9d8f",
  },
  productSku: {
    fontSize: 12,
    color: "#666",
  },
  productQty: {
    fontSize: 12,
    color: "#666",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#777",
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
  submitButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#28a745",
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  totalPriceContainer: {
    position: "absolute",
    bottom: 80,
    left: 20,
    backgroundColor: "#6366f1",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  totalPriceText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  cartContainer: {
    position: "absolute",
    bottom: 80,
    left: 20,
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  cartIcon: {
    fontSize: 24,
  },

  cartBadge: {
    position: "absolute",
    bottom: -6,
    right: -6,
    backgroundColor: "#28a745",
    borderRadius: 16, // larger for rounded pill shape
    paddingHorizontal: 10, // more space for wider text like "$99.99"
    paddingVertical: 4,
    minWidth: 40, // prevents collapsing on small values
    alignItems: "center",
  },

  cartBadgeText: {
    color: "#fff",
    fontSize: 14, // larger for visibility
    fontWeight: "bold",
    textAlign: "center",
  },
  cartTotalText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    minWidth: 40, // ensures space for price like "123.45"
    textAlign: "center",
  },
});
