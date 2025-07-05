// import { Ionicons } from '@expo/vector-icons';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import React from 'react';


// import CaptureScreen from '../screens/CaptureScreen';
// import LearnScreen from '../screens/LearnScreen';
// import NotebookScreen from '../screens/NotebookScreen';
// import ToDoScreen from '../screens/ToDoScreen';
// import ScreenWrapper from './ScreenWrapper';


// const Tab = createBottomTabNavigator();

// export default function RootNavigator() {
//   return (
//     <Tab.Navigator
//       screenOptions={({ route }) => ({
//         headerShown: false,
//         tabBarIcon: ({ color, size }) => {
//           let iconName;

//           switch (route.name) {
//             case 'Learn':
//               iconName = 'book-outline';
//               break;
//             case 'Capture': 
//               iconName = 'camera-outline';
//               break;
//             case 'ToDo':
//               iconName = 'calendar-outline';
//               break;
//             case 'Notebook':
//               iconName = 'document-text-outline';
//               break;
//           }

//           return <Ionicons name={iconName} size={size} color={color} />;
//         },
//       })}
//     >
//       <Tab.Screen name="Capture" children={() => <ScreenWrapper Component={CaptureScreen} />} />
//       <Tab.Screen name="Learn" children={() => <ScreenWrapper Component={LearnScreen} />} />
//       <Tab.Screen name="ToDo" children={() => <ScreenWrapper Component={ToDoScreen} />} />
//       <Tab.Screen name="Notebook" children={() => <ScreenWrapper Component={NotebookScreen} />} />
//     </Tab.Navigator>
//   );
// }




import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

import CaptureScreen from '../screens/CaptureScreen';
import LearnScreen from '../screens/LearnScreen';
import NotebookScreen from '../screens/NotebookScreen';
import RecordScreen from '../screens/RecordScreen';
import ToDoScreen from '../screens/ToDoScreen';
import { colors } from '../utils/colors';
import ScreenWrapper from './ScreenWrapper';
import { getToken } from '../utils/token';

const Tab = createBottomTabNavigator();

function CustomTabBarButton({ children, onPress }) {
  return (
    <TouchableOpacity
      style={styles.customButtonContainer}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.customButton}>
        {children}
      </View>
    </TouchableOpacity>
  );
}

export default function RootNavigator({ navigation }) {
  React.useEffect(() => {
    const checkToken = async () => {
      const token = await getToken();
      if (!token) {
        navigation?.replace('SignIn');
      }
    };
    checkToken();
  }, []);
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          height: 60,
          paddingBottom: Platform.OS === 'android' ? 5 : 20,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Learn':
              iconName = 'book-outline';
              break;
            case 'Capture':
              iconName = 'camera-outline';
              break;
            case 'Record':
              iconName = 'ellipse'; // icon hidden under custom button
              break;
            case 'ToDo':
              iconName = 'calendar-outline';
              break;
            case 'Notebook':
              iconName = 'document-text-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Capture" children={() => <ScreenWrapper Component={CaptureScreen} />} />
      <Tab.Screen name="Learn" children={() => <ScreenWrapper Component={LearnScreen} />} />

      {/* Center screen with custom button */}
      <Tab.Screen
        name="Record"
        children={() => <ScreenWrapper Component={RecordScreen} />}
        options={{
          tabBarButton: (props) => ( 
            <CustomTabBarButton {...props}>
              <View style={styles.innerCircle} />
            </CustomTabBarButton>
          ),
        }}
      />

      <Tab.Screen name="ToDo" children={() => <ScreenWrapper Component={ToDoScreen} />} />
      <Tab.Screen name="Notebook" children={() => <ScreenWrapper Component={NotebookScreen} />} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  customButtonContainer: {
    top: -10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customButton: {
    width: 55,
    height: 55,
    borderRadius: 35, 
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  innerCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#C6C2FF',
  },
});
