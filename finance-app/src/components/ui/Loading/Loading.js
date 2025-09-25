import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { tokens } from '../../../styles/tokens';
import { Text } from '../Text';

export const Loading = ({
  size = 'large',
  color = tokens.colors.primary.main,
  message,
  overlay = false,
  style,
}) => {
  const containerStyle = [
    styles.container,
    overlay && styles.overlay,
    style,
  ];

  return (
    <View style={containerStyle}>
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text
          variant="body2"
          color="secondary"
          align="center"
          style={styles.message}
        >
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: tokens.spacing.lg,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1000,
  },
  message: {
    marginTop: tokens.spacing.md,
  },
});