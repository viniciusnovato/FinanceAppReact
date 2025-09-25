import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';
import { tokens } from '../../../styles/tokens';

export const Text = ({
  children,
  variant = 'body1',
  color = 'primary',
  align = 'left',
  weight = 'regular',
  style,
  numberOfLines,
  ellipsizeMode = 'tail',
  ...props
}) => {
  const textStyle = [
    styles.base,
    styles[variant],
    styles[`color_${color}`],
    styles[`align_${align}`],
    styles[`weight_${weight}`],
    style,
  ];

  return (
    <RNText
      style={textStyle}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      {...props}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: 'System',
  },
  
  // Variantes de tamanho
  h1: {
    fontSize: tokens.typography.h1.fontSize,
    lineHeight: tokens.typography.h1.lineHeight,
    fontWeight: tokens.typography.h1.fontWeight,
  },
  h2: {
    fontSize: tokens.typography.h2.fontSize,
    lineHeight: tokens.typography.h2.lineHeight,
    fontWeight: tokens.typography.h2.fontWeight,
  },
  h3: {
    fontSize: tokens.typography.h3.fontSize,
    lineHeight: tokens.typography.h3.lineHeight,
    fontWeight: tokens.typography.h3.fontWeight,
  },
  h4: {
    fontSize: tokens.typography.h4.fontSize,
    lineHeight: tokens.typography.h4.lineHeight,
    fontWeight: tokens.typography.h4.fontWeight,
  },
  body1: {
    fontSize: tokens.typography.body1.fontSize,
    lineHeight: tokens.typography.body1.lineHeight,
    fontWeight: tokens.typography.body1.fontWeight,
  },
  body2: {
    fontSize: tokens.typography.body2.fontSize,
    lineHeight: tokens.typography.body2.lineHeight,
    fontWeight: tokens.typography.body2.fontWeight,
  },
  caption: {
    fontSize: tokens.typography.caption.fontSize,
    lineHeight: tokens.typography.caption.lineHeight,
    fontWeight: tokens.typography.caption.fontWeight,
  },
  button: {
    fontSize: tokens.typography.button.fontSize,
    lineHeight: tokens.typography.button.lineHeight,
    fontWeight: tokens.typography.button.fontWeight,
  },
  
  // Cores
  color_primary: {
    color: tokens.colors.text.primary,
  },
  color_secondary: {
    color: tokens.colors.text.secondary,
  },
  color_disabled: {
    color: tokens.colors.text.disabled,
  },
  color_white: {
    color: tokens.colors.neutral.white,
  },
  color_success: {
    color: tokens.colors.status.success,
  },
  color_warning: {
    color: tokens.colors.status.warning,
  },
  color_error: {
    color: tokens.colors.status.error,
  },
  color_info: {
    color: tokens.colors.status.info,
  },
  
  // Alinhamento
  align_left: {
    textAlign: 'left',
  },
  align_center: {
    textAlign: 'center',
  },
  align_right: {
    textAlign: 'right',
  },
  align_justify: {
    textAlign: 'justify',
  },
  
  // Peso da fonte
  weight_light: {
    fontWeight: '300',
  },
  weight_regular: {
    fontWeight: '400',
  },
  weight_medium: {
    fontWeight: '500',
  },
  weight_semibold: {
    fontWeight: '600',
  },
  weight_bold: {
    fontWeight: '700',
  },
});