import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import api from '@/services/api';
type Producer = {
  id: string;
  name: string;
  type: string;
  price: number;
};

const ProductsPage = () => {
  const router = useRouter();
  const [farmers, setFarmers] = useState<Producer[]>([]);

  useEffect(() => {
      const fetchFarmers = async () => {
        try {
         const res = await api.get<Producer[]>('/location-producers');
  
          const data: Producer[] = res.data.map((item: any) => ({
            id: String(item.id),
            name: item.nome || "Produtor sem nome",
           type: item.tipo || '',
            price: item.preco || 0,  
        }));
          
        setFarmers(data);
        } catch (error) {
          console.error('Erro ao buscar produtores:', error);
        } 
      };
  
      fetchFarmers();
    }, []);

 
  return (
    <SafeAreaView style={{flex:1}}>
      <View style={styles.container}>
      <Text style={styles.title}>Todos os Produtos</Text>
      <FlatList
        data={farmers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.productCard}
            onPress={() => router.push(`/(consumer)/products/${item.id}`)}
          >
            <Text style={styles.productName}>{item.type}</Text>
            <Text style={styles.productFarmer}>{item.name}</Text>
            <Text style={styles.productPrice}>R$ {item.price.toFixed(2)}</Text>
          </TouchableOpacity>
        )}
      />
      </View>
    </SafeAreaView>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 50
  },
  productCard: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  productFarmer:{},
  productPrice:{}
  // ... outros estilos
});

export default ProductsPage;