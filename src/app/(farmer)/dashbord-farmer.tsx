import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Modal, TextInput, Alert, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/services/api';

type Producer = {
  id: string;
  nome: string;
};

type Metrics = {
  produtos_cadastrados: number;
  vendas_semanais: number;
  clientes_ativos: number;
  avaliacao_media: number;
};

export default function DashboardAgricultor() {
  const router = useRouter();
  const [, setProducers] = useState<Producer[]>([]);
  const [selectedProducer, setSelectedProducer] = useState<Producer | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [metrics, setMetrics] = useState<Metrics>({
    produtos_cadastrados: 0,
    vendas_semanais: 0,
    clientes_ativos: 0,
    avaliacao_media: 0,
  });

  const [editingKey, setEditingKey] = useState<keyof Metrics | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');

  const metricLabels: Record<keyof Metrics, string> = {
    produtos_cadastrados: 'Produtos Cadastrados',
    vendas_semanais: 'Vendas Semanais',
    clientes_ativos: 'Clientes Ativos',
    avaliacao_media: 'Avaliação Média',
  };

  useEffect(() => {
    const fetchProducers = async () => {
      try {
        const res = await api.get<Producer[]>('/location-producers');
        const data = res.data.map((p: any) => ({
          id: p.id,
          nome: p.nome || "Produtor sem nome",
        }));
        setProducers(data);
        if (data.length > 0) setSelectedProducer(data[0]);
      } catch (error: any) {
        Alert.alert('Erro', error.response?.data?.message || 'Erro ao buscar produtores');
      }
    };

    fetchProducers();
  }, []);

 useEffect(() => {
  if (!selectedProducer?.id) return;

  const fetchMetrics = async () => {
    try {
      const res = await api.get(`/producers/${selectedProducer.id}/metrics`);
      const m = res.data[0];

      if (!m) {
        Alert.alert('Aviso', 'Nenhuma métrica cadastrada ainda para este produtor.');
        setMetrics({
          produtos_cadastrados: 0,
          vendas_semanais: 0,
          clientes_ativos: 0,
          avaliacao_media: 0,
        });
        return;
      }

      setMetrics({
        produtos_cadastrados: m.produtos_cadastrados,
        vendas_semanais: m.vendas_semanais,
        clientes_ativos: m.clientes_ativos,
        avaliacao_media: m.avaliacao_media,
      });
    } catch (error) {
      console.error('Erro ao buscar métricas', error);
      Alert.alert('Erro', 'Não foi possível carregar as métricas.');
    }
  };

  fetchMetrics();
}, [selectedProducer]);

  const openEditModal = (key: keyof Metrics) => {
    setEditingKey(key);
    setEditingValue(metrics[key].toString());
    setModalVisible(true);
  };

  const handleUpdateMetric = async () => {
    if (!selectedProducer || !editingKey) return;

    const updated = {
      ...metrics,
      [editingKey]: parseFloat(editingValue),
    };

    try {
      await api.put(`/producers/${selectedProducer.id}/metrics`, updated);
      setMetrics(updated);
      Alert.alert('Sucesso', 'Métrica atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar métrica', error);
      Alert.alert('Erro', 'Não foi possível atualizar as métricas');
    }

    setModalVisible(false);
    setEditingKey(null);
    setEditingValue('');
  };
  const handleLogout = async () => {
    try{
        await AsyncStorage.removeItem('producerToken');
        router.replace('/');
      } catch (error) {
        Alert.alert('Erro ao sair', 'Não foi possível realizar o logout.');
        console.error('Erro ao fazer logout:', error);
      }
   };
  return (
    <SafeAreaView style={{paddingTop:20}}>
      <ScrollView contentContainerStyle={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Bem-vindo, {selectedProducer?.nome || 'Produtor'}!</Text>
        <TouchableOpacity onPress={() => router.push('/(farmer)/profile')}>
          <MaterialCommunityIcons name="account-circle" size={40} color="#2E7D32" />
        </TouchableOpacity>
      </View>
      {/* Métricas */}
      <View style={styles.metricsContainer}>
        {Object.entries(metrics).map(([key, value]) => (
          <TouchableOpacity key={key} onPress={() => openEditModal(key as keyof Metrics)}>
            <MetricCard
              icon={getMetricIcon(key)}
              value={value}
              label={metricLabels[key as keyof Metrics]}
              isRating={key === 'avaliacao_media'}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Ações Rápidas */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <View style={styles.actionsRow}>
          <ActionButton icon="plus" label="Novo Produto" onPress={() => router.push('/(farmer)/products/new')} />
        </View>
      </View>
      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {editingKey && (
              <>
                <Text style={styles.modalTitle}>
                  Editar {metricLabels[editingKey]}
                </Text>
                <Text style={styles.modalDescription}>
                  Valor atual: {metrics[editingKey]}
                </Text>
              </>
            )}

            <TextInput
              style={styles.input}
              placeholder="Novo valor"
              keyboardType="numeric"
              value={editingValue}
              onChangeText={setEditingValue}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleUpdateMetric}>
                <Text style={styles.modalButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


      {/* Logout */}
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <MaterialCommunityIcons name="logout" size={20} color="#8D6E63" />
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// Ícones para métricas
const getMetricIcon = (key: string) => {
  switch (key) {
    case 'produtos_cadastrados':
      return 'basket';
    case 'vendas_semanais':
      return 'currency-usd';
    case 'clientes_ativos':
      return 'account-group';
    case 'avaliacao_media':
      return 'star';
    default:
      return 'chart-bar';
  }
};

const MetricCard = ({ icon, value, label, isRating = false }: any) => (
  <View style={styles.metricCard}>
    <MaterialCommunityIcons name={icon} size={24} color="#2E7D32" />
    <Text style={styles.metricValue}>
      {isRating ? value.toFixed(1) : value}
      {isRating && <Text style={styles.ratingScale}>/5</Text>}
    </Text>
    <Text style={styles.metricLabel}>{label}</Text>
  </View>
);

const ActionButton = ({ icon, label, onPress }: any) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <MaterialCommunityIcons name={icon} size={28} color="#2E7D32" />
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

// Estilos
const styles = StyleSheet.create({
  container: {
    height: '100%',
    padding: 20,
    marginTop:10,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#263238',
  },
  locationText: {
    color: '#8D6E63',
    marginTop: 4,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
    gap: 15,
  },
  metricCard: {
    width: Dimensions.get('window').width > 400 ? '48%' : '100%',
    minWidth: 160,
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    marginBottom: 10,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginVertical: 5,
  },
  ratingScale: {
    fontSize: 16,
    color: '#8D6E63',
  },
  metricLabel: {
    color: '#8D6E63',
  },
  quickActions: {
    marginBottom: 25,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#263238',
    marginBottom: 15,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  actionButton: {
    width: '48%', // Ajuste para 2 colunas
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    marginBottom: 10,
  },
  actionLabel: {
    marginTop: 8,
    textAlign: 'center',
    color: '#8D6E63',
  },
  activityItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 1,
    alignItems: 'center',
  },
  activityText: {
    marginLeft: 10,
    flex: 1,
  },
  activityDate: {
    fontSize: 12,
    color: '#8D6E63',
    marginTop: 3,
  },
  seeAllText: {
    color: '#2E7D32',
    textAlign: 'right',
    marginTop: 5,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    padding: 10,
  },
  logoutText: {
    color: '#8D6E63',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
    lineHeight: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#8D6E63',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingLeft: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },  
    modalButton: {
    flex: 1,
    backgroundColor: '#2E7D32',
    paddingVertical: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});