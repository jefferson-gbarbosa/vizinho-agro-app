import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCart } from '@/contexts/CartContext';
import api from '@/services/api';

type Producer = {
  id: string;
  name: string;
  type: string;
  price: number;
  image: string | null;
};

const ProductDetail = () => {
  const { id } = useLocalSearchParams();
  const [quantity, setQuantity] = useState(1);
  const [isInCart, setIsInCart] = useState(false);
  const [producer, setProducer] = useState<Producer | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    // Resetar estado ao trocar produto
    setIsInCart(false);
    setQuantity(1);

    const fetchProducer = async () => {
      if (!id) return;
      try {
        const res = await api.get(`/products/${id}`);
        const item = res.data;

        const producerData: Producer = {
          id: String(item.id),
          name: item.nome || "Produtor sem nome",
          type: item.tipo || '',
          price: item.preco || 0,
          image: item.foto || null,
        };

        setProducer(producerData);
      } catch (error) {
        console.error('Erro ao buscar produtor:', error);
      }
    };

    fetchProducer();
  }, [id]);

  const handleAddToCart = () => {
    if (!producer) return;

    addItem({
      id: producer.id,
      name: producer.type,
      price: producer.price,
      quantity,
      farmer: producer.name,
    });
    setIsInCart(true);
  };

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  if (!producer) {
    return <Text style={{ padding: 16 }}>Carregando produtor...</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.backButtonContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#2E7D32" />
        </TouchableOpacity>
      </View>
      <Image
        source={producer.image ? { uri: producer.image } : require('@/assets/images/logo.png')}
        style={styles.image}
        resizeMode="contain"
      />
      <View style={styles.content}>
        <Text style={styles.name}>{producer.name}</Text>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>R$ {producer.price.toFixed(2)}</Text>
          <Text style={styles.priceUnit}>/kg</Text>
        </View>

        <View style={styles.farmerContainer}>
          <Text style={styles.farmer}>{producer.type}</Text>
        </View>

        <View style={styles.separator} />

        {isInCart ? (
          <View style={styles.cartControls}>
            <View style={styles.quantityControls}>
              <TouchableOpacity style={styles.quantityButton} onPress={decreaseQuantity}>
                <MaterialCommunityIcons name="minus" size={20} color="#4a7c59" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity style={styles.quantityButton} onPress={increaseQuantity}>
                <MaterialCommunityIcons name="plus" size={20} color="#4a7c59" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.viewCartButton} onPress={() => router.push('/(consumer)/shop/cart')}>
              <Text style={styles.viewCartButtonText}>Ver Carrinho</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddToCart}
            disabled={!producer}
          >
            <Text style={styles.addButtonText}>Adicionar ao Carrinho</Text>
            <Text style={styles.addButtonSubText}>R$ {(producer.price * quantity).toFixed(2)}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  backButtonContainer: {
    marginTop: 30,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  content: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  priceUnit: {
    fontSize: 16,
    color: '#7f8c8d',
    marginLeft: 4,
    marginBottom: 2,
  },
  farmerContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  farmerLabel: {
    fontSize: 16,
    color: '#7f8c8d',
    marginRight: 5,
  },
  farmer: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
  },
  separator: {
    height: 1,
    backgroundColor: '#ecf0f1',
    marginVertical: 15,
  },
  addButton: {
    backgroundColor: '#4a7c59',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  addButtonSubText: {
    color: '#e0e0e0',
    fontSize: 14,
    marginTop: 4,
  },
  cartControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4f0',
    borderRadius: 10,
    padding: 8,
  },
  quantityButton: {
    padding: 8,
  },
  quantityText: {
    marginHorizontal: 12,
    fontWeight: '600',
    fontSize: 16,
  },
  viewCartButton: {
    backgroundColor: '#3a6a4a',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  viewCartButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ProductDetail;
