import React from 'react';
import { View, StyleSheet, ViewProps, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';

interface CardProps extends ViewProps {
  style?: ViewStyle;
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
}

export const Card: React.FC<CardProps> = ({
  style,
  children,
  variant = 'default',
  ...props
}) => {
  const getCardStyle = () => {
    switch (variant) {
      case 'elevated':
        return [styles.card, styles.elevated, style];
      case 'outlined':
        return [styles.card, styles.outlined, style];
      default:
        return [styles.card, style];
    }
  };

  return (
    <View style={getCardStyle()} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  elevated: {
    ...theme.shadows.md,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
});