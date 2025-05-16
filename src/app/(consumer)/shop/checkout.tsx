import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCart } from '@/contexts/CartContext';

export default function CheckoutScreen() {
  const router = useRouter();
  const { deliveryOption, deliveryCost, total } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | 'cash'>('pix');

  const confirmOrder = () => {
    Alert.alert(
      'Confirmar Pedido',
      'Deseja finalizar o pedido?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          onPress: () => router.push('/(consumer)/shop/confirmation')
        }
      ]
    );
  };
  const subtotal = total - deliveryCost;
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumo do Pedido</Text>
        <View style={styles.summaryItem}>
          <Text>Itens:</Text>
          <Text>R$ {subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text>Frete:</Text>
          <Text>R$ {deliveryCost.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryItem, styles.totalItem]}>
          <Text style={styles.totalText}>Total:</Text>
          <Text style={styles.totalText}>R$ {total.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Método de Pagamento</Text>
        <TouchableOpacity 
          style={[styles.paymentOption, paymentMethod === 'pix' && styles.selectedOption]}
          onPress={() => setPaymentMethod('pix')}
        >
          <MaterialCommunityIcons name="qrcode" size={24} color="#2E7D32" />
          <Text style={styles.paymentText}>PIX</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.paymentOption, paymentMethod === 'card' && styles.selectedOption]}
          onPress={() => setPaymentMethod('card')}
        >
          <MaterialCommunityIcons name="credit-card" size={24} color="#2E7D32" />
          <Text style={styles.paymentText}>Cartão de Crédito</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.paymentOption, paymentMethod === 'cash' && styles.selectedOption]}
          onPress={() => setPaymentMethod('cash')}
        >
          <MaterialCommunityIcons name="cash" size={24} color="#2E7D32" />
          <Text style={styles.paymentText}>Dinheiro na Entrega</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {deliveryOption === 'pickup' ? 'Retirada' : 'Entrega'}
        </Text>
        <Text>
          {deliveryOption === 'pickup' 
            ? 'Retirada na propriedade do agricultor' 
            : 'Entrega no endereço cadastrado'}
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.confirmButton}
        onPress={confirmOrder}
      >
        <Text style={styles.confirmButtonText}>Confirmar Pedido</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    padding: 16,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#263238',
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalItem: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 8,
    marginTop: 8,
  },
  totalText: {
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  selectedOption: {
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },
  paymentText: {
    flex: 1,
  },
  confirmButton: {
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  confirmButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});