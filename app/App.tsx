import React from 'react';
import { StatusBar } from 'react-native';
import 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      {/* <NavigationContainer> */}
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <AppNavigator />
      {/* </NavigationContainer> */}
    </SafeAreaProvider>
  );
}