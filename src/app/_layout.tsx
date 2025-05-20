import { Slot } from 'expo-router';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CartProvider } from '@/contexts/CartContext';

export default function RootLayout() {  
  return (
    <SafeAreaProvider>
      <CartProvider>
        <Slot />
      </CartProvider>
    </SafeAreaProvider>
  );
}

