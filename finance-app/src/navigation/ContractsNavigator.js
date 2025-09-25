import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { tokens } from '../styles/tokens';

// Telas de Contratos (serão criadas posteriormente)
import ContractsListScreen from '../screens/Contracts/ContractsListScreen';
import ContractDetailsScreen from '../screens/Contracts/ContractDetailsScreen';
import ContractFormScreen from '../screens/Contracts/ContractFormScreen';

const Stack = createStackNavigator();

const ContractsNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="ContractsList"
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
        name="ContractsList"
        component={ContractsListScreen}
        options={{
          title: 'Contratos',
        }}
      />
      <Stack.Screen
        name="ContractDetails"
        component={ContractDetailsScreen}
        options={{
          title: 'Detalhes do Contrato',
        }}
      />
      <Stack.Screen
        name="ContractForm"
        component={ContractFormScreen}
        options={({ route }) => ({
          title: route.params?.contractId ? 'Editar Contrato' : 'Novo Contrato',
        })}
      />
    </Stack.Navigator>
  );
};

export default ContractsNavigator;