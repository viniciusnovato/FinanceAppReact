import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../../styles/tokens';

export const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  helperText,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  editable = true,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  inputStyle,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const containerStyles = [
    styles.container,
    isFocused && styles.containerFocused,
    error && styles.containerError,
    !editable && styles.containerDisabled,
    style,
  ];

  const inputStyles = [
    styles.input,
    leftIcon && styles.inputWithLeftIcon,
    (rightIcon || secureTextEntry) && styles.inputWithRightIcon,
    multiline && styles.inputMultiline,
    inputStyle,
  ];

  const handleTogglePassword = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={containerStyles}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          style={inputStyles}
          placeholder={placeholder}
          placeholderTextColor={colors.text.disabled}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={handleTogglePassword}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={20}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
        )}
        
        {rightIcon && !secureTextEntry && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
      {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  
  label: {
    ...typography.label,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    minHeight: 44,
  },
  
  containerFocused: {
    borderColor: colors.primary[500],
    borderWidth: 2,
  },
  
  containerError: {
    borderColor: colors.error,
  },
  
  containerDisabled: {
    backgroundColor: colors.gray[50],
    opacity: 0.6,
  },
  
  input: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.text.primary,
  },
  
  inputWithLeftIcon: {
    paddingLeft: spacing.xs,
  },
  
  inputWithRightIcon: {
    paddingRight: spacing.xs,
  },
  
  inputMultiline: {
    paddingVertical: spacing.md,
    textAlignVertical: 'top',
  },
  
  leftIconContainer: {
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
  },
  
  rightIconContainer: {
    paddingRight: spacing.md,
    paddingLeft: spacing.xs,
  },
  
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  
  helperText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
});