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
          "Permission Required",
          "The app needs location permission to function properly.",
          [{ text: "OK", onPress: () => setLoading(false) }]
        );
        return;
      }

      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        Alert.alert(
          "Location Services Disabled",
          "Please enable location services",
          [{ text: "OK", onPress: () => setLoading(false) }]
        );
        return;
      }

      const checkToken = async (tokenKey: string, route: string) => {
        const token = await AsyncStorage.getItem(tokenKey);
        if (!token) return false;

        try {
          const response = await api.get('/me', {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000
          });
          
          if (response.status === 200) {
            router.replace('/(consumer)/map');
            return true;
          }
        } catch (err) {
          console.warn(`Token verification failed (${tokenKey}):`, err);
          await AsyncStorage.removeItem(tokenKey);
        }
        return false;
      };

      if (await checkToken('consumerToken', '/(consumer)/map')) return;
      
      if (await checkToken('producerToken', '/(farmer)/dashboard-farmer')) return;

      router.replace('/(auth)/home');

    } catch (err) {
      console.error("Initial verification error:", err);
      setError("An error occurred while starting the app");
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]);

  
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!loading && !error && permissionStatus === 'granted') {
        router.replace('/(auth)/home');
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [loading, error, permissionStatus, router]);

  const handleRetry = () => {
    setError(null);
    verifyAuth();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={[styles.text, styles.error]}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Redirecting...</Text>
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