import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import AutomationDetailScreen from "../screens/AutomationDetailScreen";
import LessonStart from "../screens/LessonStart";
import SignInScreen from "../screens/SignInScreen"; // Import your SignIn screen
import SignUpScreen from "../screens/SignUpScreen";
import RootNavigator from "./RootNavigator";

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
      <Stack.Screen
        name="AutomationDetail"
        component={AutomationDetailScreen}
      />
       <Stack.Screen
        name="LessonStart"  
        component={LessonStart}
      />
      
    </Stack.Navigator>
  );
}
