
import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, FlatList } from "react-native";
import MapView, { Marker } from 'react-native-maps';
import * as Location from "expo-location";
import { useRouter, useLocalSearchParams } from "expo-router";
import MapViewCluster from "react-native-map-clustering";
import { Ionicons } from "@expo/vector-icons";
import api from "@/services/api";

type Producer = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: string;
  price: number;
};

const MapViewScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [producers, setProducers] = useState<Producer[]>([]);
  const [filteredProducers, setFilteredProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permissão negada", "Precisamos da sua permissão para acessar a localização.");
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);
        loadProducers(loc.coords.latitude, loc.coords.longitude);
      } catch (error) {
         Alert.alert("Erro", "Erro ao obter localização.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (params && location && producers.length > 0) {
      applyFilters();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, location, producers]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) return NaN;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * Math.PI / 180) *
              Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

 const getMarkerIcon = (productName: string) => {
  const name = productName.toLowerCase();

  if (name.includes("banana")) return "🍌";
  if (name.includes("maçã") || name.includes("maca")) return "🍎";
  if (name.includes("alface")) return "🥬";
  if (name.includes("milho")) return "🌽";
  if (name.includes("feijão") || name.includes("feijao")) return "🫘";
  if (name.includes("tomate")) return "🍅";
  if (name.includes("leite")) return "🥛";
  if (name.includes("ovo")) return "🥚";

  return "🧑‍🌾";
};
 
  const loadProducers = async (userLat: number, userLng: number) => {
   
    try {
      const res = await api.get<Producer[]>('/location-producers');

      const data: Producer[] = res.data
      .filter(p => p.latitude && p.longitude)
      .map((p: any) => {
        const product = p.products?.[0] || {};
        return {
          id: String(p.id),
          name: p.nome || "Produtor sem nome",
          latitude: Number(p.latitude),
          longitude: Number(p.longitude),
          type: product.nome || "Outro",  
          price: product.preco ?? 0,
        };
      });

      setProducers(data);
      setFilteredProducers(data);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao fazer login';
      Alert.alert('Erro', message);
    }
  };

  const applyFilters = useCallback(() => {
    if (!params || !location) return;

    let filtered = producers;

    if (params.distance) {
      const maxDistance = Number(params.distance);
      filtered = filtered.filter(p =>
        calculateDistance(location.latitude, location.longitude, p.latitude, p.longitude) <= maxDistance
      );
    }

    if (params.type) filtered = filtered.filter(p => p.type === params.type);
    if (params.price) filtered = filtered.filter(p => p.price <= Number(params.price));

    filtered.sort((a, b) =>
      calculateDistance(location.latitude, location.longitude, a.latitude, a.longitude) -
      calculateDistance(location.latitude, location.longitude, b.latitude, b.longitude)
    );

    setFilteredProducers(filtered);
  }, [params, location, producers]);

   const centerMapOnProducer = (producer: Producer) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: producer.latitude,
        longitude: producer.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Buscando produtores próximos...</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Precisamos da sua localização para encontrar produtores próximos
        </Text>
      </View>
    );
  }
     

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.dashboardButton} onPress={() => router.push("/(consumer)/dashboard-consumer")}>
        <Ionicons name="home" size={32} color="#2E7D32" />
      </TouchableOpacity>
       <TouchableOpacity style={styles.centerButton} onPress={() => {
        if (mapRef.current && location) {
          mapRef.current.animateToRegion({
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        }
      }}>
        <Ionicons name="navigate" size={28} color="#2E7D32" />
      </TouchableOpacity>
      <MapViewCluster
        ref={mapRef}
        mapRef={() => mapRef.current} 
        style={styles.map}
        region={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        customMapStyle={mapStyle}
        clusterColor="#2E7D32"
        clusterTextColor="#FFFFFF"
        onRegionChangeComplete={() => {}}
      >
         {filteredProducers.map((p) => { 
          return (
            <Marker
            key={p.id}
            coordinate={{ latitude: p.latitude, longitude: p.longitude }}
            title={p.name}
            description={`${p.type} • R$ ${p.price?.toFixed(2)}`}
            onPress={() => centerMapOnProducer(p)}
          >
            <View style={styles.markerContainer}>
              <Text style={styles.markerIcon}>{getMarkerIcon(p.type)}</Text>
           
            </View>
          </Marker>
          );
        })}
      </MapViewCluster>
      <FlatList
        horizontal
        style={styles.carousel}
        data={filteredProducers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} 
          onPress={() => router.push(`/(consumer)/farmers/${item.id}`)}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardDetails}>{item.type} • R$ {item.price?.toFixed(2)}</Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
      />

      <TouchableOpacity style={styles.filterButton} onPress={() => router.push("/(consumer)/filters")}>
        <Text style={styles.filterButtonText}>Filtrar Produtores</Text>
      </TouchableOpacity>
    </View>
  );
};

const mapStyle = [
  {
    elementType: "geometry",
    stylers: [{ color: "#FAFAFA" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#263238" }],
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8",
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f4f8",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    color: "#2E7D32", 
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "sans-serif",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f4f8",
    padding: 20,
  },
  errorText: {
    color: "#bf360c",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "600",
    fontFamily: "sans-serif",
  },

  centerButton: {
    position: "absolute",
    top: 100,
    right: 20,
    zIndex: 10,
    backgroundColor: "white",
    padding: 12,
    borderRadius: 28,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  dashboardButton: {
    position: "absolute",
    top: 100,
    left: 20,
    backgroundColor: "white",
    padding: 12,
    borderRadius: 28, 
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    zIndex: 10,
  },
  filterButton: {
    position: "absolute",
    bottom: 80,
    alignSelf: "center",
    backgroundColor: "#2E7D32",
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 30,
    elevation: 6,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  filterButtonText: {
    color: "#FAFAFA",
    fontWeight: "700",
    fontSize: 17,
  },
  markerContainer: {
    backgroundColor: "#e0f2f1", 
    padding: 6,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: "#00796b", 
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#00796b",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  markerIcon: {
    fontSize: 26,
  },
  carousel: {
    position: "absolute",
    bottom: 160,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: "white",
    padding: 16,
    marginBottom:20,
    marginHorizontal: 8,
    borderRadius: 20,
    minWidth: 180,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  cardTitle: {
    fontWeight: "700",
    fontSize: 18,
    color: "#2E7D32",
  },
  cardDetails: {
    color: "#555",
    marginTop: 6,
    fontSize: 14,
  },
});


export default MapViewScreen;
