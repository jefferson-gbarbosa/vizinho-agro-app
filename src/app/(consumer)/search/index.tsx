import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import api from '@/services/api';
import { useCart } from '@/contexts/CartContext';

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { cartItems, addItem, updateQuantity, removeItem } = useCart();

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

  const clearRecentSearches = async () => {
    try {
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
      setRecentSearches([]);
    } catch (error) {
      console.error('Erro ao limpar buscas recentes', error);
    }
  };

  const fetchProducts = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const response = await api.get('/products', { params: { search: query } });
      setProducts(response.data);
      saveRecentSearch(query);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      Toast.show({ type: 'error', text1: 'Erro ao buscar produtos', position: 'bottom' });
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
    addItem({
      id: product.id,
      name: product.nome,
      price: product.preco,
      quantity: 1,
      farmer: product.produtorId || '',
    });
    showToast(`${product.nome} adicionado ao carrinho`);
  };

  const removeFromCart = (productId: string) => {
    const item = cartItems.find(item => item.id === productId);
    if (!item) return;

    if (item.quantity > 1) {
      updateQuantity(productId, item.quantity - 1);
    } else {
      removeItem(productId);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const cartItem = cartItems.find(ci => ci.id === item.id);

    return (
      <View style={styles.resultItem}>
        <MaterialCommunityIcons name="food-apple" size={24} color="#8a9b68" />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.nome}</Text>
          <Text style={styles.itemDetails}>R$ {item.preco.toFixed(2)}</Text>
        </View>

        {cartItem ? (
          <View style={styles.quantityControls}>
            <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.quantityButton}>
              <MaterialCommunityIcons name="minus" size={16} color="#4a7c59" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{cartItem.quantity}</Text>
            <TouchableOpacity onPress={() => addToCart(item)} style={styles.quantityButton}>
              <MaterialCommunityIcons name="plus" size={16} color="#4a7c59" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => addToCart(item)} style={styles.addButton}>
            <Text style={styles.addButtonText}>Adicionar</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderRecentSearches = () => (
    <>
      <View style={styles.recentHeader}>
        <Text style={styles.sectionTitle}>Buscas recentes</Text>
        {recentSearches.length > 0 && (
          <TouchableOpacity onPress={clearRecentSearches}>
            <Text style={styles.clearText}>Limpar</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.recentSearches}>
        {recentSearches.map((search, index) => (
          <TouchableOpacity
            key={index}
            style={styles.recentSearchItem}
            onPress={() => {
              setSearchQuery(search);
              fetchProducts(search);
            }}
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close" size={20} color="#8a9b68" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.content}>
        {searchQuery.length === 0 ? (
          renderRecentSearches()
        ) : loading ? (
          <ActivityIndicator size="large" color="#4a7c59" />
        ) : (
          <>
            {products.length > 0 && (
              <Text style={styles.resultCount}>
                {products.length} resultado{products.length > 1 ? 's' : ''} encontrado{products.length > 1 ? 's' : ''}
              </Text>
            )}
            <FlatList
              data={products}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.noResults}>Nenhum produto encontrado para {searchQuery}</Text>
                  <TouchableOpacity onPress={() => fetchProducts(searchQuery)} style={styles.retryButton}>
                    <Text style={styles.retryText}>Tentar novamente</Text>
                  </TouchableOpacity>
                </View>
              }
              contentContainerStyle={styles.listContent}
            />
          </>
        )}
      </View>

      {cartItems.length > 0 && (
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => router.push('/(consumer)/shop/cart')}
        >
          <MaterialCommunityIcons name="cart" size={24} color="#fff" />
          <Text style={styles.cartButtonText}>
            Ver Carrinho ({cartItems.reduce((acc, curr) => acc + curr.quantity, 0)})
          </Text>
        </TouchableOpacity>
      )}
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingTop: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  backButton: { marginRight: 16 },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4f0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#333' },
  content: { flex: 1, padding: 16 },
  listContent: { paddingBottom: 80 },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#666' },
  clearText: { color: '#4a7c59', fontSize: 14, fontWeight: '500' },
  resultCount: { fontSize: 14, color: '#555', marginBottom: 8 },
  recentSearches: { marginBottom: 24 },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recentSearchText: { marginLeft: 12, fontSize: 16, color: '#333' },
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
  itemInfo: { flex: 1, marginLeft: 16 },
  itemName: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
  itemDetails: { fontSize: 14, color: '#666' },
  addButton: {
    backgroundColor: '#4a7c59',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: { color: '#fff', fontWeight: '500' },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4f0',
    borderRadius: 6,
    padding: 4,
  },
  quantityButton: { padding: 4 },
  quantityText: { marginHorizontal: 8, fontWeight: '500' },
  cartButton: {
    position: 'absolute',
    bottom: 80,
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
  cartButtonText: { color: '#fff', fontWeight: '600', marginLeft: 8, fontSize: 16 },
  noResults: { textAlign: 'center', fontSize: 16, color: '#666' },
  emptyContainer: { alignItems: 'center', marginTop: 32 },
  retryButton: {
    marginTop: 12,
    backgroundColor: '#4a7c59',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryText: { color: '#fff', fontWeight: '600' },
});
