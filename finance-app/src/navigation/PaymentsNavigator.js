import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { tokens } from '../styles/tokens';

// Telas de Pagamentos (serão criadas posteriormente)
import PaymentsListScreen from '../screens/Payments/PaymentsListScreen';
import PaymentDetailsScreen from '../screens/Payments/PaymentDetailsScreen';
import PaymentFormScreen from '../screens/Payments/PaymentFormScreen';

const Stack = createStackNavigator();

const PaymentsNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="PaymentsList"
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
        name="PaymentsList"
        component={PaymentsListScreen}
        options={{
          title: 'Pagamentos',
        }}
      />
      <Stack.Screen
        name="PaymentDetails"
        component={PaymentDetailsScreen}
        options={{
          title: 'Detalhes do Pagamento',
        }}
      />
      <Stack.Screen
        name="PaymentForm"
        component={PaymentFormScreen}
        options={({ route }) => ({
          title: route.params?.paymentId ? 'Editar Pagamento' : 'Novo Pagamento',
        })}
      />
    </Stack.Navigator>
  );
};

export default PaymentsNavigator;