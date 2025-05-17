import React, { useState, useEffect, useRef } from "react";
import { Text, View, StyleSheet, Alert } from "react-native";
import { Camera, CameraView, BarcodeScanningResult } from "expo-camera";
import api from "@/utils/apiClient";
import { useAuthStore } from "@/store/auth-store";
import AppBar from "@/components/AppBar";

const QRcodeScannerScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState(null);
  const { user } = useAuthStore();
  const cooldownTimerRef = useRef(null);

  // Request camera permission
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  // Clean up timer on component unmount
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }
    };
  }, []);

  // Handle QR code scanning
  const handleBarcodeScanned = async (
    scanningResult: BarcodeScanningResult
  ) => {
    const { data } = scanningResult;
    
    // Prevent multiple scans during cooldown or if already processing
    if (scanned || cooldown) {
      return;
    }
    
    // Prevent scanning the same QR code repeatedly
    if (lastScannedCode === data) {
      return;
    }
    
    // Set states to prevent multiple scans
    setScanned(true);
    setCooldown(true);
    setLastScannedCode(data);
    
    try {
      console.log("Scanned URL:", data);
      
      const url = data.split("/").pop(); // Extract the last part of the URL

      const res = await api.post(`/order/unitItem/${url}`, {
        ownerName: user?.name,
      });
      
      if (res.status === 201) {
        console.log("Order created successfully:", res.data);
        Alert.alert("Success", "Order created successfully!", [
          {
            text: "OK",
            onPress: () => {
              setScanned(false); // Allow scanning different codes
            },
          },
        ]);
      } else {
        console.error("Error creating order:", res.data);
        Alert.alert("Error", "Failed to create order. Please try again.", [
          {
            text: "OK",
            onPress: () => {
              setScanned(false);
            },
          },
        ]);
      }
    } catch (error) {
      console.error("Error processing scan:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.", [
        {
          text: "OK",
          onPress: () => {
            setScanned(false);
          },
        },
      ]);
    }
    
    // Set cooldown timer for 5 seconds
    cooldownTimerRef.current = setTimeout(() => {
      setCooldown(false);
      // Only reset lastScannedCode after cooldown to prevent immediate rescanning
    }, 5000);
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
          onBarcodeScanned={cooldown ? undefined : handleBarcodeScanned}
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
              {cooldown 
                ? "Cooldown active (5s)..." 
                : scanned 
                  ? "Processing scan..." 
                  : "Position QR code inside frame"}
            </Text>
            
            {/* Visual cooldown indicator */}
            {cooldown && (
              <View style={styles.cooldownIndicator}>
                <Text style={styles.cooldownText}>
                  Ready to scan in 5 seconds
                </Text>
              </View>
            )}
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
  cooldownIndicator: {
    position: "absolute",
    bottom: 50,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 10,
    borderRadius: 20,
  },
  cooldownText: {
    color: "#FFA500",
    fontWeight: "bold",
  },
});

export default QRcodeScannerScreen;
