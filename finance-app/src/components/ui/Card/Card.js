import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../../styles/tokens';

export const Card = ({
  children,
  variant = 'default',
  padding = 'medium',
  onPress,
  style,
  ...props
}) => {
  const Component = onPress ? TouchableOpacity : View;
  
  const cardStyles = [
    styles.base,
    styles[variant],
    styles[`padding_${padding}`],
    style,
  ];

  return (
    <Component
      style={cardStyles}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      {...props}
    >
      {children}
    </Component>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    backgroundColor: colors.card,
    ...shadows.sm,
  },
  
  // Variants
  default: {
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  
  elevated: {
    ...shadows.md,
    borderWidth: 0,
  },
  
  outlined: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    backgroundColor: colors.background,
  },
  
  // Padding variants
  padding_none: {
    padding: 0,
  },
  
  padding_small: {
    padding: spacing.md,
  },
  
  padding_medium: {
    padding: spacing.lg,
  },
  
  padding_large: {
    padding: spacing.xl,
  },
});