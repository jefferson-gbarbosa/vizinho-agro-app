
import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
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
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);
        loadProducers(loc.coords.latitude, loc.coords.longitude);
      } catch (error) {
        alert("Erro ao obter localização.");
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
    if (
      isNaN(lat1) || isNaN(lon1) ||
      isNaN(lat2) || isNaN(lon2)
    ) return NaN;

    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getMarkerIcon = (type: string) => {
    switch (type) {
      case "Frutas":
        return "🍎";
      case "Verduras":
        return "🥬";
      case "Legumes":
        return "🥕";
      case "Flores Comestíveis":
        return "🌸";
      default:
        return "🌱";
    }
  };

  const loadProducers = async (userLat: number, userLng: number) => {
   
    try {
      const res = await api.get<Producer[]>('/location-producers');
      const data: Producer[] = res.data.map((p: any) => ({
          id: String(p.id),
          name: p.nome || "Produtor sem nome",
          latitude: Number(p.latitude),
          longitude: Number(p.longitude),
          type: p.tipo || "Outro",
          price: p.preco ?? 0,
      }));

      setProducers(data);
      setFilteredProducers(data);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao fazer login';
      Alert.alert('Erro', message);
    }
  };

  const applyFilters = useCallback(() => {
    if (!params || !location) return;

    let filtered = [...producers];

    if (params.distance) {
      const maxDistance = Number(params.distance);
      filtered = filtered.filter((p) => {
        const distance = calculateDistance(location.latitude, location.longitude, p.latitude, p.longitude);
        return distance <= maxDistance && !isNaN(distance);
      });
    }

    if (params.type) {
      filtered = filtered.filter((p) => p.type === params.type);
    }

    if (params.price) {
      filtered = filtered.filter((p) => p.price <= Number(params.price));
    }

    filtered.sort((a, b) => {
      const distA = calculateDistance(location.latitude, location.longitude, a.latitude, a.longitude);
      const distB = calculateDistance(location.latitude, location.longitude, b.latitude, b.longitude);
      return distA - distB;
    });

    if (JSON.stringify(filtered) !== JSON.stringify(filteredProducers)) {
      setFilteredProducers(filtered);
    }
  }, [params, location, producers, filteredProducers]);

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
         {filteredProducers.map((producer) => {
          const distance = calculateDistance(location.latitude, location.longitude, producer.latitude, producer.longitude);
          const priceFormatted = producer.price !== undefined ? producer.price.toFixed(2) : 'N/A';
          const distanceFormatted = !isNaN(distance) ? distance.toFixed(1) : '?';
      
          return (
            <Marker
              key={producer.id || `${producer.latitude}-${producer.longitude}`}
              coordinate={{ latitude: producer.latitude, longitude: producer.longitude }}
              title={producer.name}
              description={`${producer.type} • R$ ${priceFormatted} • ${distanceFormatted}km`}
              pinColor="#2E7D32"
            >
              <View style={styles.markerContainer}>
                <Text style={styles.markerIcon}>{getMarkerIcon(producer.type)}</Text>
              </View>
            </Marker>
          );
        })}
      </MapViewCluster>

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
    backgroundColor: "#FAFAFA",
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    color: "#263238",
    fontSize: 16,
    fontFamily: "sans-serif",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    padding: 20,
  },
  errorText: {
    color: "#263238",
    fontSize: 16,
    textAlign: "center",
    fontFamily: "sans-serif",
  },
  filterButton: {
    position: "absolute",
    bottom: 32,
    alignSelf: "center",
    backgroundColor: "#2E7D32",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    elevation: 4,
    shadowColor: "#263238",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  filterButtonText: {
    color: "#FAFAFA",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  markerContainer: {
    backgroundColor: "white",
    padding: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2E7D32",
  },
  markerIcon: {
    fontSize: 24,
  },
  dashboardButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "white",
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});

export default MapViewScreen;
