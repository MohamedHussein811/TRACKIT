import AppBar from "@/components/AppBar";
import Colors from "@/constants/colors";
import { useAuthStore } from "@/store/auth-store";
import { Product } from "@/types";
import api from "@/utils/apiClient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  DollarSign,
  Edit,
  ExternalLink,
  Package,
  ShoppingCart,
  Trash2,
  Truck,
  X,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Define an extended type for Product that includes populated ownerId
interface PopulatedProduct extends Omit<Product, 'ownerId'> {
  ownerId: string | {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
  };
}

interface ShippingInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

interface PaymentInfo {
  cardholderName: string;
  cardNumber: string;
  cardType: string;
  paymentMethod: string;
}

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<PopulatedProduct>();
  const { user, hasPermission } = useAuthStore();
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    name: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
  });
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardholderName: '',
    cardNumber: '',
    cardType: '',
    paymentMethod: 'credit_card',
  });
  const [activeTab, setActiveTab] = useState<'shipping' | 'payment'>('shipping');

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      const res = await api.get(`/products/${id}`);
      if (res.status === 200) {
        console.log(`product is ${res.data.toString()}`);
        setProduct(res.data);
        console.log("Products fetched successfully:", res.data);
      } else {
        Alert.alert("Error", "Failed to fetch products");
      }
      setIsLoading(false);
    };

    fetchProducts();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: "Loading...",
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <ArrowLeft size={24} color={Colors.neutral.black} />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: "Product Not Found",
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <ArrowLeft size={24} color={Colors.neutral.black} />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.notFoundContainer}>
          <Package size={64} color={Colors.neutral.lightGray} />
          <Text style={styles.notFoundText}>Product not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isLowStock = product.quantity <= product.minStockLevel;
  const isOutOfStock = product.quantity === 0;

  const handleEditProduct = () => {
    if (!hasPermission("edit_product")) {
      Alert.alert(
        "Permission Denied",
        "You do not have permission to edit products"
      );
      return;
    }

    // Navigate to edit product screen
    router.push({
      pathname: "/add-product",
      params: { id: product._id, mode: "edit" },
    });
  };

  const handleDeleteProduct = () => {
    if (!hasPermission("delete_product")) {
      Alert.alert(
        "Permission Denied",
        "You do not have permission to delete products"
      );
      return;
    }

    Alert.alert(
      "Delete Product",
      `Are you sure you want to delete ${product.name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // In a real app, this would call an API to delete the product
            Alert.alert("Success", "Product deleted successfully", [
              {
                text: "OK",
                onPress: () => router.back(),
              },
            ]);
          },
        },
      ]
    );
  };

  const handleOrderProduct = () => {
    if (isOutOfStock) {
      Alert.alert("Out of Stock", "This product is currently out of stock");
      return;
    }

    setShowOrderModal(true);
  };

  const handleSubmitOrder = async () => {
    if (activeTab === 'shipping') {
      setActiveTab('payment');
      return;
    }

    // Validate payment info
    if (!paymentInfo.cardholderName || !paymentInfo.cardNumber || !paymentInfo.cardType) {
      Alert.alert("Error", "Please fill in all payment information");
      return;
    }

    setIsLoading(true);
    try {
      const orderData = {
        ownerId: typeof product.ownerId === 'object' ? product.ownerId._id : product.ownerId,
        items: [
          {
            productId: product._id,
            quantity,
            unitPrice: product.price,
          },
        ],
        totalAmount: (quantity * product.price).toFixed(2),
        status: "pending",
        createdAt: new Date().toISOString(),
        ownerName: user?.name,
        shipping: shippingInfo,
        payment: {
          cardholderName: paymentInfo.cardholderName,
          cardNumber: paymentInfo.cardNumber,
          cardType: paymentInfo.cardType,
          paymentMethod: paymentInfo.paymentMethod,
        }
      };

      const response = await api.post("/order", orderData);
      if (response.status === 201) {
        setShowOrderModal(false);
        Alert.alert("Success", "Order placed successfully", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert(
          "Error",
          "Failed to place order. Please try again."
        );
      }
    } catch (error) {
      console.error("Error creating order:", error);
      Alert.alert("Error", "Failed to place order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleIncreaseQuantity = () => {
    if (quantity < product.quantity) {
      setQuantity(quantity + 1);
    } else {
      Alert.alert(
        "Maximum Quantity",
        `Only ${product.quantity} items available in stock`
      );
    }
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "Product Details",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={Colors.neutral.black} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerActions}>
              {hasPermission("edit_product") && (
                <TouchableOpacity
                  style={styles.headerAction}
                  onPress={handleEditProduct}
                >
                  <Edit size={20} color={Colors.neutral.darkGray} />
                </TouchableOpacity>
              )}
              {hasPermission("delete_product") && (
                <TouchableOpacity
                  style={styles.headerAction}
                  onPress={handleDeleteProduct}
                >
                  <Trash2 size={20} color={Colors.status.error} />
                </TouchableOpacity>
              )}
            </View>
          ),
        }}
      />
      <AppBar title="Product Details" isCanGoBack={true} />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={{ uri: product.image }}
          style={styles.productImage}
          resizeMode="cover"
        />

        <View style={styles.productInfo}>
          <View style={styles.header}>
            <View>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productCategory}>{product.category}</Text>
            </View>
            <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
          </View>

          <View style={styles.stockInfo}>
            <View style={styles.stockStatus}>
              <Package
                size={16}
                color={isLowStock ? Colors.status.warning : Colors.neutral.gray}
              />
              <Text
                style={[
                  styles.stockText,
                  isLowStock ? styles.lowStockText : null,
                  isOutOfStock ? styles.outOfStockText : null,
                ]}
              >
                {isOutOfStock
                  ? "Out of Stock"
                  : isLowStock
                  ? `Low Stock: ${product.quantity} remaining`
                  : `${product.quantity} in stock`}
              </Text>
            </View>

            {isLowStock && !isOutOfStock && (
              <View style={styles.warningBadge}>
                <AlertTriangle size={14} color={Colors.status.warning} />
                <Text style={styles.warningText}>Low Stock</Text>
              </View>
            )}

            {isOutOfStock && (
              <View style={[styles.warningBadge, styles.outOfStockBadge]}>
                <AlertTriangle size={14} color={Colors.status.error} />
                <Text style={[styles.warningText, styles.outOfStockText]}>
                  Out of Stock
                </Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Product Details</Text>
          <Text style={styles.description}>{product.description}</Text>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Package size={20} color={Colors.primary.burgundy} />
              </View>
              <Text style={styles.detailLabel}>SKU</Text>
              <TouchableOpacity 
                style={styles.skuContainer}
                onPress={() => Linking.openURL(product.sku)}
              >
                <Image
                  source={{ uri: product.sku }}
                  style={styles.barcodeImage}
                  resizeMode="contain"
                />
                <View style={styles.skuLinkIndicator}>
                  <ExternalLink size={14} color={Colors.neutral.white} />
                  <Text style={styles.skuLinkText}>Click to open</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <DollarSign size={20} color={Colors.primary.burgundy} />
              </View>
              <Text style={styles.detailLabel}>Cost</Text>
              <Text style={styles.detailValue}>
                ${(product.price || 0).toFixed(2)}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <BarChart3 size={20} color={Colors.primary.burgundy} />
              </View>
              <Text style={styles.detailLabel}>Min Stock</Text>
              <Text style={styles.detailValue}>{product.minStockLevel}</Text>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Truck size={20} color={Colors.primary.burgundy} />
              </View>
              <Text style={styles.detailLabel}>Supplier</Text>
              <Text style={styles.detailValue}>
                {typeof product.ownerId === 'object' 
                  ? (product.ownerId.name || product.ownerId.email || "N/A") 
                  : "N/A"}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {user?.userType === "business" && (
        <View style={styles.footer}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={[
                styles.quantityButton,
                isOutOfStock && styles.disabledButton,
              ]}
              onPress={handleDecreaseQuantity}
              disabled={isOutOfStock}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={[
                styles.quantityButton,
                isOutOfStock && styles.disabledButton,
              ]}
              onPress={handleIncreaseQuantity}
              disabled={isOutOfStock}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.orderButton,
              isOutOfStock && styles.disabledOrderButton,
            ]}
            onPress={handleOrderProduct}
            disabled={isOutOfStock}
          >
            <ShoppingCart
              size={20}
              color={Colors.neutral.white}
              style={styles.orderButtonIcon}
            />
            <Text style={styles.orderButtonText}>Order Now</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Order Modal */}
      <Modal
        visible={showOrderModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowOrderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activeTab === 'shipping' ? 'Shipping Information' : 'Payment Information'}
              </Text>
              <TouchableOpacity onPress={() => setShowOrderModal(false)}>
                <X size={24} color={Colors.neutral.darkGray} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {activeTab === 'shipping' ? (
                <View>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    value={shippingInfo.name}
                    onChangeText={(text) => setShippingInfo({...shippingInfo, name: text})}
                    placeholder="Enter your full name"
                  />

                  <Text style={styles.inputLabel}>Address</Text>
                  <TextInput
                    style={styles.input}
                    value={shippingInfo.address}
                    onChangeText={(text) => setShippingInfo({...shippingInfo, address: text})}
                    placeholder="Enter your address"
                  />

                  <Text style={styles.inputLabel}>City</Text>
                  <TextInput
                    style={styles.input}
                    value={shippingInfo.city}
                    onChangeText={(text) => setShippingInfo({...shippingInfo, city: text})}
                    placeholder="Enter your city"
                  />

                  <Text style={styles.inputLabel}>State/Province</Text>
                  <TextInput
                    style={styles.input}
                    value={shippingInfo.state}
                    onChangeText={(text) => setShippingInfo({...shippingInfo, state: text})}
                    placeholder="Enter your state/province"
                  />

                  <Text style={styles.inputLabel}>Postal Code</Text>
                  <TextInput
                    style={styles.input}
                    value={shippingInfo.postalCode}
                    onChangeText={(text) => setShippingInfo({...shippingInfo, postalCode: text})}
                    placeholder="Enter your postal code"
                    keyboardType="numeric"
                  />

                  <Text style={styles.inputLabel}>Country</Text>
                  <TextInput
                    style={styles.input}
                    value={shippingInfo.country}
                    onChangeText={(text) => setShippingInfo({...shippingInfo, country: text})}
                    placeholder="Enter your country"
                  />

                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    value={shippingInfo.phone}
                    onChangeText={(text) => setShippingInfo({...shippingInfo, phone: text})}
                    placeholder="Enter your phone number"
                    keyboardType="phone-pad"
                  />
                </View>
              ) : (
                <View>
                  <Text style={styles.inputLabel}>Cardholder Name</Text>
                  <TextInput
                    style={styles.input}
                    value={paymentInfo.cardholderName}
                    onChangeText={(text) => setPaymentInfo({...paymentInfo, cardholderName: text})}
                    placeholder="Enter cardholder name"
                  />

                  <Text style={styles.inputLabel}>Card Number</Text>
                  <TextInput
                    style={styles.input}
                    value={paymentInfo.cardNumber}
                    onChangeText={(text) => setPaymentInfo({...paymentInfo, cardNumber: text})}
                    placeholder="Enter card number"
                    keyboardType="numeric"
                    maxLength={16}
                  />

                  <Text style={styles.inputLabel}>Card Type</Text>
                  <TextInput
                    style={styles.input}
                    value={paymentInfo.cardType}
                    onChangeText={(text) => setPaymentInfo({...paymentInfo, cardType: text})}
                    placeholder="Enter card type (Visa, Mastercard, etc.)"
                  />
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              {activeTab === 'payment' && (
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => setActiveTab('shipping')}
                >
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleSubmitOrder}
                disabled={isLoading}
              >
                <Text style={styles.submitButtonText}>
                  {activeTab === 'shipping' ? 'Continue to Payment' : 'Place Order'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  backIconButton: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10,
  },
  productImage: {
    width: "100%",
    height: 300,
  },
  productInfo: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.neutral.black,
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 16,
    color: Colors.neutral.gray,
  },
  iconBackground: {
    backgroundColor: Colors.neutral.white,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary.burgundy,
  },
  stockInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  stockStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  stockText: {
    fontSize: 14,
    color: Colors.neutral.darkGray,
    marginLeft: 8,
  },
  lowStockText: {
    color: Colors.status.warning,
  },
  outOfStockText: {
    color: Colors.status.error,
  },
  warningBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 193, 7, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  outOfStockBadge: {
    backgroundColor: "rgba(255, 0, 0, 0.1)",
  },
  warningText: {
    fontSize: 12,
    color: Colors.status.warning,
    marginLeft: 4,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral.extraLightGray,
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.neutral.black,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.neutral.darkGray,
    lineHeight: 24,
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
  },
  detailItem: {
    width: "50%",
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary.burgundy + "20",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.neutral.gray,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.neutral.black,
  },
  barcodeContainer: {
    backgroundColor: Colors.neutral.extraLightGray,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  skuContainer: {
    backgroundColor: Colors.neutral.extraLightGray,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  barcodeImage: {
    width: '100%',
    height: 80,
  },
  skuLinkIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  skuLinkText: {
    color: Colors.neutral.white,
    fontSize: 12,
    marginLeft: 4,
  },
  barcodeText: {
    fontSize: 16,
    fontFamily: "monospace",
    letterSpacing: 2,
    color: Colors.neutral.black,
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.extraLightGray,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.neutral.extraLightGray,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: Colors.neutral.lightGray,
    opacity: 0.5,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.neutral.darkGray,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.neutral.black,
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: "center",
  },
  orderButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: Colors.primary.burgundy,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    height: 48,
  },
  disabledOrderButton: {
    backgroundColor: Colors.neutral.lightGray,
    opacity: 0.5,
  },
  orderButtonIcon: {
    marginRight: 8,
  },
  orderButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.neutral.white,
  },
  headerActions: {
    flexDirection: "row",
  },
  headerAction: {
    marginLeft: 16,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  notFoundText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.neutral.darkGray,
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: Colors.primary.burgundy,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.neutral.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral.black,
  },
  modalBody: {
    maxHeight: '70%',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral.darkGray,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  submitButton: {
    flex: 1,
    backgroundColor: Colors.primary.burgundy,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
