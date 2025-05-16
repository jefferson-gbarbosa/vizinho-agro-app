import { Link } from 'expo-router';
import React from 'react';
import { TouchableOpacity, Text, StyleSheet} from 'react-native';

interface ButtonProps {
  title: string;
  type?: 'primary' | 'secondary';
  href: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  type = 'primary',
  href
}) => {

  const selectedButtonStyle = type === 'primary' ? styles.primary : styles.secondary;
  const selectedTextStyle = type === 'primary' ? styles.textPrimary : styles.textSecondary;

  return (
    <Link href={href as any} asChild>
        <TouchableOpacity style={selectedButtonStyle}>
            <Text style={selectedTextStyle}>{title}</Text>
        </TouchableOpacity>
    </Link>
  );
};

const styles = StyleSheet.create({
    primary: {
        width: '80%',
        height: 56,
        backgroundColor: '#2E7D32',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        marginVertical: 10,
    },
    secondary: {
      width: '80%',
      height: 56,
      paddingVertical:12,
      paddingHorizontal: 25,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 100,
      borderRadius: 8,
      borderWidth: 2,       
      borderColor: '#263238',
    },
    textPrimary: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    textSecondary: {
      color: '#263238',
      fontSize: 16,
      fontWeight: 'bold'
    },
});

