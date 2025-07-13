
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import AutomationDetailScreen from "../screens/AutomationDetailScreen";
import LessonStart from "../screens/LessonStart";
import SignInScreen from "../screens/SignInScreen";
import SignUpScreen from "../screens/SignUpScreen";
import RootNavigator from "./RootNavigator";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="SignIn"
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: "#F9FAFB" },
        // Remove any potential style conflicts
        animation: 'slide_from_right'
      }}
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
