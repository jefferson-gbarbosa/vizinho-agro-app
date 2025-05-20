import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import api from '@/services/api';

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<{ [key: string]: { quantity: number; item: any } }>({});
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const RECENT_SEARCHES_KEY = 'recentSearches';

  const showToast = (message: string) => {
    Toast.show({
      type: 'success',
      text1: message,
      position: 'bottom',
      visibilityTime: 1500,
    });
  };

  const saveRecentSearch = async (query: string) => {
    if (!query.trim()) return;

    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      let updated = stored ? JSON.parse(stored) : [];
      updated = [query, ...updated.filter((item: string) => item !== query)].slice(0, 5);

      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      setRecentSearches(updated);
    } catch (error) {
      console.error('Erro ao salvar busca recente', error);
    }
  };

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Erro ao carregar buscas recentes', error);
    }
  };

  const fetchProducts = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const response = await api.get('/products', {
        params: { search: query },
      });
      setProducts(response.data);
      saveRecentSearch(query);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao buscar produtos',
        position: 'bottom',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = () => {
    fetchProducts(searchQuery);
  };

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const addToCart = (product: any) => {
    setCartItems(prev => ({
      ...prev,
      [product.id]: {
        quantity: prev[product.id] ? prev[product.id].quantity + 1 : 1,
        item: product,
      },
    }));
    showToast(`${product.nome} adicionado ao carrinho`);
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => {
      const newCart = { ...prev };
      if (newCart[productId]) {
        if (newCart[productId].quantity > 1) {
          newCart[productId].quantity -= 1;
        } else {
          delete newCart[productId];
        }
      }
      return newCart;
    });
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.resultItem}>
      <MaterialCommunityIcons name="food-apple" size={24} color="#8a9b68" />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.nome}</Text>
        <Text style={styles.itemDetails}>R$ {item.preco.toFixed(2)}</Text>
      </View>

      {cartItems[item.id] ? (
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => removeFromCart(item.id)}
            accessibilityLabel={`Diminuir quantidade de ${item.nome}`}
          >
            <MaterialCommunityIcons name="minus" size={16} color="#4a7c59" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{cartItems[item.id].quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => addToCart(item)}
            accessibilityLabel={`Aumentar quantidade de ${item.nome}`}
          >
            <MaterialCommunityIcons name="plus" size={16} color="#4a7c59" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => addToCart(item)}
          accessibilityLabel={`Adicionar ${item.nome} ao carrinho`}
        >
          <Text style={styles.addButtonText}>Adicionar</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderRecentSearches = () => (
    <>
      <Text style={styles.sectionTitle}>Buscas recentes</Text>
      <View style={styles.recentSearches}>
        {recentSearches.map((search, index) => (
          <TouchableOpacity
            key={index}
            style={styles.recentSearchItem}
            onPress={() => {
              setSearchQuery(search);
              fetchProducts(search);
            }}
            accessibilityLabel={`Buscar por ${search}`}
          >
            <MaterialCommunityIcons name="history" size={20} color="#8a9b68" />
            <Text style={styles.recentSearchText}>{search}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} accessibilityLabel="Voltar para a tela anterior">
          <MaterialCommunityIcons name="arrow-left" size={24} color="#4a7c59" />
        </TouchableOpacity>
        <View style={styles.searchInputContainer}>
          <MaterialCommunityIcons name="magnify" size={24} color="#8a9b68" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar produtos..."
            placeholderTextColor="#8a9b68"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} accessibilityLabel="Limpar campo de busca">
              <MaterialCommunityIcons name="close" size={20} color="#8a9b68" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Conteúdo */}
      <View style={styles.content}>
        {searchQuery.length === 0 ? (
          renderRecentSearches()
        ) : loading ? (
          <ActivityIndicator size="large" color="#4a7c59" />
        ) : (
          <FlatList
            data={products}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={
              <Text style={styles.noResults}>Nenhum produto encontrado para {searchQuery}</Text>
            }
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>

      {/* Carrinho */}
      {Object.keys(cartItems).length > 0 && (
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => router.push('/(consumer)/shop/cart')}
          accessibilityLabel="Ver carrinho"
        >
          <MaterialCommunityIcons name="cart" size={24} color="#fff" />
          <Text style={styles.cartButtonText}>
            Ver Carrinho ({Object.values(cartItems).reduce((acc, curr) => acc + curr.quantity, 0)})
          </Text>
        </TouchableOpacity>
      )}
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  backButton: {
    marginRight: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4f0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  listContent: {
    paddingBottom: 80, // Espaço para o botão do carrinho
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 16,
  },
  recentSearches: {
    marginBottom: 24,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recentSearchText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
  },
  noResults: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
    color: '#666',
  },
  addButton: {
    backgroundColor: '#4a7c59',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4f0',
    borderRadius: 6,
    padding: 4,
  },
  quantityButton: {
    padding: 4,
  },
  quantityText: {
    marginHorizontal: 8,
    fontWeight: '500',
  },
  cartButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4a7c59',
    padding: 16,
    borderRadius: 10,
    elevation: 3,
  },
  cartButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
});