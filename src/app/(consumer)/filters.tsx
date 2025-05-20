import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import api from "@/services/api";

export default function ConsumerFiltersScreen(){
 
  const [distance, setDistance] = useState<string>("5");
  const [type, setType] = useState<string>("");
  const [price, setPrice] = useState<string>("");

 const [latitude, setLatitude] = useState<number | null>(null);
 const [longitude, setLongitude] = useState<number | null>(null);
 const [loading, setLoading] = useState(false);


  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permissão negada", "Precisamos da sua localização para filtrar.");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
    })();
  }, []);

  const [results, setResults] = useState<any[]>([]);

   const fetchFilteredData = async () => {
    if (latitude === null || longitude === null) {
        Alert.alert("Erro", "Localização não disponível para aplicar o filtro.");
        return;
    }
    try {
      setLoading(true);
      // Monta a URL com query params
      const params: Record<string, string> = {};

      if (distance) params.distance = distance;
      if (type) params.type = type;
      if (price) params.price = price;
      if (latitude !== null) params.latitude = latitude.toString();
      if (longitude !== null) params.longitude = longitude.toString();

      const query = new URLSearchParams(params).toString();
      const response = await api.get(`/filter?${query}`);
     
      setResults(response.data);
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Não foi possível buscar os dados.");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
   fetchFilteredData();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Distância</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={distance}
          style={styles.picker}
          onValueChange={(itemValue) => setDistance(itemValue)}
          dropdownIconColor="#2E7D32"
        >
          <Picker.Item label="5 km" value="5" />
          <Picker.Item label="10 km" value="10" />
          <Picker.Item label="20 km" value="20" />
        </Picker>
      </View>

      <Text style={styles.label}>Tipo de Produto</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Frutas, Verduras"
        placeholderTextColor="#8D6E63"
        value={type}
        onChangeText={setType}
      />

      <Text style={styles.label}>Preço máximo</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o preço máximo"
        placeholderTextColor="#8D6E63"
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
      />
     <TouchableOpacity style={styles.button} onPress={applyFilters} disabled={loading}>
      <Text style={styles.buttonText}>{loading ? "Carregando..." : "Aplicar Filtros"}</Text>
     </TouchableOpacity>

      <View style={{ marginTop: 20 }}>
        {results.length === 0 ? (
          <Text>Nenhum resultado encontrado.</Text>
        ) : (
          results.map((item, index) => (
            <Text key={index} style={{ marginBottom: 5 }}>
              {item.nome} - R$ {item.preco}
            </Text>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    padding: 20, 
    backgroundColor: "#FAFAFA" ,
    marginTop: 50
  },
  label: { 
    marginBottom: 20, 
    fontWeight: "600",
    color: "#263238",
    fontSize: 18,
  },
  input: { 
    borderWidth: 1, 
    borderColor: "#8D6E63", 
    padding: 12, 
    marginBottom: 20, 
    borderRadius: 8,
    color: "#263238",
    backgroundColor: "#FAFAFA"
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#8D6E63",
    borderRadius: 8,
    marginBottom: 20,
    overflow: "hidden"
  },
  picker: { 
    height: 50,
    color: "#263238",
    backgroundColor: "#FAFAFA"
  },
  switchContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 30, 
    justifyContent: "space-between",
    paddingVertical: 10
  },
  button: {
    backgroundColor: "#2E7D32",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10
  },
  buttonText: {
    color: "#FAFAFA",
    fontWeight: "bold",
    fontSize: 16
  }
});
