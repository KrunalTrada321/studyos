// AppNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import ProfileScreen from '../screens/ProfileScreen'; // adjust path as needed
import RootNavigator from './RootNavigator';
import AutomationDetailScreen from '../screens/AutomationDetailScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={RootNavigator} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="AutomationDetail" component={AutomationDetailScreen} />
    </Stack.Navigator>
  );
}
