import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  error?: string;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  icon, 
  error, 
  style, 
  ...props 
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[
        styles.inputContainer,
        error ? styles.errorContainer : null
      ]}>
        {icon && (
          <MaterialCommunityIcons 
            name={icon} 
            size={20} 
            color={error ? '#E53935' : '#8D6E63'} 
            style={styles.icon} 
          />
        )}
        
        <TextInput
          style={[styles.input, props.multiline && styles.multiline]}
          placeholderTextColor="#BDBDBD"
          {...props}
        />
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    color: '#8D6E63',
    fontWeight: '500',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  errorContainer: {
    borderColor: '#E53935',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#263238',
    fontSize: 16,
  },
  multiline: {
    height: 100,
    textAlignVertical: 'top',
    paddingVertical: 15,
  },
  errorText: {
    color: '#E53935',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default Input;