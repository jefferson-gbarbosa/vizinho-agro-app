import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';

type Producer = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance: string;
  products: number;
};


const FarmersList = () => {
  const router = useRouter();
  const [farmers, setFarmers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchFarmers = async () => {
      try {
       const res = await axios.get<Producer[]>('http://192.168.0.117:3333/location-producers');

        const data: Producer[] = res.data.map((item: any) => ({
          id: String(item.id),
          name: item.nome || "Produtor sem nome",
          distance: '2.0 km',
          rating: 4.5, 
          products: 4,
          latitude: Number(item.latitude),
          longitude: Number(item.longitude),
      }));
        
      setFarmers(data);
      } catch (error) {
        console.error('Erro ao buscar produtores:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFarmers();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8a9b68" />
        <Text>Carregando produtores...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agricultores Disponíveis</Text>
      
      <FlatList
        data={farmers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.farmerCard}
            onPress={() => router.push(`/(consumer)/farmers/${item.id}`)}
          >
            <View style={styles.farmerAvatar}>
              <MaterialCommunityIcons name="account" size={24} color="#fff" />
            </View>
            <View style={styles.farmerInfo}>
              <Text style={styles.farmerName}>{item.name}</Text>
              <View style={styles.farmerDetails}>
                <Text style={styles.farmerDistance}>{item.distance}</Text>
                <Text style={styles.productsCount}>{item.products} produtos</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  farmerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  farmerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#8a9b68',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  farmerInfo: {
    flex: 1,
  },
  farmerName: {
    fontWeight: '600',
    color: '#333',
    fontSize: 16,
    marginBottom: 4,
  },
  farmerDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  farmerDistance: {
    color: '#666',
    fontSize: 14,
    marginRight: 15,
  },
  productsCount: {
    color: '#4a7c59',
    fontSize: 14,
    fontWeight: '500',
  },
   loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FarmersList;