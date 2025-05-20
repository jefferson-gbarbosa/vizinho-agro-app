// app/consumer/register.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import api from '@/services/api';

export default function ConsumerRegisterScreen(){
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleRegister = async () => {
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }
    try {
      console.log('Dados enviados:', formData);
      const res = await api.post('/consumer',{formData})
      if (res.status === 200) {
        router.push('/(consumer)/map');
			}
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao fazer login';
      Alert.alert('Erro', message);
    }
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cadastro do Consumidor</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Nome Completo</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu nome"
          placeholderTextColor="#8D6E63"
          value={formData.name}
          onChangeText={(text) => setFormData({...formData, name: text})}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Telefone</Text>
        <TextInput
          style={styles.input}
          placeholder="(00) 00000-0000"
          placeholderTextColor="#8D6E63"
          keyboardType="phone-pad"
          value={formData.phone}
          onChangeText={(text) => setFormData({...formData, phone: text})}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Mínimo 6 caracteres"
          placeholderTextColor="#8D6E63"
          secureTextEntry
          value={formData.password}
          onChangeText={(text) => setFormData({...formData, password: text})}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Confirmar Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite novamente sua senha"
          placeholderTextColor="#8D6E63"
          secureTextEntry
          value={formData.confirmPassword}
          onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>

      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Já tem uma conta?</Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/login-consumer')}>
          <Text style={styles.loginLink}>Faça login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#FAFAFA',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#263238',
    marginBottom: 32,
    textAlign: 'center',
    fontFamily: 'sans-serif-medium',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#263238',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#8D6E63',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#263238',
    backgroundColor: '#FAFAFA',
  },
  button: {
    backgroundColor: '#2E7D32',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    elevation: 3,
    shadowColor: '#263238',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#FAFAFA',
    fontSize: 18,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
  },
  loginText: {
    color: '#263238',
    fontSize: 14,
  },
  loginLink: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});