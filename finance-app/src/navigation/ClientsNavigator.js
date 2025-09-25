import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { tokens } from '../styles/tokens';

// Telas de Clientes (serão criadas posteriormente)
import ClientsListScreen from '../screens/Clients/ClientsListScreen';
import ClientDetailsScreen from '../screens/Clients/ClientDetailsScreen';
import ClientFormScreen from '../screens/Clients/ClientFormScreen';

const Stack = createStackNavigator();

const ClientsNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="ClientsList"
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
        name="ClientsList"
        component={ClientsListScreen}
        options={{
          title: 'Clientes',
        }}
      />
      <Stack.Screen
        name="ClientDetails"
        component={ClientDetailsScreen}
        options={{
          title: 'Detalhes do Cliente',
        }}
      />
      <Stack.Screen
        name="ClientForm"
        component={ClientFormScreen}
        options={({ route }) => ({
          title: route.params?.clientId ? 'Editar Cliente' : 'Novo Cliente',
        })}
      />
    </Stack.Navigator>
  );
};

export default ClientsNavigator;