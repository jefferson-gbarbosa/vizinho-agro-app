import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '@/services/api';

type Product = {
  id: number;
  nome: string;
  tipo?: string;
  preco: number;
  quantidade?: number;
  imagem?: string;
  disponibilidadeTipo?: string;
  disponivelAte?: string;
  producerId: number;
};

const FarmerDetails = () => {
  const { id } = useLocalSearchParams();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar produtor.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <ActivityIndicator size="large" color="#4a7c59" />;
  if (error) return <Text style={{ color: 'red' }}>{error}</Text>;
  if (!product) return <Text>Produto não encontrado</Text>;
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: product.imagem || 'https://via.placeholder.com/120' }}
          style={styles.farmerImage}
        />
        <Text style={styles.farmerName}>{product.nome}</Text>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="map-marker" size={20} color="#4a7c59" />
            <Text style={styles.infoText}>Localização não disponível</Text>
          </View>

          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="star" size={20} color="#FFD700" />
            <Text style={styles.infoText}>N/A</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Informações do Produto</Text>

      <View style={styles.productCard}>
        <View>
          <Text style={styles.productName}>Tipo: {product.tipo || 'Não informado'}</Text>
          <Text style={styles.productName}>Quantidade: {product.quantidade ?? 'Não informada'}</Text>
          <Text style={styles.productPrice}>Preço: R$ {product.preco.toFixed(2)}</Text>
          <Text style={styles.productName}>Disponibilidade: {product.disponibilidadeTipo || 'Não informada'}</Text>
          <Text style={styles.productName}>Disponível até: {product.disponivelAte || 'Não informado'}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 25,
  },
  farmerImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  farmerName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  infoText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#666',
  },
  description: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: 16,
    color: '#333',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4a7c59',
  },
});

export default FarmerDetails;