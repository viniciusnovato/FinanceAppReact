import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';

// Screens
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ClientsScreen from '../screens/ClientsScreen';
import ContractsScreen from '../screens/ContractsScreen';
import PaymentsScreen from '../screens/PaymentsScreen';

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Clients: undefined;
  Contracts: undefined;
  Payments: undefined;
};

const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
};

const MainNavigator = () => {
  return (
    <MainTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#C7C7CC',
          borderTopWidth: 1,
        },
      }}
    >
      <MainTab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          // tabBarIcon: ({ color, size }) => (
          //   <Icon name="dashboard" size={size} color={color} />
          // ),
        }}
      />
      <MainTab.Screen
        name="Clients"
        component={ClientsScreen}
        options={{
          tabBarLabel: 'Clientes',
          // tabBarIcon: ({ color, size }) => (
          //   <Icon name="people" size={size} color={color} />
          // ),
        }}
      />
      <MainTab.Screen
        name="Contracts"
        component={ContractsScreen}
        options={{
          tabBarLabel: 'Contratos',
          // tabBarIcon: ({ color, size }) => (
          //   <Icon name="description" size={size} color={color} />
          // ),
        }}
      />
      <MainTab.Screen
        name="Payments"
        component={PaymentsScreen}
        options={{
          tabBarLabel: 'Pagamentos',
          // tabBarIcon: ({ color, size }) => (
          //   <Icon name="payment" size={size} color={color} />
          // ),
        }}
      />
    </MainTab.Navigator>
  );
};

const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <RootStack.Screen name="Main" component={MainNavigator} />
      ) : (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      )}
    </RootStack.Navigator>
  );
};

export default AppNavigator;