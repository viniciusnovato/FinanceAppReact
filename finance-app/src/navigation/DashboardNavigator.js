import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { tokens } from '../styles/tokens';

// Telas do Dashboard (serão criadas posteriormente)
import DashboardScreen from '../screens/Dashboard/DashboardScreen';

const Stack = createStackNavigator();

const DashboardNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="DashboardHome"
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
        name="DashboardHome"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
        }}
      />
    </Stack.Navigator>
  );
};

export default DashboardNavigator;