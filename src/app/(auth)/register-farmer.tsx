import Button from '@/components/Button';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface Coordenadas {
  latitude: number;
  longitude: number;
}

interface FormData {
  nome: string;
  telefone: string;
  senha: string;
  localizacao: Coordenadas | null;
  tipoProducao: string;
  certificacoes: any;
  fotoPerfil: string | null;
}

const Screen1 = ({ formData, setFormData, getLocation, validateStep1 }: {
  formData: FormData,
  setFormData: React.Dispatch<React.SetStateAction<FormData>>,
  getLocation: () => void,
  validateStep1: () => void
}) => (
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    keyboardVerticalOffset={80}
  >
    <ScrollView contentContainerStyle={styles.screenContainer} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Vamos iniciar seu cadastro</Text>
      <Text style={styles.subtitle}>Passo 1/3</Text>

      <TextInput
        style={styles.input}
        placeholder="Seu nome completo"
        value={formData.nome}
        onChangeText={(text) => setFormData((prev) => ({ ...prev, nome: text }))}
      />

      <TextInput
        style={styles.input}
        placeholder="WhatsApp (com DDD)"
        keyboardType="phone-pad"
        value={formData.telefone}
        onChangeText={(text) => setFormData((prev) => ({ ...prev, telefone: text }))}
      />

      <TextInput
        style={styles.input}
        placeholder="Digite sua senha"
        secureTextEntry={true} 
        value={formData.senha}
        onChangeText={(text) => setFormData((prev) => ({ ...prev, senha: text }))}
      />

      <TouchableOpacity style={styles.locationButton} onPress={getLocation}>
        <MaterialIcons name="gps-fixed" size={20} color="white" />
        <Text style={styles.locationButtonText}>
          {formData.localizacao ? 'Localização capturada!' : 'Pegar localização automaticamente'}
        </Text>
      </TouchableOpacity>
      <View style={styles.buttonContainer}>
          <Button  
              title="Próximo"
              onPress={validateStep1}
              disabled={!formData.nome || !formData.telefone}
          />
      </View>
    </ScrollView>
  </KeyboardAvoidingView>
);

const Screen2 = ({ formData, setFormData, goBack, goNext }: {
  formData: FormData,
  setFormData: React.Dispatch<React.SetStateAction<FormData>>,
  goBack: () => void,
  goNext: () => void
}) => (
  <View style={styles.screenContainer}>
    <Text style={styles.title}>Cadastro - Passo 2/3</Text>
    <Text style={styles.subtitle}>Como você produz?</Text>

    {['orgânica', 'convencional', 'agroecológica'].map((tipo) => (
      <TouchableOpacity
        key={tipo}
        style={[
          styles.optionButton,
          formData.tipoProducao === tipo && styles.selectedOption
        ]}
        onPress={() => setFormData({ ...formData, tipoProducao: tipo })}
      >
        <Text style={styles.optionText}>
          {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
        </Text>
        {formData.tipoProducao === tipo && (
          <MaterialIcons name="check" size={24} color="#2E7D32" />
        )}
      </TouchableOpacity>
    ))}
    
    <View style={styles.buttonContainer}>
      <Button title="Voltar" onPress={goBack}  backgroundColor="#8D6E63" />
      <Button title="Próximo" onPress={goNext} disabled={!formData.tipoProducao} backgroundColor="#2E7D32" />
    </View>
  </View>
);

const Screen3 = ({ formData, pickImage, pickDocument, goBack, handleSubmit }: {
  formData: FormData,
  pickImage: () => void,
  pickDocument: () => void,
  goBack: () => void,
  handleSubmit: () => void
}) => (
  <View style={styles.screenContainer}>
    <Text style={styles.title}>Cadastro - Passo 3/3</Text>
    <Text style={styles.subtitle}>Documentos (opcional)</Text>

    <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
      {formData.fotoPerfil ? (
        <Image source={{ uri: formData.fotoPerfil }} style={styles.profileImage} />
      ) : (
        <>
          <MaterialIcons name="add-a-photo" size={30} color="#8D6E63" />
          <Text style={styles.uploadText}>Foto sua ou da roça</Text>
        </>
      )}
    </TouchableOpacity>

    <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
      <MaterialIcons name="attach-file" size={30} color="#8D6E63" />
      <Text style={styles.uploadText}>
        {formData.certificacoes ? 'Documento anexado!' : 'Anexar certificado (se tiver)'}
      </Text>
    </TouchableOpacity>

    <View style={styles.buttonContainer}>
      <Button title="Voltar" onPress={goBack}  backgroundColor="#8D6E63" />
      <Button title="Finalizar Cadastro" onPress={handleSubmit} backgroundColor="#2E7D32" />
    </View>
  </View>
);

export default function CadastroAgricultor({ navigation }: { navigation: any }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    telefone: '',
    senha: '',
    localizacao: null,
    tipoProducao: '',
    certificacoes: null,
    fotoPerfil: null
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Ative a localização nas configurações');
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    setFormData(prev => ({
      ...prev,
      localizacao: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      }
    }));
  };

  const validateStep1 = () => {
    if (formData.telefone.length < 11) {
      Alert.alert('Ops!', 'Digite um WhatsApp válido com DDD');
      return;
    }
    setStep(2);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setFormData(prev => ({ ...prev, fotoPerfil: result.assets[0].uri }));
    }
  };

  const pickDocument = async () => {
    Alert.alert('Em desenvolvimento', 'Funcionalidade em breve!');
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      console.log('Dados enviados:', formData);
      const res = await axios.post('http://192.168.0.117:3333/producer',{formData})
      if (res.status === 200) {
				router.replace('/(farmer)/dashbord-farmer');
			}
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao fazer login';
      Alert.alert('Erro', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {step === 1 && (
        <Screen1
          formData={formData}
          setFormData={setFormData}
          getLocation={getLocation}
          validateStep1={validateStep1}
        />
      )}
      {step === 2 && (
        <Screen2
          formData={formData}
          setFormData={setFormData}
          goBack={() => setStep(1)}
          goNext={() => setStep(3)}
        />
      )}
      {step === 3 && (
        <Screen3
          formData={formData}
          pickImage={pickImage}
          pickDocument={pickDocument}
          goBack={() => setStep(2)}
          handleSubmit={handleSubmit}
        />
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Salvando seus dados...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: '8%'
  },
  screenContainer: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#263238',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#8D6E63',
    marginBottom: 15,
  },
  input: {
    height: 50,
    backgroundColor: '#FAFAFA',
    borderColor: '#263238',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  locationButtonText: {
    color: 'white',
    marginLeft: 10,
    fontWeight: 'bold',
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  selectedOption: {
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },
  optionText: {
    fontSize: 16,
  },
  uploadButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: 'white',
  },
  uploadText: {
    color: '#8D6E63',
    marginTop: 5,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#2E7D32',
  },
  textNextButton: {
    padding: 8
  }
});
