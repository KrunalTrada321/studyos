import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert, TouchableWithoutFeedback } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SettingsScreen from "../components/CustomRightDrawer";
import Constants from "../utils/constants";
import { deleteToken, getToken } from "../utils/token";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

export default function ScreenWrapper({ Component }) {
  const [showRightDrawer, setShowRightDrawer] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [greeting, setGreeting] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const navigation = useNavigation();

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    if (hour < 21) return "Good Evening";
    return "Good Night";
  };

  // Check and update streak
  const checkAndUpdateStreak = async () => {
    try {
      const today = new Date().toDateString();
      const lastOpenDate = await AsyncStorage.getItem('lastOpenDate');
      const storedStreak = await AsyncStorage.getItem('currentStreak');
      
      let newStreak = storedStreak ? parseInt(storedStreak) : 0;

      if (lastOpenDate) {
        const lastDate = new Date(lastOpenDate);
        const todayDate = new Date(today);
        const diffTime = todayDate.getTime() - lastDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      await AsyncStorage.setItem('lastOpenDate', today);
      await AsyncStorage.setItem('currentStreak', newStreak.toString());
      setCurrentStreak(newStreak);

    } catch (error) {
      console.error('Error managing streak:', error);
      setCurrentStreak(0);
    }
  };

  // Fetch user profile
  const fetchUserProfile = async () => {
    const token = await getToken()
    setLoadingProfile(true);
    try {
      // Replace {{url}} with your actual API URL
      const response = await fetch(`${Constants.api}/api/me`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setUserProfile(data.user);
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile information');
    } finally {
      setLoadingProfile(false);
    }
  };

  // Handle sign out
  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            setShowProfileModal(false);
            GoogleSignin.signOut()
            navigation.navigate('SignIn');
            deleteToken()
          },
        },
      ]
    );
  };

  useEffect(() => {
    setGreeting(getGreeting());
    checkAndUpdateStreak();
  }, []);

  const handleProfilePress = () => {
    setShowProfileModal(true);
    fetchUserProfile();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        {/* Left Side - Profile + Greeting */}
        <View style={styles.leftSection}>
          <TouchableOpacity onPress={handleProfilePress} style={styles.profileButton}>
            <Ionicons name="person-circle-outline" size={30} color="#6C63FF" />
          </TouchableOpacity>
          <Text style={styles.greetingText}>{greeting}</Text>
        </View>
        
        {/* Right Side - Streak + Settings */}
        <View style={styles.rightSection}>
          <View style={styles.streakContainer}>
            <Ionicons name="flame" size={18} color="#FF6B35" />
            <Text style={styles.streakText}>{currentStreak}</Text>
          </View>
          <TouchableOpacity onPress={() => setShowRightDrawer(true)} style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Screen Content */}
      <View style={styles.content}>
        <Component />
      </View>

      {/* Profile Modal */}
      <Modal visible={showProfileModal} animationType="fade" transparent>
        <TouchableWithoutFeedback onPress={() => setShowProfileModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.profileModal}>
                <View style={styles.profileHeader}>
                  <Text style={styles.profileTitle}>Profile</Text>
                  <TouchableOpacity 
                    onPress={() => setShowProfileModal(false)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                {loadingProfile ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6C63FF" />
                    <Text style={styles.loadingText}>Loading profile...</Text>
                  </View>
                ) : userProfile ? (
                  <View style={styles.profileContent}>
                    <View style={styles.avatarContainer}>
                      <View style={styles.avatarCircle}>
                        <Ionicons name="person" size={40} color="#6C63FF" />
                      </View>
                    </View>
                    
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{userProfile.name}</Text>
                      <Text style={styles.userEmail}>{userProfile.email}</Text>
                    </View>

                    <TouchableOpacity 
                      style={styles.signOutButton}
                      onPress={handleSignOut}
                    >
                      <Ionicons name="log-out-outline" size={20} color="#fff" />
                      <Text style={styles.signOutText}>Sign Out</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Failed to load profile</Text>
                    <TouchableOpacity 
                      style={styles.retryButton}
                      onPress={fetchUserProfile}
                    >
                      <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Right Drawer Modal */}
      <Modal visible={showRightDrawer} animationType="fade" transparent>
        <SettingsScreen onClose={() => setShowRightDrawer(false)} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  profileButton: {
    padding: 4,
    marginRight: 6,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#FFE5D9",
    marginRight: 12,
  },
  streakText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "bold",
    color: "#FF6B35",
  },
  settingsButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  // Profile Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  profileContent: {
    padding: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6C63FF',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  userId: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff4757',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#ff4757',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    color: '#ff4757',
    fontSize: 16,
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
});