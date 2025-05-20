import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCart } from '@/contexts/CartContext';

export default function ConfirmationScreen() {
  const router = useRouter();
   const { cartItems, total, deliveryOption } = useCart();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image 
          source={require('@/assets/images/logo.png')} 
          style={styles.image}
        />
        <Text style={styles.title}>Pedido Confirmado!</Text>
        <Text style={styles.message}>
          Seu pedido foi recebido e o agricultor já foi notificado. Você receberá 
          atualizações sobre o status do seu pedido.
        </Text>
        
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="cart" size={20} color="#2E7D32" />
            <Text style={styles.detailText}>
              Itens no pedido: {cartItems.length}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="currency-usd" size={20} color="#2E7D32" />
            <Text style={styles.detailText}>
              Total: R$ {total.toFixed(2)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="map-marker" size={20} color="#2E7D32" />
            <Text style={styles.detailText}>
              {deliveryOption === 'pickup' 
                ? 'Retirada na propriedade' 
                : 'Entrega no endereço cadastrado'}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: '#FFA000', marginBottom: 46 }]}
        onPress={() => router.push('/(consumer)/dashboard-consumer')}
      >
        <Text>Voltar para a Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    padding: 24,
    justifyContent: 'space-between',
  },
  content: {
    alignItems: 'center',
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#263238',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  details: {
    width: '100%',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 16,
    color: '#263238',
  },
  button: {
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});