import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import api from "@/services/api";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function ConsumerFiltersScreen() {
  const [productName, setProductName] = useState<string>("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permissão negada", "Precisamos da sua localização para filtrar.");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
    })();
  }, []);

  const fetchFilteredData = async () => {
    if (!productName.trim()) {
      Alert.alert("Campo obrigatório", "Digite o nome do produto para buscar.");
      return;
    }

    try {
      setLoading(true);
      const params: Record<string, string> = {
        name: productName,
      };

      if (latitude !== null) params.latitude = latitude.toString();
      if (longitude !== null) params.longitude = longitude.toString();

      const query = new URLSearchParams(params).toString();
      const response = await api.get(`/filter-by-name?${query}`);

      setResults(response.data);
      setSearched(true);
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Não foi possível buscar os dados.");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(consumer)/farmers/${item.id}`)}
      style={styles.resultItem}
    >
      <Text style={styles.resultText}>
        {item.nome} - {item.products?.nome || "Produto indisponível"} - R${" "}
        {item.products?.preco?.toFixed(2) || "0,00"}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.backButtonContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#2E7D32" />
        </TouchableOpacity>
      </View>
      <Text style={styles.label}>Nome do Produto</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Banana, Tomate, Leite"
        placeholderTextColor="#8D6E63"
        value={productName}
        onChangeText={setProductName}
        editable={!loading}
        returnKeyType="search"
        onSubmitEditing={fetchFilteredData}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={fetchFilteredData}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? "Carregando..." : "Buscar"}</Text>
      </TouchableOpacity>

      <View style={styles.resultsContainer}>
        {loading && <ActivityIndicator size="large" color="#2E7D32" />}
        {!loading && searched && results.length === 0 && (
          <Text style={styles.noResultsText}>Nenhum resultado encontrado.</Text>
        )}

        {!loading && results.length > 0 && (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FAFAFA",
    marginTop: 50,
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
    backgroundColor: "#FAFAFA",
  },
  button: {
    backgroundColor: "#2E7D32",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#7CB27E",
  },
  buttonText: {
    color: "#FAFAFA",
    fontWeight: "bold",
    fontSize: 16,
  },
  resultsContainer: {
    marginTop: 20,
    flex: 1,
  },
  resultItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#CCC",
  },
  resultText: {
    fontSize: 16,
    color: "#263238",
  },
  noResultsText: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#999",
  },
  backButtonContainer: {
    marginBottom: 20,
  },
  backButton: {
    alignSelf: "flex-start",
    padding: 8,
  },
});
