import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';

type Variant = 'primary' | 'secondary' | 'outline';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  href?: string;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  backgroundColor?: string;
  textColor?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  href,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  backgroundColor,
  textColor,
  style,
  textStyle,
}) => {
  const isLink = Boolean(href);

  const getBackgroundColor = () => {
    if (disabled) return '#BDBDBD';
    if (backgroundColor) return backgroundColor;

    switch (variant) {
      case 'secondary':
        return '#8D6E63';
      case 'outline':
        return 'transparent';
      default:
        return '#2E7D32';
    }
  };

  const getTextColor = () => {
    if (textColor) return textColor;

    switch (variant) {
      case 'outline':
        return '#2E7D32';
      case 'secondary':
        return '#FFF';
      default:
        return '#FFF';
    }
  };

  const buttonStyles = [
    styles.buttonBase,
    {
      backgroundColor: getBackgroundColor(),
      borderColor: variant === 'outline' ? '#2E7D32' : 'transparent',
      borderWidth: variant === 'outline' ? 1 : 0,
      opacity: disabled ? 0.6 : 1,
    },
    style,
  ];

  const content = (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {icon && (
            <MaterialCommunityIcons
              name={icon}
              size={20}
              color={getTextColor()}
              style={{ marginRight: 8 }}
            />
          )}
          <Text
            style={[
              styles.textBase,
              { color: getTextColor() },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </View>
  );

  if (isLink && href) {
    return (
      <Link href={href as any} asChild>
        <TouchableOpacity style={buttonStyles} activeOpacity={0.8}>
          {content}
        </TouchableOpacity>
      </Link>
    );
  }

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled || loading}
    >
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginVertical: 10,
    elevation: 2,
  },
  textBase: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default Button;
