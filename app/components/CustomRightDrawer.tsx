import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Alert,
} from "react-native";
import colors from "../utils/colors";

import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';

const webClientId = '668482663649-2adcufrnk232m0g0n9qapu86gji3qhla.apps.googleusercontent.com';

GoogleSignin.configure({
  webClientId: webClientId,
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  offlineAccess: true,
  forceCodeForRefreshToken: false,
});

interface Props {
  onClose: () => void;
}

export default function SettingsScreen({ onClose }: Props) {
  const [darkMode, setDarkMode] = useState(true);
  const [learningReminders, setLearningReminders] = useState(true);
  const [assignmentAlerts, setAssignmentAlerts] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [connections, setConnections] = useState([
    {
      id: 1,
      name: "Canvas LMS",
      url: "canvas.instructure.com",
      synced: "2 hours ago",
      connected: true,
    },
    {
      id: 2,
      name: "Google Class Room",
      url: "canvas.instructure.com",
      synced: "2 hours ago",
      connected: true,
    },
    {
      id: 3,
      name: "Blackboard",
      url: "canvas.instructure.com",
      synced: "2 hours ago",
      connected: true,
    },
  ]);

  const handleGoogleClassroomSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      // Get the access token
      const tokens = await GoogleSignin.getTokens();
      
      console.log('User Info:', userInfo);
      console.log('Access Token:', tokens.accessToken);
      console.log('ID Token:', tokens.idToken);
      
      // For now, just print the token - you can send this to your backend
      Alert.alert('Success', `Google Classroom connected!\nAccess Token: ${tokens.accessToken.substring(0, 50)}...`);
      
      setShowConnectionModal(false);
      
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert('Cancelled', 'Sign in was cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('In Progress', 'Sign in is already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Play services not available');
      } else {
        Alert.alert('Error', 'Something went wrong with Google Sign-In');
      }
    }
  };

  const handleUniversityWebsite = () => {
    Alert.alert('Coming Soon', 'University website integration will be available soon!');
    setShowConnectionModal(false);
  };

  const ConnectionModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showConnectionModal}
      onRequestClose={() => setShowConnectionModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Connection</Text>
            <TouchableOpacity onPress={() => setShowConnectionModal(false)}>
              <Ionicons name="close" size={24} color={colors.black} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.modalSubtitle}>
            Choose a platform to connect with your learning management system
          </Text>
          
          <TouchableOpacity 
            style={styles.connectionOption}
            onPress={handleUniversityWebsite}
          >
            <View style={styles.optionIconContainer}>
              <Ionicons name="school" size={24} color={colors.primary} />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>University Website</Text>
              <Text style={styles.optionDescription}>
                Connect to your university's learning management system
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.connectionOption}
            onPress={handleGoogleClassroomSignIn}
          >
            <View style={styles.optionIconContainer}>
              <MaterialIcons name="class" size={24} color={colors.primary} />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Google Classroom</Text>
              <Text style={styles.optionDescription}>
                Connect to your Google Classroom courses
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconWrapper} onPress={onClose}>
          <Ionicons name="close" size={20} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Appearance */}
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: "#ccc", true: "#4C5EFF" }}
            thumbColor="#fff"
          />
        </View>

        {/* Notifications */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Learning Reminders</Text>
          <Switch
            value={learningReminders}
            onValueChange={setLearningReminders}
            trackColor={{ false: "#ccc", true: "#4C5EFF" }}
            thumbColor="#fff"
          />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Assignment Alerts</Text>
          <Switch
            value={assignmentAlerts}
            onValueChange={setAssignmentAlerts}
            trackColor={{ false: "#ccc", true: "#4C5EFF" }}
            thumbColor="#fff"
          />
        </View>

        {/* Connections */}
        <Text style={styles.sectionTitle}>Connections</Text>
        <Text style={styles.subText}>
          Connect to your school's websites to automatically import assignments
          and course materials.
        </Text>

        {connections.map((conn) => (
          <View key={conn.id} style={styles.connectionBox}>
            <View style={styles.connectionRow}>
              {/* Left Side: Info */}
              <View>
                <Text style={styles.connectionTitle}>{conn.name}</Text>
                <Text style={styles.connectionUrl}>{conn.url}</Text>
                <Text style={styles.synced}>Last sync: {conn.synced}</Text>
                <View style={styles.connectedPill}>
                  <Text style={styles.connectedText}>Connected</Text>
                </View>
              </View>

              {/* Right Side: Switch and Actions */}
              <View style={styles.actions}>
                <Switch
                  value={conn.connected}
                  onValueChange={() => {}}
                  trackColor={{ false: "#ccc", true: "#4C5EFF" }}
                  thumbColor="#fff"
                />
                <View style={styles.iconRow}>
                  <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="reload" size={16} color="#444" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconButton}>
                    <MaterialIcons name="close" size={16} color="#FF4E4E" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity 
          onPress={() => setShowConnectionModal(true)} 
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>+ Add Connection</Text>
        </TouchableOpacity>

        {/* Account */}
        <Text
          style={{ fontWeight: "600", color: colors.black, marginVertical: 10 }}
        >
          Account
        </Text>
        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Privacy Settings</Text>
        </TouchableOpacity>

        {/* About */}
        <Text
          style={{ fontWeight: "600", color: colors.black, marginVertical: 10 }}
        >
          About
        </Text>
        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Help Center</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Terms of Services</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Privacy Policy</Text>
        </TouchableOpacity>
      </ScrollView>

      <ConnectionModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  iconWrapper: {
    width: 28,
    height: 28,
    backgroundColor: colors.primary,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    color: "#1F1F47",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 18,
    marginBottom: 4,
    color: "#1F1F47",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 6,
  },
  label: {
    fontSize: 14,
    color: "#1F1F47",
  },
  subText: {
    fontSize: 12,
    color: "#777",
    marginBottom: 10,
    marginTop: 2,
  },
  connectionBox: {
    backgroundColor: "#F6F6FC",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E0E0F0",
  },
  connectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  connectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F1F47",
  },
  connectionUrl: {
    fontSize: 12,
    color: "#555",
    marginTop: 2,
  },
  synced: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
  },
  connected: {
    fontSize: 11,
    color: "#4C5EFF",
    fontWeight: "600",
    marginTop: 4,
  },
  actions: {
    alignItems: "flex-end",
    gap: 6,
  },
  iconButton: {
    marginTop: 8,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    marginVertical: 12,
  },
  addButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  secondaryText: {
    textAlign: "center",
    fontWeight: "700",
    color: colors.white,
    fontSize: 13,
  },
  connectedPill: {
    marginTop: 20,
    backgroundColor: "#E5E9FF",
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  connectedText: {
    fontSize: 11,
    alignSelf: "flex-end",
    fontWeight: "600",
    color: "#4C5EFF",
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F1F47",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#777",
    marginBottom: 20,
    textAlign: "center",
  },
  connectionOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F6F6FC",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0F0",
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E9FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F1F47",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 12,
    color: "#777",
  },
});