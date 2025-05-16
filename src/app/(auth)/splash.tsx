import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
  const verifyAuth = async () => {
    const consumerToken = await AsyncStorage.getItem('consumerToken');
    const producerToken = await AsyncStorage.getItem('producerToken');

    try {
      if (consumerToken) {
        const res = await axios.get('http://192.168.0.117:3333/me', {
          headers: { Authorization: `Bearer ${consumerToken}` },
        });

        if (res.status === 200) {
          router.replace('/(consumer)/map');
          return;
        }
      }

      if (producerToken) {
        const res = await axios.get('http://192.168.0.117:3333/me', {
          headers: { Authorization: `Bearer ${producerToken}` },
        });

        if (res.status === 200) {
          router.replace('/(farmer)/dashbord-farmer'); // ou sua tela principal do produtor
          return;
        }
      }

      // Nenhum token válido
      router.replace('/(auth)/home');
    } catch (error) {
      // Erro na verificação de token
      console.log(error)
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
