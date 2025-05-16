import { Slot } from 'expo-router';
import React from 'react';
import { CartProvider } from '@/contexts/CartContext';

export default function RootLayout() {  
  return(
      <CartProvider>
         <Slot />
      </CartProvider>
   );
}
