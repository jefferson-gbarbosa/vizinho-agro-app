import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Image,
  ActivityIndicator, TouchableOpacity, Linking
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import api from '@/services/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Product = {
  id: number;
  nome: string;
  imagem?: string;
  producerId: number;
};

type Producer = {
  id: number;
  nome: string;
  telefone?: string;
  email?: string;
};

const FarmerDetails = () => {
  const { id } = useLocalSearchParams();
  const productId = Array.isArray(id) ? id[0] : id;

  const [product, setProduct] = useState<Product | null>(null);
  const [producer, setProducer] = useState<Producer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/products/${productId}`);
        const productData = response.data;
        setProduct(productData);

        const producerResponse = await api.get(`/producers/${productData.producerId}`);
        setProducer(producerResponse.data);
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar dados do produtor.');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchData();
    }
  }, [productId]);

  const handleCall = () => {
    if (producer?.telefone) Linking.openURL(`tel:${producer.telefone}`);
  };

  const handleMessage = () => {
    if (producer?.telefone) {
      const phone = producer.telefone.replace(/\D/g, '');
      const url = `https://wa.me/${phone}`;
      Linking.openURL(url);
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#2E7D32" />;
  if (error) return <Text style={{ color: 'red' }}>{error}</Text>;
  if (!product || !producer) return <Text>Informações não encontradas</Text>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.backButtonContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#2E7D32" />
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Image
          source={{ uri: product.imagem || 'https://via.placeholder.com/120' }}
          style={styles.farmerImage}
        />
        <Text style={styles.farmerName}>{producer.nome}</Text>
      </View>

      <Text style={styles.sectionTitle}>Contato do Produtor</Text>

      <View style={styles.contactBox}>
        <Text style={styles.contactText}>Telefone: {producer.telefone || 'Não informado'}</Text>

        {producer.telefone && (
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.contactButton} onPress={handleMessage}>
              <Text style={styles.contactButtonText}>Enviar Mensagem</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
              <Text style={styles.contactButtonText}>Ligar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FAFAFA',
    marginTop: 40,
  },
  backButtonContainer: {
    marginBottom: 10,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
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
    backgroundColor: '#8D6E63',
  },
  farmerName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#263238',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#263238',
    marginBottom: 15,
  },
  contactBox: {
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    padding: 15,
  },
  contactText: {
    fontSize: 16,
    color: '#263238',
    marginBottom: 12,
  },
  buttonRow: {
    gap: 10,
  },
  contactButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#FAFAFA',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FarmerDetails;
