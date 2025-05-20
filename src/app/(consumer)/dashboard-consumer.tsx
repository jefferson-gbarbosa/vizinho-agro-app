// app/(consumer)/dashboard.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons} from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import api from '@/services/api';

type Producer = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: string;
  price: number;
  image: string | null;
  distance?: string;
  products?: number;
};

const ConsumerDashboard = () => {
  const router = useRouter();
  const [farmers, setFarmers] = useState<Producer[]>([]);
  const [locationText, setLocationText] = useState('');
  const [userName, setUserName] = useState('');

  const [isLoadingFarmers, setIsLoadingFarmers] = useState(true);

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

  useEffect(() => {
    (async () => {
      try {
      const res = await api.get('/consumers');
      const { nome } = res.data[0]
      setUserName(nome)
      } catch (error) {
        console.error('Erro ao buscar consumidor:', error);
      }
    })();
  }, []);
  
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationText('Localização indisponível');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address) {
        const city = address.city || address.subregion;
        const district = address.district || address.name;
        const state = address.region;
        setLocationText(`${district}, ${city}-${state}`);
      }
    })();
  }, []);

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão negada', 'É necessário permitir o acesso à localização.');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const userLat = location.coords.latitude;
        const userLon = location.coords.longitude;
        const res = await api.get<Producer[]>('/location-producers');

        const data: Producer[] = res.data.map((item: any) => {
          const lat = Number(item.latitude);
          const lon = Number(item.longitude);
          const distanceKm = getDistanceInKm(userLat, userLon, lat, lon);

          return {
            id: String(item.id),
            name: item.nome || "Produtor sem nome",
            latitude: lat,
            longitude: lon,
            type: item.tipo || '',
            price: item.preco || 0,
            image: item.foto || null,
            distance: `${distanceKm.toFixed(2)} km`,
            rating: 4.5,
            products: 4, 
          };
        });
        
      setFarmers(data);
      } catch (error) {
        console.error('Erro ao buscar produtores:', error);
      }finally{
        setIsLoadingFarmers(false);
      }
    };

    fetchFarmers();
  }, []);

  const handleLogout = async () => {
  try {
      await AsyncStorage.removeItem('consumerToken');
      router.replace('/');
    } catch (error) {
      Alert.alert('Erro ao sair', 'Não foi possível realizar o logout.');
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bom dia, {userName}</Text>
          <Text style={styles.location}>
            <MaterialCommunityIcons name="map-marker" size={16} color="#4a7c59" />
            {locationText || 'Carregando localização...'}
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <View style={styles.profilePlaceholder}>
              <MaterialCommunityIcons name="logout" size={32} color="#E57373" />
          </View>
        </TouchableOpacity>
      </View>
      {/* Barra de Pesquisa */}
      <TouchableOpacity 
        style={styles.searchBar}
        onPress={() => router.push('/(consumer)/search')}
      >
        <MaterialCommunityIcons name="magnify" size={24} color="#8a9b68" />
        <Text style={styles.searchText}>Buscar produtos ou agricultores...</Text>
      </TouchableOpacity>
      {/* Conteúdo Principal */}
      <ScrollView style={styles.content}>
        {/* Seção: Produtos em Destaque */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Produtos em Destaque</Text>
            <TouchableOpacity onPress={() => router.push('/products')}>
              <Text style={styles.seeAll}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          {isLoadingFarmers ? (
            <View style={{ alignItems: 'center', marginTop: 20 }}>
              <ActivityIndicator size="small" color="#8a9b68" />
              <Text style={{ marginTop: 8, color: '#666' }}>Carregando produtos...</Text>
            </View>
          ):(
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {farmers.map(product => (
                <TouchableOpacity 
                  key={product.id}
                  style={styles.productCard}
                  onPress={() => router.push(`/products/${product.id}`)}
                >
                  <Image source={product.image ? { uri: product.image } : require('@/assets/images/logo.png')} style={styles.productImage} />
                  <Text style={styles.productName} numberOfLines={1}>{product.type}</Text>
                  <Text style={styles.productPrice}>R$ {product.price.toFixed(2)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
        {/* Seção: Agricultores Próximos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Agricultores Próximos</Text>
            <TouchableOpacity onPress={() => router.push('/(consumer)/farmers')}>
              <Text style={styles.seeAll}>Ver todos </Text>
            </TouchableOpacity>
          </View>  
          <View style={styles.farmersContainer}>
            {isLoadingFarmers ? (
                <View style={{ alignItems: 'center', marginTop: 20 }}>
                  <ActivityIndicator size="small" color="#8a9b68" />
                  <Text style={{ marginTop: 8, color: '#666' }}>Carregando produtores...</Text>
                </View>
              ) : (
                farmers.map(farmer => (
                  <TouchableOpacity 
                    key={farmer.id}
                    style={styles.farmerCard}
                    onPress={() => router.push(`/(consumer)/farmers/${farmer.id}`)}
                  >
                    <View style={styles.farmerAvatar}>
                      <MaterialCommunityIcons name="account" size={24} color="#fff" />
                    </View>
                    <View style={styles.farmerInfo}>
                      <Text style={styles.farmerName}>{farmer.name}</Text>
                      <View style={styles.farmerDetails}>
                        <Text style={styles.farmerDistance}>{farmer.distance}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  profilePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    margin: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchText: {
    marginLeft: 10,
    color: '#8a9b68',
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  seeAll: {
    color: '#4a7c59',
    fontSize: 14,
    fontWeight: '500',
  },
  horizontalScroll: {
    paddingVertical: 5,
  },
  productCard: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#eaeaea',
  },
  productName: {
    fontWeight: '600',
    color: '#333',
    fontSize: 15,
    marginBottom: 5,
  },
  productPrice: {
    fontWeight: '700',
    color: '#4a7c59',
    fontSize: 16,
  },
  farmersContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  farmerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
  },
  farmerDistance: {
    color: '#666',
    fontSize: 14,
    marginRight: 15,
  },
});

export default ConsumerDashboard;