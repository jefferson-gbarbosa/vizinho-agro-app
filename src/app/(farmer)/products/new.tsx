import React, { useState, useRef } from "react";

import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Alert, 
  StyleSheet 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function NewProductScreen(){
  // // Estados do formulário
  const [category, setCategory] = useState('hortalicas');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [availabilityType, setAvailabilityType] = useState<'always' | 'until'>('always');
  const [untilDate, setUntilDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [, setIsLoading] = useState(false);

  // // Referência para o picker de categoria
  const pickerRef = useRef<Picker<string>>(null);

  // // Categorias disponíveis
  const categories = [
    { label: 'Hortaliças', value: 'hortalicas' },
    { label: 'Frutas', value: 'frutas' },
    { label: 'Legumes', value: 'legumes' },
    { label: 'Laticínios', value: 'laticinios' },
    { label: 'Carnes', value: 'carnes' },
  ];

  // // Função para selecionar imagem da galeria
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // // Função para tirar foto
  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permissão negada', 'Precisamos da permissão para acessar a câmera');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Função para lidar com mudança de data
  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || untilDate;
    setShowDatePicker(false);
    setUntilDate(currentDate);
  };

  // Função para enviar o formulário
  const handleSubmit = () => {
    if (!price || !quantity) {
      Alert.alert('Erro', 'Preço e quantidade são obrigatórios');
      return;
    }
    setIsLoading(true);

    const productData = {
      category,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      image,
      availability: availabilityType === 'always' ? 'always' : untilDate.toISOString(),
    };

    console.log('Produto cadastrado:', productData);
    Alert.alert('Sucesso', 'Produto cadastrado com sucesso!');
    router.back();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Cadastro de Produto</Text>

      {/* Seletor de Categoria */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Categoria</Text>
        <View style={styles.pickerContainer}>
          <Picker
            ref={pickerRef}
            selectedValue={category}
            onValueChange={(itemValue: any) => setCategory(itemValue)}
            style={styles.picker}>
            {categories.map((cat) => (
              <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Preço */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Preço (R$)</Text>
        <TextInput
          style={styles.input}
          placeholder="0,00"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />
      </View>

      {/* Quantidade */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Quantidade Disponível</Text>
        <TextInput
          style={styles.input}
          placeholder="0"
          keyboardType="numeric"
          value={quantity}
          onChangeText={setQuantity}
        />
      </View>

      {/* Upload de Imagem */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Foto do Produto</Text>
        <View style={styles.imageButtonsContainer}>
          <TouchableOpacity
            style={[styles.imageButton, styles.cameraButton]}
            onPress={takePhoto}
            > 
            <Text style={styles.buttonText}>Tirar Foto</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.imageButton, styles.galleryButton]}
            onPress={pickImage}
            >
            <Text style={styles.buttonText}>Escolher da Galeria</Text>
          </TouchableOpacity>
        </View>
        {image && (
          <Image source={{ uri: image }} style={styles.imagePreview} resizeMode="contain" />
        )}
      </View>

      {/* Disponibilidade */}
      <View style={styles.availabilityContainer}>
        <Text style={styles.label}>Disponibilidade</Text>
        <View style={styles.availabilityButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.availabilityButton,
              availabilityType === 'always' ? styles.availabilityButtonActive : styles.availabilityButtonInactive
            ]}
            onPress={() => setAvailabilityType('always')}
          >
            <Text style={availabilityType === 'always' ? styles.buttonTextActive : styles.buttonTextInactive}>
              Sempre Disponível
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.availabilityButton,
              availabilityType === 'until' ? styles.availabilityButtonActive : styles.availabilityButtonInactive
            ]}
            onPress={() => setAvailabilityType('until')}
          >
            <Text style={availabilityType === 'until' ? styles.buttonTextActive : styles.buttonTextInactive}>
              Disponível até
            </Text>
          </TouchableOpacity>
        </View>

        {availabilityType === 'until' && (
          <View>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}>
              <Text>{untilDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={untilDate}
                mode="date"
                display="default"
                // onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>
        )}
      </View>

      {/* Botão de Cadastro */}
      <TouchableOpacity
        style={styles.submitButton}
              onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Cadastrar Produto</Text>
            </TouchableOpacity>
            <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace('/(farmer)/dashbord-farmer')} 
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="arrow-back" size={18} color="#FAFAFA" />
          <Text style={[styles.backButtonText, { marginLeft: 8 }]}>
            Voltar ao Dashboard
          </Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FAFAFA',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#2E7D32',
  },
  inputContainer: {
    marginBottom: 16,
    borderColor: 'transparent',
   
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#263238',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: 'rgba(141, 110, 99, 0.5)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
    borderColor: 'transparent'
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(141, 110, 99, 0.5)',
    color: '#263238',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  imageButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    backgroundColor: '#8D6E63',
    marginRight: 8,
  },
  cameraButtonHover: {
    backgroundColor: '#6D4C41', // Terra Queimada mais escuro
  },
  galleryButton: {
    backgroundColor: '#FFD54F',
  },
  galleryButtonHover: {
    backgroundColor: '#FFC107', // Amarelo Sol mais vibrante
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
  imagePreview: {
    width: '100%',
    height: 192,
    borderRadius: 4,
    marginTop: 8,
  },
  availabilityContainer: {
    marginBottom: 24,
  },
  availabilityButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  availabilityButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  availabilityButtonActive: {
    backgroundColor: '#8D6E63',
  },
  availabilityButtonInactive: {
    backgroundColor: 'rgba(141, 110, 99, 0.2)',
  },
  buttonTextActive: {
    color: '#fff',
  },
  buttonTextInactive: {
    color: '#000',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 4,
    padding: 12,
  },
  submitButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  submitButtonHover: {
    backgroundColor: '#FFD54F', // Amarelo Sol
    shadowColor: '#2E7D32',    // Verde Sertão como sombra
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
  backButton: {
    backgroundColor: '#8D6E63', // Terra Queimada
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  backButtonText: {
    color: '#FAFAFA', // Branco Algodão
    fontWeight: '600',
  },
});