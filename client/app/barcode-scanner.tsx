import AppBar from "@/components/AppBar";
import { useAuthStore } from "@/store/auth-store";
import api from "@/utils/apiClient";
import { BarcodeScanningResult, Camera, CameraView } from "expo-camera";
import React, { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';

const QRcodeScannerScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { user } = useAuthStore();
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

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

  const handleBack = () => {
    router.back();
  };

  // Handle QR code scanning
  const handleBarcodeScanned = async (
    scanningResult: BarcodeScanningResult
  ) => {
    const { data } = scanningResult;
    
    // Prevent multiple scans during cooldown or if already processing
    if (scanned || cooldown || isProcessing) {
      return;
    }
    
    // Prevent scanning the same QR code repeatedly
    if (lastScannedCode === data) {
      return;
    }
    
    // Set states to prevent multiple scans
    setScanned(true);
    setCooldown(true);
    setIsProcessing(true);
    setLastScannedCode(data);
    
    try {
      console.log("Scanned URL:", data);
      
      // Extract the last part of the URL (item ID)
      const url = data.split("/").pop(); 
      
      if (!url) {
        throw new Error("Invalid QR code format");
      }

      const res = await api.post(`/order/unitItem/${url}`, {
        ownerName: user?.name,
      });
      
      if (res.status === 201) {
        console.log("Order created successfully:", res.data);
        
        // Show success message and trigger haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setSuccessMessage("Order created successfully!");
        
        // Navigate back after a brief delay
        setTimeout(() => {
          setSuccessMessage(null);
          setIsProcessing(false);
          router.back();
        }, 1500); // 1.5 second delay before navigating back
      } else {
        console.error("Error creating order:", res.data);
        Alert.alert("Error", "Failed to create order. Please try again.", [
          {
            text: "OK",
            onPress: () => {
              setScanned(false);
              setIsProcessing(false);
            },
          },
        ]);
      }
    } catch (error) {
      console.error("Error processing scan:", error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "An unexpected error occurred. Please try again.";
        
      Alert.alert("Error", errorMessage, [
        {
          text: "OK",
          onPress: () => {
            setScanned(false);
            setIsProcessing(false);
          },
        },
      ]);
    }
    
    // Set cooldown timer for 5 seconds
    cooldownTimerRef.current = setTimeout(() => {
      setCooldown(false);
      setLastScannedCode(null); // Reset the last scanned code to allow rescanning
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
        <Text style={styles.errorText}>
          No access to camera. Please enable camera permissions in your device settings.
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={(cooldown || isProcessing) ? undefined : handleBarcodeScanned}
        onCameraReady={() => console.log("Camera is ready")}
        onMountError={(error) => {
          console.error("Camera error:", error);
          Alert.alert("Camera Error", "Unable to access the camera");
        }}
      >
        <View style={styles.overlay}>
          {/* Back button */}
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          {/* Scanning frame overlay */}
          <View style={styles.frame} />
          <Text style={styles.scanText}>
            {isProcessing 
              ? "Processing scan..." 
              : cooldown 
                ? "Cooldown active (5s)..." 
                : "Position QR code inside frame"}
          </Text>
          
          {/* Visual cooldown indicator */}
          {cooldown && !isProcessing && !successMessage && (
            <View style={styles.cooldownIndicator}>
              <Text style={styles.cooldownText}>
                Ready to scan in 5 seconds
              </Text>
            </View>
          )}
          
          {/* Success message */}
          {successMessage && (
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={50} color="#4CAF50" />
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          )}
        </View>
      </CameraView>
    </View>
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
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
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
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    padding: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 25,
    zIndex: 10,
  },
  backButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  errorText: {
    margin: 20,
    textAlign: "center",
    color: "red",
  },
  successContainer: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  successText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "center"
  }
});

export default QRcodeScannerScreen;
