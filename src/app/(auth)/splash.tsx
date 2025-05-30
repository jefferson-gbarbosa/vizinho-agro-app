import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import api from '@/services/api';
import * as Location from 'expo-location';

export default function SplashScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);

  const verifyAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let { status } = await Location.getForegroundPermissionsAsync();

      if (status !== 'granted') {
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        status = newStatus;
      }

      setPermissionStatus(status);

      if (status !== 'granted') {
        Alert.alert(
          "Permissão necessária",
          "O app precisa de permissão de localização para funcionar corretamente.",
          [{ text: "OK", onPress: () => setLoading(false) }]
        );
        return;
      }

      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        Alert.alert(
          "Serviços de localização desativados",
          "Por favor, ative os serviços de localização.",
          [{ text: "OK", onPress: () => setLoading(false) }]
        );
        return;
      }

      const token = await AsyncStorage.getItem('producerToken');
      if (!token) {
        router.replace('/(auth)/home');
        return;
      }

      try {
        const response = await api.get('/me', {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000,
        });

        if (response.status === 200) {
          router.replace('/(farmer)/dashbord-farmer');
          return true;
        }
      } catch (err) {
        console.warn('Token producer inválido ou expirado:', err);
        await AsyncStorage.removeItem('producerToken');
        router.replace('/(auth)/login-farmer');
        return false;
      }
      router.replace('/(auth)/home');

    } catch (err) {
      console.error("Erro na verificação inicial:", err);
      setError("Ocorreu um erro ao iniciar o app");
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]);

  const handleRetry = () => {
    setError(null);
    verifyAuth();
  };

   useEffect(() => {
    const timeout = setTimeout(() => {
      if (!loading && !error && permissionStatus === 'granted') {
        router.replace('/(auth)/home');
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [loading, error, permissionStatus, router]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.text}>Carregando...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={[styles.text, styles.error]}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Redirecionando...</Text>
      <ActivityIndicator size="small" color="#2E7D32" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    marginTop: 12,
    color: '#8D6E63',
    fontSize: 16,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    marginBottom: 20,
  },
  retryButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#2E7D32',
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
