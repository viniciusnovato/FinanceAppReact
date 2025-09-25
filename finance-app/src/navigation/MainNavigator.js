import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { tokens } from '../styles/tokens';

// Navegadores de cada seção
import DashboardNavigator from './DashboardNavigator';
import ClientsNavigator from './ClientsNavigator';
import ContractsNavigator from './ContractsNavigator';
import PaymentsNavigator from './PaymentsNavigator';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'analytics' : 'analytics-outline';
              break;
            case 'Clients':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Contracts':
              iconName = focused ? 'document-text' : 'document-text-outline';
              break;
            case 'Payments':
              iconName = focused ? 'card' : 'card-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: tokens.colors.primary.main,
        tabBarInactiveTintColor: tokens.colors.text.secondary,
        tabBarStyle: {
          backgroundColor: tokens.colors.background.primary,
          borderTopColor: tokens.colors.border.light,
          borderTopWidth: 1,
          paddingBottom: tokens.spacing.xs,
          paddingTop: tokens.spacing.xs,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: tokens.typography.caption.fontSize,
          fontWeight: tokens.typography.caption.fontWeight,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardNavigator}
        options={{
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tab.Screen
        name="Clients"
        component={ClientsNavigator}
        options={{
          tabBarLabel: 'Clientes',
        }}
      />
      <Tab.Screen
        name="Contracts"
        component={ContractsNavigator}
        options={{
          tabBarLabel: 'Contratos',
        }}
      />
      <Tab.Screen
        name="Payments"
        component={PaymentsNavigator}
        options={{
          tabBarLabel: 'Pagamentos',
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;