import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Product } from '@/types';
import Colors from '@/constants/colors';
import { AlertTriangle } from 'lucide-react-native';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
}

export default function ProductCard({ product, onPress }: ProductCardProps) {
  const isLowStock = product.quantity <= product.minStockLevel;

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => onPress(product)}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: product.image }} 
        style={styles.image} 
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
        <Text style={styles.category}>{product.category}</Text>
        <View style={styles.details}>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          <View style={styles.stockContainer}>
            <Text style={[
              styles.stock, 
              isLowStock ? styles.lowStock : null
            ]}>
              {product.quantity} in stock
            </Text>
            {isLowStock && (
              <AlertTriangle size={16} color={Colors.status.warning} style={styles.alertIcon} />
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    width: 100,
    height: 100,
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral.black,
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: Colors.neutral.gray,
    marginBottom: 8,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.burgundy,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stock: {
    fontSize: 14,
    color: Colors.neutral.gray,
  },
  lowStock: {
    color: Colors.status.warning,
  },
  alertIcon: {
    marginLeft: 4,
  },
});