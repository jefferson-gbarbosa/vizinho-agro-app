import Button from '@/components/Button';
import Input from '@/components/Input';
import api from '@/services/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Producer = {
  id: number;
  nome: string;
  telefone: string;
  foto: string | null;
};

type Metrics = {
  produtos_cadastrados: number;
  vendas_semanais: number;
  clientes_ativos: number;
  avaliacao_media: number;
};

interface FormData {
  nome: string;
  telefone: string;
  foto: string | null;
}

export default function PerfilAgricultor() {
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [producers, setProducers] = useState<Producer[]>([]);
  const [selectedProducer, setSelectedProducer] = useState<Producer | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    telefone: '',
    foto: null,
  });

  const [metrics, setMetrics] = useState<Metrics>({
    produtos_cadastrados: 0,
    vendas_semanais: 0,
    clientes_ativos: 0,
    avaliacao_media: 0,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get<Producer[]>('/producers');
        const data: Producer[] = res.data.map((p: any) => ({
          id: p.id,
          nome: p.nome || "Produtor sem nome",
          telefone: p.telefone || "Sem telefone",
          foto: p.foto || null,
        }));
        // console.log(data)
        setProducers(data);
        if (data.length > 0) {
          const selected = data[0];
          setSelectedProducer(selected);
          setFormData({
            nome: selected.nome,
            telefone: selected.telefone,
            foto: selected.foto,
          });
        }
      } catch (error: any) {
        const message = error.response?.data?.message || 'Erro ao carregar produtores';
        Alert.alert('Erro', message);
      }
    };
    fetchProfile();
  }, []);


   useEffect(() => {
    if (selectedProducer?.id) {
      const fetchMetrics = async () => {
        try {
          const metricsRes = await axios.get(`/producers/${selectedProducer.id}/metrics`);
          if (metricsRes.data.length > 0) {
            const m = metricsRes.data[0];
            setMetrics({
              produtos_cadastrados: m.produtos_cadastrados,
              vendas_semanais: m.vendas_semanais,
              clientes_ativos: m.clientes_ativos,
              avaliacao_media: m.avaliacao_media,
            });
          }
        } catch (error) {
          console.error("Erro ao buscar métricas", error);
        }
      };
      fetchMetrics();
    }
  }, [selectedProducer]);

  const handleUpdate = async () => {
    if (!selectedProducer) return;
    
    try {
      // Atualizar dados do produtor
      await axios.put(`/producers/${selectedProducer.id}`, formData);
      setProducers(producers.map(p => 
        p.id === selectedProducer.id ? { ...p, ...formData } : p
      ));
      setSelectedProducer({ ...selectedProducer, ...formData });
      
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      setEditMode(false);
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Não foi possível atualizar o perfil');
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria para alterar a foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setFormData({ ...formData, foto: result.assets[0].uri });
    }
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

  if (!selectedProducer) {
    return (
      <View style={styles.container}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.title}>Meu Perfil</Text>
        <TouchableOpacity onPress={() => setEditMode(!editMode)}>
          <MaterialCommunityIcons 
            name={editMode ? 'close' : 'pencil'} 
            size={24} 
            color="#2E7D32" 
          />
        </TouchableOpacity>
      </View>

      {/* Foto de Perfil */}
      <TouchableOpacity 
        style={styles.photoContainer}
        onPress={editMode ? pickImage : () => {}}
        disabled={!editMode}
      >
        {formData.foto ? (
          <Image source={{ uri: formData.foto }} style={styles.photo} />
        ) : (
          <MaterialCommunityIcons name="account-circle" size={100} color="#8D6E63" />
        )}
        {editMode && (
          <View style={styles.editPhotoBadge}>
            <MaterialCommunityIcons name="camera" size={20} color="white" />
          </View>
        )}
      </TouchableOpacity>

      {/* Formulário de Edição */}
      <View style={styles.form}>
        <Input
          label="Nome completo"
          value={formData.nome}
          onChangeText={(text) => setFormData({ ...formData, nome: text })}
          editable={editMode}
          icon="account"
        /> 

        <Input
          label="Telefone"
          value={formData.telefone}
          onChangeText={(text) => setFormData({ ...formData, telefone: text })}
          keyboardType="phone-pad"
          editable={editMode}
          icon="phone"
        />
        
        {editMode ? (
          <Button 
            title="Salvar Alterações" 
            onPress={handleUpdate}
            style={styles.saveButton}
          />
        ) : (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{metrics.produtos_cadastrados}</Text>
              <Text style={styles.statLabel}>Produtos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{metrics.avaliacao_media}</Text>
              <Text style={styles.statLabel}>Avaliação</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{metrics.clientes_ativos}</Text>
              <Text style={styles.statLabel}>Clientes</Text>
            </View>
          </View>
        )}
      </View>

      {/* Rodapé */}
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={() => handleLogout}
      >
        <MaterialCommunityIcons name="logout" size={20} color="#E57373" />
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#FAFAFA',
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#263238',
  },
  photoContainer: {
    alignSelf: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#8D6E63',
  },
  editPhotoBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#2E7D32',
    borderRadius: 20,
    padding: 8,
  },
  form: {
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    padding: 20,
    elevation: 2,
    shadowColor: '#8D6E63',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  statLabel: {
    color: '#8D6E63',
    marginTop: 5,
  },
  saveButton: {
    marginTop: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    marginTop: 20,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2E7D32',
  },
  logoutText: {
    color: '#2E7D32',
    marginLeft: 10,
    fontWeight: '500',
  },
});