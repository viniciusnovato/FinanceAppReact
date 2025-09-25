import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { tokens } from '../styles/tokens';

// Telas de autenticação (serão criadas posteriormente)
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';

const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: {
          backgroundColor: tokens.colors.background.primary,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: tokens.colors.text.primary,
        headerTitleStyle: {
          fontSize: tokens.typography.h3.fontSize,
          fontWeight: tokens.typography.h3.fontWeight,
        },
        headerBackTitleVisible: false,
        cardStyle: {
          backgroundColor: tokens.colors.background.primary,
        },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          title: 'Criar Conta',
        }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          title: 'Recuperar Senha',
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;