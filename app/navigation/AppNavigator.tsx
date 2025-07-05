import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import AutomationDetailScreen from "../screens/AutomationDetailScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SignInScreen from "../screens/SignInScreen"; // Import your SignIn screen
import RootNavigator from "./RootNavigator";
import SignUpScreen from "../screens/SignUpScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="SignIn" // Set SignIn as the initial route
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="Tabs" component={RootNavigator} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen
        name="AutomationDetail"
        component={AutomationDetailScreen}
      />
    </Stack.Navigator>
  );
}
