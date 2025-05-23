import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import api from '@/services/api';

type Producer = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance: string;
  products: number;
};

// Função para calcular distância em km entre dois pontos geográficos
function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const FarmersList = () => {
  const router = useRouter();
  const [farmers, setFarmers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Permissão de localização negada');
          setLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude: userLat, longitude: userLon } = location.coords;

        const res = await api.get('/location-producers');
        const data: Producer[] = res.data.map((item: any) => {
          const distance = getDistanceInKm(
            userLat,
            userLon,
            Number(item.latitude),
            Number(item.longitude)
          );

          return {
            id: String(item.id),
            name: item.nome || "Produtor sem nome",
            distance: `${distance.toFixed(2)} km`,
            products: item.products?.length ?? 0,
            latitude: Number(item.latitude),
            longitude: Number(item.longitude),
          };
        });

        const sorted = data.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
        setFarmers(sorted);
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
      {/* Botão de voltar */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <MaterialCommunityIcons name="arrow-left" size={28} color="#4a7c59" />
      </TouchableOpacity>

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
    marginTop: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    padding: 5,
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
