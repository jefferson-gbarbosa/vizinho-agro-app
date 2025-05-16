import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { 
  useRouter, 
} from 'expo-router';
import { 
  View, 
  Text, 
  KeyboardAvoidingView, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  Platform, 
  ActivityIndicator, 
  StyleSheet 
} from 'react-native';
import axios from 'axios';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import AsyncStorage from '@react-native-async-storage/async-storage';

const loginFarmerSchema = z.object({
  telefone: z
    .string()
    .regex(/^\(\d{2}\) \d{5}-\d{4}$/, {
      message: 'Digite um telefone válido com DDD',
    }),
  senha: z.string().min(1, { message: 'A senha é obrigatória' }),
});

type FormData = z.infer<typeof  loginFarmerSchema>;

export default function LoginFarmerScreen() {
  const router = useRouter();
   const {
      control,
      handleSubmit,
      formState: { errors, isSubmitting },
    } = useForm<FormData>({
      resolver: zodResolver(loginFarmerSchema),
      defaultValues: {
        telefone: '',
        senha: '',
      },
    });

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
    
    if (match) {
      let formatted = '';
      if (match[1]) formatted += `(${match[1]}`;
      if (match[2]) formatted += `) ${match[2]}`;
      if (match[3]) formatted += `-${match[3]}`;
      return formatted;
    }
    return text;
  };

  const onSubmit = async (data: FormData) => {
    const phoneDigits = data.telefone.replace(/\D/g, '');
    if (phoneDigits.length < 11) {
      Alert.alert('Atenção', 'Digite um telefone válido com DDD');
      return;
    }
    try {
      const res = await axios.post('http://192.168.0.117:3333/login-producer', {
        telefone: phoneDigits,
        senha: data.senha,
      })

      if (res.status === 200) {
        const { token } = res.data;
    
        await AsyncStorage.setItem('producerToken', token);
				router.replace('/(farmer)/dashbord-farmer');
			}
      
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao fazer login';
      Alert.alert('Erro', message);
    }
  };

  const handleCadastro = () => {
    router.push('/(auth)/register-farmer');
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Acesse sua conta</Text>
        <Text style={styles.subtitle}>
           Produtor cadastrado
        </Text>

        {/* Campo Telefone */}
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="phone" size={20} color="#8D6E63" />
           <Controller
            control={control}
            name="telefone"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="(00) 00000-0000"
                keyboardType="phone-pad"
                maxLength={15}
                onBlur={onBlur}
                onChangeText={(text) => onChange(formatPhoneNumber(text))}
                value={value}
              />
            )}
          />
        </View>
        {errors.telefone && (
          <Text style={styles.error}>{errors.telefone.message}</Text>
        )}
        {/* Campo Senha */}
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="lock" size={20} color="#8D6E63" />
         <Controller
          control={control}
          name="senha"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Senha"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        </View>
        {errors.senha && <Text style={styles.error}>{errors.senha.message}</Text>}
        {/* Botão de Login */}
         <TouchableOpacity
            style={styles.loginButton}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <MaterialCommunityIcons name="login" size={20} color="#FFF" />
                <Text style={styles.loginButtonText}>Entrar</Text>
              </>
            )}
        </TouchableOpacity>
        {/* Links úteis */}
        <View style={styles.linksContainer}>
          <TouchableOpacity onPress={() => router.push('/')}>
            <Text style={styles.linkText}>Esqueci minha senha</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleCadastro}>
            <Text style={styles.linkText}>
              Não tem conta? Cadastre-se
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8D6E63',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    height: 50,
    marginLeft: 10,
    color: '#263238',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    gap: 10,
  },
  loginButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  linksContainer: {
    marginTop: 20,
    alignItems: 'center',
    gap: 12,
  },
  linkText: {
    color: '#8D6E63',
    textDecorationLine: 'underline',
  },
  offlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    gap: 5,
  },
  offlineText: {
    color: '#8D6E63',
    fontSize: 14,
  },
  error: {
    color: 'red',
    marginBottom: 10,
    marginLeft: 10,
    fontSize: 13,
  },
});