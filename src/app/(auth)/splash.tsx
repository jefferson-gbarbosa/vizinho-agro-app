import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import api from '@/services/api';
import * as Location from 'expo-location';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
  const verifyAuth = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
          Alert.alert(
            "Permissão de localização",
            "Precisamos da sua localização para mostrar produtores próximos."
          );
        return;
      }
      const consumerToken = await AsyncStorage.getItem('consumerToken');
      const producerToken = await AsyncStorage.getItem('producerToken');
      if (consumerToken) {
        const res = await api.get('/me', {
          headers: { Authorization: `Bearer ${consumerToken}` },
        });

        if (res.status === 200) {
          router.replace('/(consumer)/map');
          return;
        }
      }

      if (producerToken) {
        const res = await api.get('/me', {
          headers: { Authorization: `Bearer ${producerToken}` },
        });

        if (res.status === 200) {
          router.replace('/(farmer)/dashbord-farmer'); 
          return;
        }
      }
      router.replace('/(auth)/home');
    } catch (error) {
      console.error('Erro na verificação de autenticação ou localização:', error);
      router.replace('/(auth)/home');
    }
  };

  verifyAuth();
}, [router]);


  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2E7D32" />
      <Text style={styles.text}>Carregando...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { marginTop: 12, color: '#8D6E63', fontSize: 16 },
});
