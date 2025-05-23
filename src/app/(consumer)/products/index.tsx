import api from '@/services/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View, Image, Pressable, TouchableOpacity } from 'react-native';

type ProductWithProducer = {
  id: string;
  productName: string;
  price: number;
  quantity: number;
  type: string;
  photo?: string | null;
  producerName: string;
  producerId: number; // ID real do produtor
};

const ProductsPage = () => {
  const router = useRouter();
  const [products, setProducts] = useState<ProductWithProducer[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/location-producers');

        const fetchedProducts: ProductWithProducer[] = [];

        res.data.forEach((farmer: any) => {
          if (!Array.isArray(farmer.products)) return;

          farmer.products.forEach((product: any, index: number) => {
            fetchedProducts.push({
              id: `${farmer.id}-${index}`, // único na tela
              producerId: farmer.id,
              productName: product.nome || 'Produto sem nome',
              price: Number(product.preco) || 0,
              quantity: Number(product.quantidade) || 0,
              type: product.tipo || '',
              photo: product.foto || null,
              producerName: farmer.nome || 'Produtor sem nome',
            });
          });
        });

        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Erro ao buscar produtores:', error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.backButtonContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={28} color="#2E7D32" />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>Todos os Produtos</Text>
        <FlatList
          data={products}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              style={styles.productCard}
              onPress={() =>
                router.push(`/products/${item.producerId}`)
              }
            >
              {item.photo && (
                <Image source={{ uri: item.photo }} style={styles.image} />
              )}
              <Text style={styles.name}>{item.productName}</Text>

              <View style={styles.priceContainer}>
                <Text style={styles.price}>R$ {item.price.toFixed(2)}</Text>
                <Text style={styles.priceUnit}>/un</Text>
              </View>

              <View style={styles.farmerContainer}>
                <Text style={styles.farmerLabel}>Produtor:</Text>
                <Text style={styles.farmer}>{item.producerName}</Text>
              </View>
            </Pressable>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 26,
    backgroundColor: '#f9f9f9',
    marginTop: 30,
  },
   backButtonContainer: {
    marginBottom: 10,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 22,
    textAlign: 'center',
  },
  productCard: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowRadius: 6,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#eaeaea',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  priceUnit: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 4,
    marginBottom: 2,
  },
  farmerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  farmerLabel: {
    fontSize: 14,
    color: '#95a5a6',
    marginRight: 5,
  },
  farmer: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495e',
  },
});

export default ProductsPage;
