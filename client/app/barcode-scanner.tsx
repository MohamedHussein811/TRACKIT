import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';

export default function BarcodeScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const router = useRouter();

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    const productId = data; // Assuming the barcode data is the product ID
    Alert.alert(
      'Scanned!',
      `Barcode data: ${data}`,
      [
        {
          text: 'View Product',
          onPress: () => {
            router.push(`/product-details?id=${productId}`); // You may need to map barcode to actual product ID
          },
        },
        {
          text: 'Scan Again',
          onPress: () => setScanned(false),
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => router.back(),
        },
      ],
      { cancelable: true }
    );
  };

  if (hasPermission === null) {
    return <Text>Requesting camera permission...</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
