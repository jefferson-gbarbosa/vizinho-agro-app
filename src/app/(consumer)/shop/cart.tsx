import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, SafeAreaView} from 'react-native';
import { useRouter } from 'expo-router';
import CartItem from '@/components/CartItem';
import { useCart } from '@/contexts/CartContext';

export default function CartScreen() {
  const router = useRouter();
   const {
    cartItems,
    updateQuantity,
    removeItem,
    deliveryOption,
    setDeliveryOption,
    deliveryCost,
    setDeliveryCost,
    total
  } = useCart();

  const totalItems = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Carrinho vazio', 'Adicione produtos para continuar');
      return;
    }
    router.push({
      pathname: '/(consumer)/shop/checkout',
      params: { 
        deliveryOption,
        deliveryCost: deliveryCost.toString(),
        total: total.toString()
      }
    });
  };

  return (
    <SafeAreaView style={{flex: 1, marginBlock:40}}>
      <View style={styles.container}>
      <ScrollView style={styles.itemsContainer}>
        {cartItems.length > 0 ? (
          cartItems.map(item => (
            <CartItem
              key={item.id}
              item={item}
              onUpdate={updateQuantity}
              onRemove={removeItem}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>Seu carrinho está vazio</Text>
        )}
      </ScrollView>

      <View style={styles.deliveryOptions}>
        <Text style={styles.sectionTitle}>Opções de Retirada/Entrega</Text>
        <TouchableOpacity 
          style={[styles.optionButton, deliveryOption === 'pickup' && styles.selectedOption]}
          onPress={() => {
            setDeliveryOption('pickup');
            setDeliveryCost(0);
          }}
        >
          <Text>Retirar na propriedade</Text>
          <Text style={styles.optionPrice}>Grátis</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.optionButton, deliveryOption === 'delivery' && styles.selectedOption]}
          onPress={() => {
            setDeliveryOption('delivery');
            setDeliveryCost(5.00); // Valor fixo por enquanto
          }}
        >
          <Text>Entrega</Text>
          <Text style={styles.optionPrice}>R$ 5,00</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text>Subtotal:</Text>
          <Text>R$ {totalItems.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Frete:</Text>
          <Text>R$ {deliveryCost.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalText}>Total:</Text>
          <Text style={styles.totalText}>R$ {total.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.checkoutButton}
        onPress={proceedToCheckout}
      >
        <Text style={styles.checkoutButtonText}>Finalizar Compra</Text>
      </TouchableOpacity>
    </View>
    </SafeAreaView>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    padding: 16,
  },
  itemsContainer: {
    flex: 1,
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#8D6E63',
  },
  deliveryOptions: {
    marginBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#263238',
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedOption: {
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },
  optionPrice: {
    fontWeight: 'bold',
  },
  summary: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 8,
    marginTop: 8,
  },
  totalText: {
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  checkoutButton: {
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});