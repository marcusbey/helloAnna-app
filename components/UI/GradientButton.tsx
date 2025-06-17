import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
  ColorValue,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';

interface GradientButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
  ...props
}) => {
  const getGradientColors = (): string[] => {
    if (disabled) return [colors.gray[300], colors.gray[400]];
    
    switch (variant) {
      case 'primary':
        return [colors.primary, colors.secondary];
      case 'secondary':
        return [colors.secondary, colors.primary];
      case 'outline':
        return ['transparent', 'transparent'];
      default:
        return [colors.primary, colors.secondary];
    }
  };
  
  const getButtonStyle = () => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.borderRadius.md,
    };
    
    switch (size) {
      case 'small':
        baseStyle.paddingVertical = 8;
        baseStyle.paddingHorizontal = 16;
        break;
      case 'medium':
        baseStyle.paddingVertical = 12;
        baseStyle.paddingHorizontal = 24;
        break;
      case 'large':
        baseStyle.paddingVertical = 16;
        baseStyle.paddingHorizontal = 32;
        break;
    }
    
    if (variant === 'outline') {
      baseStyle.borderWidth = 1;
      baseStyle.borderColor = colors.primary;
    }
    
    return baseStyle;
  };
  
  const getTextStyle = () => {
    const baseStyle: TextStyle = {
      fontWeight: '600',
      textAlign: 'center',
    };
    
    switch (size) {
      case 'small':
        baseStyle.fontSize = 14;
        break;
      case 'medium':
        baseStyle.fontSize = 16;
        break;
      case 'large':
        baseStyle.fontSize = 18;
        break;
    }
    
    if (variant === 'outline') {
      baseStyle.color = colors.primary;
    } else {
      baseStyle.color = colors.white;
    }
    
    if (disabled) {
      baseStyle.color = colors.gray[100];
    }
    
    return baseStyle;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      style={[styles.button, getButtonStyle(), style]}
      activeOpacity={0.8}
      {...props}
    >
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, getButtonStyle()]}
      >
        {isLoading ? (
          <ActivityIndicator color={variant === 'outline' ? colors.primary : colors.white} />
        ) : (
          <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    overflow: 'hidden',
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
});