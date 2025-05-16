import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image
} from 'react-native';
import { router } from 'expo-router';

const Home = () => {
  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image 
        source={require('@/assets/images/logo.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
      
      <Text style={styles.titulo}>Bem-vindo ao Vizinho Agro</Text>
      <Text style={styles.subtitulo}>Conectando produtores e consumidores locais</Text>

      {/* Botões principais */}
      <View style={styles.botoesContainer}>
        <TouchableOpacity 
          style={[styles.botao, styles.botaoAgricultor]}
          onPress={() => router.push('/(auth)/login-farmer')}
        >
          <Text style={styles.textoBotao}>Sou Agricultor</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.botao, styles.botaoConsumidor]}
          onPress={() => router.push('/(auth)/login-consumer')}
        >
          <Text style={styles.textoBotao}>Sou Consumidor</Text>
        </TouchableOpacity>
      </View>
      {/* Rodapé */}
      <Text style={styles.rodape}>Distrito de Custódio, Quixadá-CE</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 16,
    color: '#8D6E63',
    marginBottom: 40,
    textAlign: 'center',
  },
  botoesContainer: {
    width: '100%',
    marginBottom: 20,
  },
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 3,
  },
  botaoAgricultor: {
    backgroundColor: '#2E7D32',
  },
  botaoConsumidor: {
    backgroundColor: '#8D6E63',
  },
  textoBotao: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  botaoOffline: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  textoBotaoOffline: {
    color: '#8D6E63',
    fontSize: 16,
    marginLeft: 5,
    textDecorationLine: 'underline',
  },
  rodape: {
    position: 'absolute',
    bottom: 20,
    color: '#8D6E63',
    fontSize: 14,
  },
});

export default Home;