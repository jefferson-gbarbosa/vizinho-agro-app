import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Interface para o tipo do item do carrinho
interface CartItemProps {
  id: string;
  name: string;
  price: number;
  quantity: number;
  farmer: string;
  image?: string;
}

// Props do componente CartItem
interface CartItemComponentProps {
  item: CartItemProps;
  onUpdate: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

const CartItem: React.FC<CartItemComponentProps> = ({ item, onUpdate, onRemove }) => {
  return (
    <View style={styles.container}>
      <Image 
        source={{ uri: item.image || 'https://placehold.co/100x100?text=Produto' }} 
        style={styles.image}
      />
      <View style={styles.details}>
        <Text style={styles.name}>{item.farmer}</Text>
        <Text style={styles.farmer}>{item.name}</Text>
        <Text style={styles.price}>R$ {item.price.toFixed(2)}</Text>
      </View>
      <View style={styles.quantityControl}>
        <TouchableOpacity onPress={() => onUpdate(item.id, item.quantity - 1)}>
          <MaterialCommunityIcons name="minus-circle" size={24} color="#8D6E63" />
        </TouchableOpacity>
        <Text style={styles.quantity}>{item.quantity}</Text>
        <TouchableOpacity onPress={() => onUpdate(item.id, item.quantity + 1)}>
          <MaterialCommunityIcons name="plus-circle" size={24} color="#2E7D32" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => onRemove(item.id)}
      >
        <MaterialCommunityIcons name="trash-can" size={20} color="#D32F2F" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    color: '#263238',
  },
  farmer: {
    fontSize: 12,
    color: '#8D6E63',
  },
  price: {
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 4,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  quantity: {
    marginHorizontal: 8,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
  },
});

export default CartItem;