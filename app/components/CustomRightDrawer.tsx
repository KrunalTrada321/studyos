"use client";

import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import colors from "../utils/colors";
import { getToken } from "../utils/token";
import Constants from "../utils/constants";

const webClientId =
  "668482663649-2adcufrnk232m0g0n9qapu86gji3qhla.apps.googleusercontent.com";

GoogleSignin.configure({
  webClientId: webClientId,
  scopes: [
    "https://www.googleapis.com/auth/classroom.courses.readonly",
    "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
  ],
  offlineAccess: true,
  forceCodeForRefreshToken: true,
});

interface Props {
  onClose: () => void;
}

interface Connection {
  id: number;
  name: string;
  url: string;
  connected: boolean;
  type: string;
  lastSync?: string; // For API-fetched connections
}

export default function SettingsScreen({ onClose }: Props) {
  const [darkMode, setDarkMode] = useState(true);
  const [learningReminders, setLearningReminders] = useState(true);
  const [assignmentAlerts, setAssignmentAlerts] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [googleClassroomSyncTime, setGoogleClassroomSyncTime] =
    useState<Date | null>(null);
  const [isGoogleClassroomSyncing, setIsGoogleClassroomSyncing] =
    useState(false);
  const [spinValue] = useState(new Animated.Value(0));

  // Add this useEffect to handle the spinning animation
  useEffect(() => {
    if (isGoogleClassroomSyncing) {
      const spinAnimation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      spinAnimation.start();
      return () => spinAnimation.stop();
    }
  }, [isGoogleClassroomSyncing, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Load Google Classroom sync time from AsyncStorage
  const loadGoogleClassroomSyncTime = async () => {
    try {
      const syncTimeString = await AsyncStorage.getItem(
        "googleClassroomLastSync"
      );
      if (syncTimeString) {
        setGoogleClassroomSyncTime(new Date(syncTimeString));
      }
    } catch (error) {
      console.error("Error loading Google Classroom sync time:", error);
    }
  };

  // Save Google Classroom sync time to AsyncStorage
  const saveGoogleClassroomSyncTime = async (date: Date) => {
    try {
      await AsyncStorage.setItem("googleClassroomLastSync", date.toISOString());
      setGoogleClassroomSyncTime(date);
    } catch (error) {
      console.error("Error saving Google Classroom sync time:", error);
    }
  };

  // Fetch LMS connections from API
  const fetchLMSConnections = async () => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch("YOUR_API_ENDPOINT/connections");
      if (response.ok) {
        const lmsConnections: Connection[] = await response.json();
        setConnections(lmsConnections);
      }
    } catch (error) {
      console.error("Error fetching LMS connections:", error);
    }
  };

  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getLastSyncTime = (connection: Connection): string => {
    if (connection.type === "google-classroom") {
      return googleClassroomSyncTime
        ? getRelativeTime(googleClassroomSyncTime)
        : "Never";
    } else {
      return connection.lastSync
        ? getRelativeTime(new Date(connection.lastSync))
        : "Never";
    }
  };

  // Check Google sign-in status on component mount
  useEffect(() => {
    checkGoogleSignInStatus();
    loadGoogleClassroomSyncTime();
    fetchLMSConnections();
  }, []);

  const checkGoogleSignInStatus = async () => {
    try {
      // Use getCurrentUser() instead of isSignedIn()
      const currentUser = await GoogleSignin.getCurrentUser();
      const isSignedIn = currentUser !== null;
      setIsGoogleSignedIn(isSignedIn);

      // If signed in, add Google Classroom to connections if not already there
      if (isSignedIn) {
        setConnections((prev) => {
          const hasGoogleClassroom = prev.some(
            (conn) => conn.type === "google-classroom"
          );
          if (!hasGoogleClassroom) {
            return [
              ...prev,
              {
                id: 2,
                name: "Google Classroom",
                url: "classroom.google.com",
                connected: true,
                type: "google-classroom",
              },
            ];
          }
          return prev;
        });
      } else {
        // Remove Google Classroom from connections if signed out
        setConnections((prev) =>
          prev.filter((conn) => conn.type !== "google-classroom")
        );
      }
    } catch (error) {
      console.error("Error checking Google sign-in status:", error);
      // If there's an error (like user not signed in), treat as not signed in
      setIsGoogleSignedIn(false);
      setConnections((prev) =>
        prev.filter((conn) => conn.type !== "google-classroom")
      );
    }
  };

  const initialiseIntegration = async () => {
      setIsGoogleClassroomSyncing(true);
      try {
        const authToken = await getToken()
        const tokens = await GoogleSignin.getTokens();

        // Make API request to your server with the auth token
        const response = await fetch(`${Constants.api}/api/integration/lms/google-classroom`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            token: tokens.accessToken
          })
        });

        if (response.ok) {
          // Save the sync time to AsyncStorage
          const now = new Date();
          await saveGoogleClassroomSyncTime(now);
          Alert.alert("Success", "Google Classroom refreshed successfully!");
        } else {
          Alert.alert("Error", "Failed to refresh Google Classroom");
        }
      } catch (error) {
        console.error("Refresh error:", error);
        Alert.alert("Error", "Failed to refresh connection");
      } finally {
        setIsGoogleClassroomSyncing(false);
      }
  }

  const handleGoogleClassroomSignIn = async () => {
    try {
      await GoogleSignin.signOut();
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      const tokens = await GoogleSignin.getTokens();
      console.log("tokens:", tokens);
      console.log("User Info:", userInfo);

      setIsGoogleSignedIn(true);
      setShowConnectionModal(false);

      // Add Google Classroom to connections
      setConnections((prev) => [
        ...prev,
        {
          id: 2,
          name: "Google Classroom",
          url: "classroom.google.com",
          connected: true,
          type: "google-classroom",
        },
      ]);

      await initialiseIntegration()
      await handleRefreshConnection(0, "google-classroom")
      
      const now = new Date();
      await saveGoogleClassroomSyncTime(now);

      Alert.alert("Success", "Google Classroom connected successfully!");
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert("Cancelled", "Sign in was cancelled");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert("In Progress", "Sign in is already in progress");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert("Error", "Play services not available");
      } else {
        Alert.alert("Error", "Something went wrong with Google Sign-In");
      }
    }
  };

  const handleGoogleClassroomSignOut = async () => {
    try {
      await GoogleSignin.signOut();
      setIsGoogleSignedIn(false);

      // Remove Google Classroom from connections
      setConnections((prev) =>
        prev.filter((conn) => conn.type !== "google-classroom")
      );

      // Clear Google Classroom sync time from AsyncStorage
      await AsyncStorage.removeItem("googleClassroomLastSync");
      setGoogleClassroomSyncTime(null);

      Alert.alert("Success", "Signed out of Google Classroom");
    } catch (error) {
      console.error("Sign out error:", error);
      Alert.alert("Error", "Failed to sign out");
    }
  };

  const handleRefreshConnection = async (
    connectionId: number,
    connectionType: string
  ) => {
    if (connectionType === "google-classroom") {
      setIsGoogleClassroomSyncing(true);
      try {
        const authToken = await getToken()
        const tokens = await GoogleSignin.getTokens();

        // Make API request to your server with the auth token
        const response = await fetch(`${Constants.api}/api/integration/lms/google-classroom/sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            token: tokens.accessToken
          })
        });

        if (response.ok) {
          // Save the sync time to AsyncStorage
          const now = new Date();
          await saveGoogleClassroomSyncTime(now);
          Alert.alert("Success", "Google Classroom refreshed successfully!");
        } else {
          Alert.alert("Error", "Failed to refresh Google Classroom");
        }
      } catch (error) {
        console.error("Refresh error:", error);
        Alert.alert("Error", "Failed to refresh connection");
      } finally {
        setIsGoogleClassroomSyncing(false);
      }
    } else {
      // Handle other LMS refresh logic here - you'll handle this yourself
      Alert.alert("Info", "Refreshing connection...");
    }
  };

  const handleRemoveConnection = (
    connectionId: number,
    connectionType: string
  ) => {
    if (connectionType === "google-classroom") {
      Alert.alert(
        "Sign Out",
        "Are you sure you want to sign out of Google Classroom?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Sign Out",
            style: "destructive",
            onPress: handleGoogleClassroomSignOut,
          },
        ]
      );
    } else {
      Alert.alert(
        "Remove Connection",
        "Are you sure you want to remove this connection?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => {
              setConnections((prev) =>
                prev.filter((conn) => conn.id !== connectionId)
              );
            },
          },
        ]
      );
    }
  };

  const handleUniversityWebsite = () => {
    Alert.alert(
      "Coming Soon",
      "University website integration will be available soon!"
    );
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

          {!isGoogleSignedIn && (
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
          )}

          {isGoogleSignedIn && (
            <View style={[styles.connectionOption, styles.connectedOption]}>
              <View style={styles.optionIconContainer}>
                <MaterialIcons name="class" size={24} color={colors.primary} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Google Classroom</Text>
                <Text style={styles.optionDescription}>
                  Already connected to Google Classroom
                </Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color="#4C5EFF" />
            </View>
          )}
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
                <Text style={styles.synced}>
                  Last sync: {getLastSyncTime(conn)}
                </Text>
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
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => handleRefreshConnection(conn.id, conn.type)}
                    disabled={
                      conn.type === "google-classroom" &&
                      isGoogleClassroomSyncing
                    }
                  >
                    {conn.type === "google-classroom" &&
                    isGoogleClassroomSyncing ? (
                      <Animated.View style={{ transform: [{ rotate: spin }] }}>
                        <Ionicons name="reload" size={16} color="#999" />
                      </Animated.View>
                    ) : (
                      <Ionicons name="reload" size={16} color="#444" />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => handleRemoveConnection(conn.id, conn.type)}
                  >
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
  connectedOption: {
    backgroundColor: "#F0F4FF",
    borderColor: "#4C5EFF",
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
