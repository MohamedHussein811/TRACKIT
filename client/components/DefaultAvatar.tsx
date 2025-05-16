import Colors from '@/constants/colors';
import { User } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface DefaultAvatarProps {
  size?: number;
  color?: string;
}

export default function DefaultAvatar({ size = 80, color = Colors.neutral.white }: DefaultAvatarProps) {
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
      <User size={size * 0.5} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary.burgundy,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 