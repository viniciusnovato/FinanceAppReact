import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../../styles/tokens';

export const Button = ({
  title,
  variant = 'primary',
  size = 'medium',
  onPress,
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  ...props
}) => {
  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${variant}`],
    styles[`text_${size}`],
    disabled && styles.textDisabled,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.text.inverse : colors.primary[500]}
        />
      ) : (
        <>
          {icon && icon}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Base styles
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },

  // Variants
  primary: {
    backgroundColor: colors.primary[500],
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  secondary: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  danger: {
    backgroundColor: colors.error,
    borderWidth: 1,
    borderColor: colors.error,
  },

  // Sizes
  small: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 44,
  },
  large: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    minHeight: 52,
  },

  // Text styles
  text: {
    textAlign: 'center',
    marginLeft: spacing.xs,
  },
  text_primary: {
    color: colors.text.inverse,
    ...typography.button,
  },
  text_secondary: {
    color: colors.text.primary,
    ...typography.button,
  },
  text_outline: {
    color: colors.primary[500],
    ...typography.button,
  },
  text_ghost: {
    color: colors.primary[500],
    ...typography.button,
  },
  text_danger: {
    color: colors.text.inverse,
    ...typography.button,
  },

  // Size text styles
  text_small: {
    ...typography.buttonSmall,
  },
  text_medium: {
    ...typography.button,
  },
  text_large: {
    ...typography.button,
    fontSize: 18,
  },

  // Disabled styles
  disabled: {
    opacity: 0.5,
  },
  textDisabled: {
    opacity: 0.7,
  },
});