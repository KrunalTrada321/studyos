import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View, Animated } from 'react-native';

import CaptureScreen from '../screens/CaptureScreen';
import LearnScreen from '../screens/LearnScreen';
import NotebookScreen from '../screens/NotebookScreen';
import RecordScreen from '../screens/ChatScreen';
import ToDoScreen from '../screens/ToDoScreen';
import { colors } from '../utils/colors';
import ScreenWrapper from './ScreenWrapper';
import { getToken } from '../utils/token';

// Create memoized wrapper components
const CaptureScreenWrapper = React.memo(() => <ScreenWrapper Component={CaptureScreen} />);
const LearnScreenWrapper = React.memo(() => <ScreenWrapper Component={LearnScreen} />);
const RecordScreenWrapper = React.memo(() => <ScreenWrapper Component={RecordScreen} />);
const ToDoScreenWrapper = React.memo(() => <ScreenWrapper Component={ToDoScreen} />);
const NotebookScreenWrapper = React.memo(() => <ScreenWrapper Component={NotebookScreen} />);

export type TabParamList = {
  Capture: undefined;
  Learn: undefined;
  Record: undefined;
  ToDo: undefined;
  Notebook: undefined;
};

export type RootParamList = {
  SignIn: undefined;
  Main: undefined;
} & TabParamList;

const Tab = createBottomTabNavigator<TabParamList>();

interface CustomTabBarButtonProps {
  children: React.ReactNode;
  onPress?: (event: any) => void;
}

function CustomTabBarButton({ children, onPress }: CustomTabBarButtonProps) {
  const scaleValue = React.useRef(new Animated.Value(1)).current;
  const pulseValue = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = (event: any) => {
    if (onPress) {
      onPress(event);
    }
  };

  return (
    <TouchableOpacity
      style={styles.customButtonContainer}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
    >
      <Animated.View 
        style={[
          styles.customButtonPulse,
          {
            transform: [{ scale: pulseValue }]
          }
        ]}
      />
      <Animated.View 
        style={[
          styles.customButton,
          {
            transform: [{ scale: scaleValue }]
          }
        ]}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

interface RootNavigatorProps {
  navigation: NavigationProp<RootParamList>;
}

export default function RootNavigator({ navigation }: RootNavigatorProps) {
  React.useEffect(() => {
    const checkToken = async () => {
      const token = await getToken();
      if (!token) {
        navigation.navigate('SignIn');
      }
    };
    checkToken();
  }, [navigation]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#8E8E93',
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          let iconSize = focused ? size + 2 : size;

          switch (route.name) {
            case 'Learn':
              iconName = focused ? 'book' : 'book-outline';
              break;
            case 'Capture':
              iconName = focused ? 'camera' : 'camera-outline';
              break;
            case 'Record':
              iconName = 'ellipse';
              break;
            case 'ToDo':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Notebook':
              iconName = focused ? 'document-text' : 'document-text-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return (
            <View
              style={[
                styles.iconContainer,
                focused && styles.focusedIconContainer
              ]}
            >
              <Ionicons name={iconName} size={iconSize} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen 
        name="Capture" 
        component={CaptureScreenWrapper}
        options={{
          tabBarLabel: 'Capture',
        }}
      />
      <Tab.Screen 
        name="Learn" 
        component={LearnScreenWrapper}
        options={{
          tabBarLabel: 'Learn',
        }}
      />
      <Tab.Screen
        name="Record"
        component={RecordScreenWrapper}
        options={{
          tabBarLabel: 'Chat',
          tabBarButton: (props) => ( 
            <CustomTabBarButton {...props}>
              <View style={styles.innerCircle}>
                <Ionicons name="chatbubble" size={20} color="white" />
              </View>
            </CustomTabBarButton>
          ),
        }}
      />
      <Tab.Screen 
        name="ToDo" 
        component={ToDoScreenWrapper}
        options={{
          tabBarLabel: 'Tasks',
        }}
      />
      <Tab.Screen 
        name="Notebook" 
        component={NotebookScreenWrapper}
        options={{
          tabBarLabel: 'Notes',
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  customButtonContainer: {
    top: -15,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  customButtonPulse: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primary,
    opacity: 0.2,
  },
  customButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 15,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  innerCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    borderRadius: 12,
    minWidth: 32,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusedIconContainer: {
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    transform: [{ scale: 1.1 }],
  },
});