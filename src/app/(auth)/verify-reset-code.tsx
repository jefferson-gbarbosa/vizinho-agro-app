import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import axios from 'axios';

export default function VerifyResetCode() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleResetPassword = async () => {
    try {
      await axios.post('/reset-password', {
        phone,
        code,
        newPassword,
      });
      Alert.alert('Sucesso', 'Senha redefinida com sucesso');
      router.push('/(auth)/home'); 
    } catch (error) {
      console.log(error)
      Alert.alert('Erro', 'Código inválido ou erro ao redefinir senha.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Digite o código e nova senha</Text>

      <Text style={styles.label}>Código SMS</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 123456"
        keyboardType="numeric"
        value={code}
        onChangeText={setCode}
        placeholderTextColor="#BDBDBD"
      />

      <Text style={styles.label}>Nova senha</Text>
      <TextInput
        style={styles.input}
        placeholder="Nova senha"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        placeholderTextColor="#BDBDBD"
      />

      <TouchableOpacity style={styles.botao} onPress={handleResetPassword}>
        <Text style={styles.textoBotao}>Redefinir senha</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    padding: 20,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#8D6E63',
    marginTop: 20,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFF',
    color: '#424242',
  },
  botao: {
    backgroundColor: '#2E7D32',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  textoBotao: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
