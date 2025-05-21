import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';

export default function ForgotPassword() {
  const [phone, setPhone] = useState('');

  const handleSendCode = async () => {
    try {
      await axios.post('/send-reset-code', { phone });
      Alert.alert('Sucesso', 'Código enviado via SMS');
      router.push({
        pathname: '/verify-reset-code',
        params: { phone },
      });
    } catch (error) {
        console.log(error)
      Alert.alert('Erro', 'Não foi possível enviar o código.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Redefinir senha</Text>
      <Text style={styles.label}>Digite seu número de telefone:</Text>
      <TextInput
        style={styles.input}
        placeholder="+55 DDD número"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        placeholderTextColor="#BDBDBD"
      />
      <TouchableOpacity style={styles.botao} onPress={handleSendCode}>
        <Text style={styles.textoBotao}>Enviar código</Text>
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
