import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Alert } from "react-native";
import { Camera, CameraView, BarcodeScanningResult } from "expo-camera";
import api from "@/utils/apiClient";
import { useAuthStore } from "@/store/auth-store";
import AppBar from "@/components/AppBar";

const QRcodeScannerScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const { user } = useAuthStore();

  // Request camera permission
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  // Handle QR code scanning
  const handleBarcodeScanned = async (
    scanningResult: BarcodeScanningResult
  ) => {
    if (!scanned) {
      setScanned(true);
      const { data, type, bounds, cornerPoints } = scanningResult;

      // Print the URL to console
      console.log("Scanned URL:", data);

      // Optional: Show alert with the scanned URL

      const url = data.split("/").pop(); // Extract the last part of the URL

      const res = await api.post(`/order/unitItem/${url}`,{
        userName: user?.name,
      });
      if (res.status === 201) {
        console.log("Order created successfully:", res.data);
        Alert.alert("Success", "Order created successfully!", [
          {
            text: "OK",
            onPress: () => {
              setScanned(false);
            },
          },
        ]);
      } else {
        console.error("Error creating order:", res.data);
        Alert.alert("Error", "Failed to create order. Please try again.");
      }
    }
  };

  // Render based on permissions
  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>No access to camera</Text>
      </View>
    );
  }

  return (
    <>
    <AppBar title="QR Code Scanner" isCanGoBack={true} />
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        onCameraReady={() => console.log("Camera is ready")}
        onMountError={(error) => {
          console.error("Camera error:", error);
          Alert.alert("Camera Error", "Unable to access the camera");
        }}
      >
        <View style={styles.overlay}>
          {/* Scanning frame overlay */}
          <View style={styles.frame} />
          <Text style={styles.scanText}>
            {scanned ? "Tap to Scan Again" : "Position QR code inside frame"}
          </Text>
        </View>
      </CameraView>
    </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  frame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "white",
    backgroundColor: "transparent",
  },
  scanText: {
    color: "white",
    marginTop: 20,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default QRcodeScannerScreen;
