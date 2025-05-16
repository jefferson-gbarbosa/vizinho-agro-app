import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useOrderContext } from '@/contexts/OrderContext';
import  { Order }  from '@/contexts/OrderContext'; // Import the Order type

interface OrderCardProps {
  order: Order;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const { markAsDelivered } = useOrderContext();

  const handleDeliveryConfirmation = () => {
    Alert.alert(
      'Confirmar Entrega',
      'Deseja marcar este pedido como entregue?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Confirmar',
          onPress: () => markAsDelivered(order.id),
        },
      ]
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.orderId}>Pedido #{order.id}</Text>
        <Text style={[
          styles.status,
          order.status === 'delivered' ? styles.delivered : styles.preparing
        ]}>
          {order.status === 'delivered' ? 'Entregue' : 'Em preparação'}
        </Text>
      </View>
      
      <Text style={styles.client}>Cliente: {order.clientName}</Text>
      <Text style={styles.date}>Data: {order.date}</Text>
      
      {order.status !== 'delivered' && (
        <TouchableOpacity 
          style={styles.deliverButton}
          onPress={handleDeliveryConfirmation}
        >
          <MaterialCommunityIcons name="truck-delivery" size={20} color="#FFF" />
          <Text style={styles.buttonText}>Marcar como Entregue</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderId: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  status: {
    fontWeight: '500',
  },
  preparing: {
    color: '#FFA000', // Orange for preparing status
  },
  delivered: {
    color: '#2E7D32', // Green for delivered status
  },
  client: {
    marginBottom: 4,
    color: '#555',
  },
  date: {
    color: '#777',
    marginBottom: 12,
  },
  deliverButton: {
    flexDirection: 'row',
    backgroundColor: '#2E7D32',
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFF',
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default OrderCard;