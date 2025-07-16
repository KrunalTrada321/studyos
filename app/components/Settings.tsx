"use client"
import type React from "react"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin"
import { useEffect, useState, useCallback } from "react"
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native"
import colors from "../utils/colors"
import { getToken } from "../utils/token"
import Constants from "../utils/constants"

const webClientId = "668482663649-2adcufrnk232m0g0n9qapu86gji3qhla.apps.googleusercontent.com"
GoogleSignin.configure({
  webClientId: webClientId,
  scopes: [
    "https://www.googleapis.com/auth/classroom.courses.readonly",
    "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
  ],
  offlineAccess: true,
  forceCodeForRefreshToken: true,
})

interface Props {
  onClose: () => void
}

interface Connection {
  id: string
  name: string
  url?: string
  domain?: string
  connected: boolean
  type: string
  lastSync?: string
  lastSynced?: string | null
  status?: string
  access_token?: string
}

interface ApiError {
  detail?: string
  message?: string
}

interface CustomPopupProps {
  visible: boolean
  title: string
  message: string
  type: "success" | "error" | "info" | "confirm"
  onClose: () => void
  onConfirm?: () => void
  confirmText?: string
  cancelText?: string
}

const CustomPopup: React.FC<CustomPopupProps> = ({
  visible,
  title,
  message,
  type,
  onClose,
  onConfirm,
  confirmText = "OK",
  cancelText = "Cancel",
}) => {
  const getIconName = () => {
    switch (type) {
      case "success":
        return "checkmark-circle"
      case "error":
        return "close-circle"
      case "info":
        return "information-circle"
      case "confirm":
        return "help-circle"
      default:
        return "information-circle"
    }
  }

  const getIconColor = () => {
    switch (type) {
      case "success":
        return "#4CAF50"
      case "error":
        return "#F44336"
      case "info":
        return "#2196F3"
      case "confirm":
        return "#FF9800"
      default:
        return "#2196F3"
    }
  }

  return (
    <Modal visible={visible} animationType="fade" transparent>
      {/* The outer TouchableWithoutFeedback is kept here for closing on outside tap for the popup */}
      <TouchableWithoutFeedback onPress={type !== "confirm" ? onClose : undefined}>
        <View style={styles.popupOverlay}>
          {/* Removed the inner TouchableWithoutFeedback from CustomPopup content */}
          <View style={styles.popupContent}>
            <View style={styles.popupHeader}>
              <Ionicons name={getIconName()} size={48} color={getIconColor()} />
              <Text style={styles.popupTitle}>{title}</Text>
            </View>
            <Text style={styles.popupMessage}>{message}</Text>
            <View style={styles.popupButtons}>
              {type === "confirm" ? (
                <>
                  <TouchableOpacity style={[styles.popupButton, styles.cancelButton]} onPress={onClose}>
                    <Text style={styles.cancelButtonText}>{cancelText}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.popupButton, styles.confirmButton]} onPress={onConfirm}>
                    <Text style={styles.confirmButtonText}>{confirmText}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity style={[styles.popupButton, styles.singleButton]} onPress={onClose}>
                  <Text style={styles.singleButtonText}>{confirmText}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

// Extracted CanvasModal component
interface CanvasModalProps {
  visible: boolean
  onClose: () => void
  canvasUrl: string
  setCanvasUrl: (url: string) => void
  canvasToken: string
  setCanvasToken: (token: string) => void
  isAddingCanvas: boolean
  handleAddCanvas: () => Promise<void>
  showUrlInfoAlert: () => void
  showTokenInfoAlert: () => void
}

const CanvasModal: React.FC<CanvasModalProps> = ({
  visible,
  onClose,
  canvasUrl,
  setCanvasUrl,
  canvasToken,
  setCanvasToken,
  isAddingCanvas,
  handleAddCanvas,
  showUrlInfoAlert,
  showTokenInfoAlert,
}) => (
  <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add Canvas LMS</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.black} />
          </TouchableOpacity>
        </View>
        <Text style={styles.modalSubtitle}>Enter your Canvas LMS details to connect your courses</Text>
        <View style={styles.inputContainer}>
          <View style={styles.inputLabelRow}>
            <Text style={styles.inputLabel}>Canvas URL</Text>
            <TouchableOpacity onPress={showUrlInfoAlert} style={styles.infoButton}>
              <Ionicons name="information-circle-outline" size={16} color="#666" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="https://your-school.instructure.com"
            value={canvasUrl}
            onChangeText={setCanvasUrl}
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>
        <View style={styles.inputContainer}>
          <View style={styles.inputLabelRow}>
            <Text style={styles.inputLabel}>Access Token</Text>
            <TouchableOpacity onPress={showTokenInfoAlert} style={styles.infoButton}>
              <Ionicons name="information-circle-outline" size={16} color="#666" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your Canvas access token"
            value={canvasToken}
            onChangeText={setCanvasToken}
            secureTextEntry={true}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.addButton,
            (!canvasUrl.trim() || !canvasToken.trim() || isAddingCanvas) && styles.disabledButton,
          ]}
          onPress={handleAddCanvas}
          disabled={!canvasUrl.trim() || !canvasToken.trim() || isAddingCanvas}
        >
          <Text style={styles.addButtonText}>{isAddingCanvas ? "Adding..." : "Add Canvas LMS"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
)

// Extracted MoodleModal component
interface MoodleModalProps {
  visible: boolean
  onClose: () => void
  moodleDomain: string
  setMoodleDomain: (domain: string) => void
  moodleUsername: string
  setMoodleUsername: (username: string) => void
  moodlePassword: string
  setMoodlePassword: (password: string) => void
  isAddingMoodle: boolean
  handleAddMoodle: () => Promise<void>
  showMoodleDomainInfoAlert: () => void
  showMoodleCredentialsInfoAlert: () => void
}

const MoodleModal: React.FC<MoodleModalProps> = ({
  visible,
  onClose,
  moodleDomain,
  setMoodleDomain,
  moodleUsername,
  setMoodleUsername,
  moodlePassword,
  setMoodlePassword,
  isAddingMoodle,
  handleAddMoodle,
  showMoodleDomainInfoAlert,
  showMoodleCredentialsInfoAlert,
}) => (
  <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add Moodle LMS</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.black} />
          </TouchableOpacity>
        </View>
        <Text style={styles.modalSubtitle}>Enter your Moodle LMS details to connect your courses</Text>
        <View style={styles.inputContainer}>
          <View style={styles.inputLabelRow}>
            <Text style={styles.inputLabel}>Moodle Url</Text>
            <TouchableOpacity onPress={showMoodleDomainInfoAlert} style={styles.infoButton}>
              <Ionicons name="information-circle-outline" size={16} color="#666" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., swiftsaas.moodlecloud.com"
            value={moodleDomain}
            onChangeText={setMoodleDomain}
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>
        <View style={styles.inputContainer}>
          <View style={styles.inputLabelRow}>
            <Text style={styles.inputLabel}>Username</Text>
            <TouchableOpacity onPress={showMoodleCredentialsInfoAlert} style={styles.infoButton}>
              <Ionicons name="information-circle-outline" size={16} color="#666" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Your Moodle username"
            value={moodleUsername}
            onChangeText={setMoodleUsername}
            autoCapitalize="none"
          />
        </View>
        <View style={styles.inputContainer}>
          <View style={styles.inputLabelRow}>
            <Text style={styles.inputLabel}>Password</Text>
            <TouchableOpacity onPress={showMoodleCredentialsInfoAlert} style={styles.infoButton}>
              <Ionicons name="information-circle-outline" size={16} color="#666" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Your Moodle password"
            value={moodlePassword}
            onChangeText={setMoodlePassword}
            secureTextEntry={true}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.addButton,
            (!moodleDomain.trim() || !moodleUsername.trim() || !moodlePassword.trim() || isAddingMoodle) &&
              styles.disabledButton,
          ]}
          onPress={handleAddMoodle}
          disabled={!moodleDomain.trim() || !moodleUsername.trim() || !moodlePassword.trim() || isAddingMoodle}
        >
          <Text style={styles.addButtonText}>{isAddingMoodle ? "Adding..." : "Add Moodle LMS"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
)

export default function SettingsScreen({ onClose }: Props) {
  const [darkMode, setDarkMode] = useState<boolean>(true)
  const [learningReminders, setLearningReminders] = useState<boolean>(true)
  const [assignmentAlerts, setAssignmentAlerts] = useState<boolean>(false)
  const [showConnectionModal, setShowConnectionModal] = useState<boolean>(false)
  const [showCanvasModal, setShowCanvasModal] = useState<boolean>(false)
  const [showMoodleModal, setShowMoodleModal] = useState<boolean>(false) // New state for Moodle modal
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState<boolean>(false)
  const [connections, setConnections] = useState<Connection[]>([])
  const [googleClassroomSyncTime, setGoogleClassroomSyncTime] = useState<Date | null>(null)
  const [isGoogleClassroomSyncing, setIsGoogleClassroomSyncing] = useState<boolean>(false)
  const [syncingConnections, setSyncingConnections] = useState<Set<string>>(new Set())
  const [isLoadingConnections, setIsLoadingConnections] = useState<boolean>(false)

  // Canvas form state
  const [canvasUrl, setCanvasUrl] = useState<string>("")
  const [canvasToken, setCanvasToken] = useState<string>("")
  const [isAddingCanvas, setIsAddingCanvas] = useState<boolean>(false)

  // Moodle form state
  const [moodleDomain, setMoodleDomain] = useState<string>("")
  const [moodleUsername, setMoodleUsername] = useState<string>("")
  const [moodlePassword, setMoodlePassword] = useState<string>("")
  const [isAddingMoodle, setIsAddingMoodle] = useState<boolean>(false)

  // Popup state - Fixed to prevent re-renders during typing
  const [popupVisible, setPopupVisible] = useState<boolean>(false)
  const [popupTitle, setPopupTitle] = useState<string>("")
  const [popupMessage, setPopupMessage] = useState<string>("")
  const [popupType, setPopupType] = useState<"success" | "error" | "info" | "confirm">("info")
  const [popupOnConfirm, setPopupOnConfirm] = useState<(() => void) | undefined>(undefined)
  const [popupConfirmText, setPopupConfirmText] = useState<string>("OK")
  const [popupCancelText, setPopupCancelText] = useState<string>("Cancel")

  // Animation values
  const [spinValue] = useState(new Animated.Value(0))

  const showPopup = useCallback(
    (
      title: string,
      message: string,
      type: "success" | "error" | "info" | "confirm",
      onConfirm?: () => void,
      confirmText?: string,
      cancelText?: string,
    ) => {
      setPopupTitle(title)
      setPopupMessage(message)
      setPopupType(type)
      setPopupOnConfirm(() => onConfirm)
      setPopupConfirmText(confirmText || "OK")
      setPopupCancelText(cancelText || "Cancel")
      setPopupVisible(true)
    },
    [],
  )

  const hidePopup = useCallback(() => {
    setPopupVisible(false)
  }, [])

  // Spinning animation for sync buttons
  useEffect(() => {
    if (isGoogleClassroomSyncing || syncingConnections.size > 0) {
      const spinAnimation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      )
      spinAnimation.start()
      return () => spinAnimation.stop()
    }
  }, [isGoogleClassroomSyncing, syncingConnections, spinValue])

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  // Load Google Classroom sync time from AsyncStorage
  const loadGoogleClassroomSyncTime = async (): Promise<void> => {
    try {
      const syncTimeString = await AsyncStorage.getItem("googleClassroomLastSync")
      if (syncTimeString) {
        setGoogleClassroomSyncTime(new Date(syncTimeString))
      }
    } catch (error) {
      console.error("Error loading Google Classroom sync time:", error)
    }
  }

  // Save Google Classroom sync time to AsyncStorage
  const saveGoogleClassroomSyncTime = async (date: Date): Promise<void> => {
    try {
      await AsyncStorage.setItem("googleClassroomLastSync", date.toISOString())
      setGoogleClassroomSyncTime(date)
    } catch (error) {
      console.error("Error saving Google Classroom sync time:", error)
    }
  }

  const fetchLMSConnections = async (): Promise<void> => {
    setIsLoadingConnections(true)
    try {
      const authToken = await getToken()
      const response = await fetch(`${Constants.api}/api/integration/lms`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      if (response.ok) {
        const lmsConnections: Connection[] = await response.json()
        // Transform API response to match our Connection interface
        const transformedConnections = lmsConnections.map((conn) => ({
          ...conn,
          connected: conn.status === "Connected",
          url: conn.domain || conn.url,
        }))
        setConnections((prev) => {
          // Keep Google Classroom if it exists, add API connections
          const googleClassroom = prev.find((c) => c.type === "google-classroom")
          return googleClassroom ? [googleClassroom, ...transformedConnections] : transformedConnections
        })
      }
    } catch (error) {
      console.error("Error fetching LMS connections:", error)
    } finally {
      setIsLoadingConnections(false)
    }
  }

  // Delete LMS integration
  const deleteLMSIntegration = async (integrationId: string): Promise<boolean> => {
    try {
      const authToken = await getToken()
      const response = await fetch(`${Constants.api}/api/integration/lms/${integrationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      if (response.ok) {
        return true
      } else {
        const errorData: ApiError = await response.json()
        showPopup("Error", errorData.detail || "Failed to remove integration", "error")
        return false
      }
    } catch (error) {
      console.error("Delete integration error:", error)
      showPopup("Error", "Failed to remove integration", "error")
      return false
    }
  }

  const getRelativeTime = (date: Date): string => {
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInMinutes < 1) {
      return "Just now"
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getLastSyncTime = (connection: Connection): string => {
    if (connection.type === "google-classroom") {
      return googleClassroomSyncTime ? getRelativeTime(googleClassroomSyncTime) : "Never"
    } else {
      const syncTime = connection.lastSynced || connection.lastSync
      return syncTime ? getRelativeTime(new Date(syncTime)) : "Never"
    }
  }

  // Check Google sign-in status on component mount
  useEffect(() => {
    checkGoogleSignInStatus()
    loadGoogleClassroomSyncTime()
    fetchLMSConnections()
  }, [])

  const checkGoogleSignInStatus = async (): Promise<void> => {
    try {
      const currentUser = await GoogleSignin.getCurrentUser()
      const isSignedIn = currentUser !== null
      setIsGoogleSignedIn(isSignedIn)
      if (isSignedIn) {
        setConnections((prev) => {
          const hasGoogleClassroom = prev.some((conn) => conn.type === "google-classroom")
          if (!hasGoogleClassroom) {
            return [
              {
                id: "google-classroom",
                name: "Google Classroom",
                url: "classroom.google.com",
                connected: true,
                type: "google-classroom",
              },
              ...prev,
            ]
          }
          return prev
        })
      } else {
        setConnections((prev) => prev.filter((conn) => conn.type !== "google-classroom"))
      }
    } catch (error) {
      console.error("Error checking Google sign-in status:", error)
      setIsGoogleSignedIn(false)
      setConnections((prev) => prev.filter((conn) => conn.type !== "google-classroom"))
    }
  }

  const initialiseIntegration = async (): Promise<void> => {
    setIsGoogleClassroomSyncing(true)
    try {
      const authToken = await getToken()
      const tokens = await GoogleSignin.getTokens()
      const response = await fetch(`${Constants.api}/api/integration/lms/google-classroom`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ token: tokens.accessToken }),
      })
      if (response.ok) {
        const now = new Date()
        await saveGoogleClassroomSyncTime(now)
        showPopup("Success", "Google Classroom refreshed successfully!", "success")
      } else {
        showPopup("Error", "Failed to refresh Google Classroom", "error")
      }
    } catch (error) {
      console.error("Refresh error:", error)
      showPopup("Error", "Failed to refresh connection", "error")
    } finally {
      setIsGoogleClassroomSyncing(false)
    }
  }

  const handleGoogleClassroomSignIn = async (): Promise<void> => {
    try {
      await GoogleSignin.signOut()
      await GoogleSignin.hasPlayServices()
      const userInfo = await GoogleSignin.signIn()
      const tokens = await GoogleSignin.getTokens()
      console.log("tokens:", tokens)
      console.log("User Info:", userInfo)
      setIsGoogleSignedIn(true)
      setShowConnectionModal(false)
      setConnections((prev) => [
        {
          id: "google-classroom",
          name: "Google Classroom",
          url: "classroom.google.com",
          connected: true,
          type: "google-classroom",
        },
        ...prev.filter((conn) => conn.type !== "google-classroom"),
      ])
      await initialiseIntegration()
      await handleRefreshConnection("google-classroom", "google-classroom")
      const now = new Date()
      await saveGoogleClassroomSyncTime(now)
      showPopup("Success", "Google Classroom connected successfully!", "success")
    } catch (error: any) {
      console.error("Google Sign-In Error:", error)
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        showPopup("Cancelled", "Sign in was cancelled", "info")
      } else if (error.code === statusCodes.IN_PROGRESS) {
        showPopup("In Progress", "Sign in is already in progress", "info")
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        showPopup("Error", "Play services not available", "error")
      } else {
        showPopup("Error", "Something went wrong with Google Sign-In", "error")
      }
    }
  }

  const handleGoogleClassroomSignOut = async (): Promise<void> => {
    try {
      await GoogleSignin.signOut()
      setIsGoogleSignedIn(false)
      setConnections((prev) => prev.filter((conn) => conn.type !== "google-classroom"))
      await AsyncStorage.removeItem("googleClassroomLastSync")
      setGoogleClassroomSyncTime(null)
      showPopup("Success", "Signed out of Google Classroom", "success")
    } catch (error) {
      console.error("Sign out error:", error)
      showPopup("Error", "Failed to sign out", "error")
    }
  }

  const handleAddCanvas = async (): Promise<void> => {
    if (!canvasUrl.trim() || !canvasToken.trim()) {
      showPopup("Error", "Please enter both Canvas URL and access token", "error")
      return
    }
    setIsAddingCanvas(true)
    try {
      const authToken = await getToken()
      const response = await fetch(`${Constants.api}/api/integration/lms/canvas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          url: canvasUrl.trim(),
          token: canvasToken.trim(),
        }),
      })
      if (response.ok) {
        showPopup("Success", "Canvas LMS integration added successfully!", "success")
        setShowCanvasModal(false)
        setCanvasUrl("")
        setCanvasToken("")
        // Refresh connections to show the new Canvas integration
        await fetchLMSConnections()
      } else {
        const errorData: ApiError = await response.json()
        showPopup("Error", errorData.detail || "Failed to add Canvas LMS", "error")
      }
    } catch (error) {
      console.error("Canvas add error:", error)
      showPopup("Error", "Failed to add Canvas LMS integration", "error")
    } finally {
      setIsAddingCanvas(false)
    }
  }

  const handleAddMoodle = async (): Promise<void> => {
    if (!moodleDomain.trim() || !moodleUsername.trim() || !moodlePassword.trim()) {
      showPopup("Error", "Please enter Moodle Domain, Username, and Password", "error")
      return
    }
    setIsAddingMoodle(true)
    try {
      const authToken = await getToken()
      const response = await fetch(`${Constants.api}/api/integration/lms/moodle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          url: moodleDomain.trim(), // API expects 'url' for domain
          username: moodleUsername.trim(),
          password: moodlePassword.trim(),
        }),
      })
      if (response.ok) {
        showPopup("Success", "Moodle LMS integration added successfully!", "success")
        setShowMoodleModal(false)
        setMoodleDomain("")
        setMoodleUsername("")
        setMoodlePassword("")
        // Refresh connections to show the new Moodle integration
        await fetchLMSConnections()
      } else {
        const errorData: ApiError = await response.json()
        showPopup("Error", errorData.detail || "Failed to add Moodle LMS", "error")
      }
    } catch (error) {
      console.error("Moodle add error:", error)
      showPopup("Error", "Failed to add Moodle LMS integration", "error")
    } finally {
      setIsAddingMoodle(false)
    }
  }

  const handleRefreshConnection = async (connectionId: string, connectionType: string): Promise<void> => {
    // Check if connection is expired
    const connection = connections.find((conn) => conn.id === connectionId)
    if (connection && connection.status === "Expired") {
      showPopup("Connection Expired", "This connection has expired. Please reconnect to sync.", "info")
      return
    }

    if (connectionType === "google-classroom") {
      setIsGoogleClassroomSyncing(true)
      try {
        const authToken = await getToken()
        const tokens = await GoogleSignin.getTokens()
        const response = await fetch(`${Constants.api}/api/integration/lms/google-classroom/sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ token: tokens.accessToken }),
        })
        if (response.ok) {
          const now = new Date()
          await saveGoogleClassroomSyncTime(now)
          showPopup("Success", "Google Classroom refreshed successfully!", "success")
        } else {
          showPopup("Error", "Failed to refresh Google Classroom", "error")
        }
      } catch (error) {
        console.error("Refresh error:", error)
        showPopup("Error", "Failed to refresh connection", "error")
      } finally {
        setIsGoogleClassroomSyncing(false)
      }
    } else if (connectionType === "canvas") {
      setSyncingConnections((prev) => new Set(prev).add(connectionId))
      try {
        const authToken = await getToken()
        const response = await fetch(`${Constants.api}/api/integration/lms/canvas/${connectionId}/sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        })
        if (response.ok) {
          showPopup("Success", "Canvas LMS synced successfully!", "success")
          // Refresh connections to update last sync time
          await fetchLMSConnections()
        } else {
          const errorData: ApiError = await response.json()
          showPopup("Error", errorData.detail || "Failed to sync Canvas LMS", "error")
        }
      } catch (error) {
        console.error("Canvas sync error:", error)
        showPopup("Error", "Failed to sync Canvas LMS", "error")
      } finally {
        setSyncingConnections((prev) => {
          const newSet = new Set(prev)
          newSet.delete(connectionId)
          return newSet
        })
      }
    } else if (connectionType === "moodle") {
      setSyncingConnections((prev) => new Set(prev).add(connectionId))
      try {
        const authToken = await getToken()
        const response = await fetch(`${Constants.api}/api/integration/lms/moodle/${connectionId}/sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        })
        if (response.ok) {
          showPopup("Success", "Moodle LMS synced successfully!", "success")
          // Refresh connections to update last sync time
          await fetchLMSConnections()
        } else {
          const errorData: ApiError = await response.json()
          showPopup("Error", errorData.detail || "Failed to sync Moodle LMS", "error")
        }
      } catch (error) {
        console.error("Moodle sync error:", error)
        showPopup("Error", "Failed to sync Moodle LMS", "error")
      } finally {
        setSyncingConnections((prev) => {
          const newSet = new Set(prev)
          newSet.delete(connectionId)
          return newSet
        })
      }
    } else {
      showPopup("Info", "Refreshing connection...", "info")
    }
  }

  const handleRemoveConnection = (connectionId: string, connectionType: string): void => {
    if (connectionType === "google-classroom") {
      showPopup(
        "Sign Out",
        "Are you sure you want to sign out of Google Classroom?",
        "confirm",
        handleGoogleClassroomSignOut,
        "Sign Out",
        "Cancel",
      )
    } else {
      showPopup(
        "Remove Connection",
        "Are you sure you want to remove this connection?",
        "confirm",
        async () => {
          const success = await deleteLMSIntegration(connectionId)
          if (success) {
            setConnections((prev) => prev.filter((conn) => conn.id !== connectionId))
            showPopup("Success", "Connection removed successfully", "success")
          }
        },
        "Remove",
        "Cancel",
      )
    }
  }

  const handleCanvasOption = (): void => {
    setShowConnectionModal(false)
    setShowCanvasModal(true)
  }

  const handleMoodleOption = (): void => {
    setShowConnectionModal(false)
    setShowMoodleModal(true)
  }

  const showUrlInfoAlert = useCallback((): void => {
    showPopup(
      "Canvas URL",
      "Enter your Canvas LMS URL. This is typically in the format:\n\n• https://[school].instructure.com\n• https://canvas.[school].edu\n\nExample: https://myschool.instructure.com",
      "info",
    )
  }, [showPopup])

  const showTokenInfoAlert = useCallback((): void => {
    showPopup(
      "Access Token",
      "To get your Canvas access token:\n\n1. Log into Canvas\n2. Go to Account → Settings\n3. Scroll to 'Approved Integrations'\n4. Click '+ New Access Token'\n5. Enter a purpose (e.g., 'Mobile App')\n6. Click 'Generate Token'\n7. Copy the token immediately (it won't be shown again)",
      "info",
    )
  }, [showPopup])

  const showMoodleDomainInfoAlert = useCallback((): void => {
    showPopup(
      "Moodle Domain",
      "Enter your Moodle LMS domain. This is the base URL of your Moodle site.\n\nExample: swiftsaas.moodlecloud.com",
      "info",
    )
  }, [showPopup])

  const showMoodleCredentialsInfoAlert = useCallback((): void => {
    showPopup(
      "Moodle Credentials",
      "Enter your Moodle username and password. Ensure that web services are enabled for your Moodle account to allow connection.",
      "info",
    )
  }, [showPopup])

  const ConnectionModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showConnectionModal}
      onRequestClose={() => setShowConnectionModal(false)}
    >
      <TouchableWithoutFeedback onPress={() => setShowConnectionModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
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
              <TouchableOpacity style={styles.connectionOption} onPress={handleCanvasOption}>
                <View style={styles.optionIconContainer}>
                  <MaterialIcons name="class" size={24} color={colors.primary} />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Canvas LMS</Text>
                  <Text style={styles.optionDescription}>Connect to your Canvas learning management system</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.connectionOption} onPress={handleMoodleOption}>
                <View style={styles.optionIconContainer}>
                  <Ionicons name="school" size={24} color={colors.primary} />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Moodle LMS</Text>
                  <Text style={styles.optionDescription}>Connect to your Moodle learning management system</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
              {!isGoogleSignedIn && (
                <TouchableOpacity style={styles.connectionOption} onPress={handleGoogleClassroomSignIn}>
                  <View style={styles.optionIconContainer}>
                    <MaterialIcons name="class" size={24} color={colors.primary} />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Google Classroom</Text>
                    <Text style={styles.optionDescription}>Connect to your Google Classroom courses</Text>
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
                    <Text style={styles.optionDescription}>Already connected to Google Classroom</Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={20} color="#4C5EFF" />
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )

  const getConnectionStatus = (connection: Connection): string => {
    if (connection.type === "google-classroom") {
      return "Connected"
    }
    return connection.status || (connection.connected ? "Connected" : "Disconnected")
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Connected":
        return "#4C5EFF"
      case "Expired":
        return "#FF4E4E"
      default:
        return "#888"
    }
  }

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
          Connect to your school's websites to automatically import assignments and course materials.
        </Text>
        {isLoadingConnections ? (
          <View style={styles.loadingContainer}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Ionicons name="reload" size={24} color={colors.primary} />
            </Animated.View>
            <Text style={styles.loadingText}>Loading connections...</Text>
          </View>
        ) : (
          connections.map((conn) => {
            const status = getStatusColor(getConnectionStatus(conn))
            const isCurrentlySyncing =
              (conn.type === "google-classroom" && isGoogleClassroomSyncing) || syncingConnections.has(conn.id)
            const isExpired = conn.status === "Expired"
            return (
              <View key={conn.id} style={styles.connectionBox}>
                <View style={styles.connectionRow}>
                  {/* Left Side: Info */}
                  <View>
                    <Text style={styles.connectionTitle}>{conn.name}</Text>
                    <Text style={styles.connectionUrl}>{conn.url || conn.domain}</Text>
                    <Text style={styles.synced}>Last sync: {getLastSyncTime(conn)}</Text>
                    <View
                      style={[styles.connectedPill, { backgroundColor: status === "#4C5EFF" ? "#E5E9FF" : "#FFE5E5" }]}
                    >
                      <Text style={[styles.connectedText, { color: status }]}>{getConnectionStatus(conn)}</Text>
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
                        style={[styles.iconButton, isExpired && styles.disabledIconButton]}
                        onPress={() => handleRefreshConnection(conn.id, conn.type)}
                        disabled={isCurrentlySyncing || isExpired}
                      >
                        {isCurrentlySyncing ? (
                          <Animated.View style={{ transform: [{ rotate: spin }] }}>
                            <Ionicons name="reload" size={16} color="#999" />
                          </Animated.View>
                        ) : (
                          <Ionicons name="reload" size={16} color={isExpired ? "#ccc" : "#444"} />
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
            )
          })
        )}
        <TouchableOpacity onPress={() => setShowConnectionModal(true)} style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add Connection</Text>
        </TouchableOpacity>
        {/* Account */}
        <Text style={{ fontWeight: "600", color: colors.black, marginVertical: 10 }}>Account</Text>
        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Privacy Settings</Text>
        </TouchableOpacity>
        {/* About */}
        <Text style={{ fontWeight: "600", color: colors.black, marginVertical: 10 }}>About</Text>
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
      <CanvasModal
        visible={showCanvasModal}
        onClose={() => setShowCanvasModal(false)}
        canvasUrl={canvasUrl}
        setCanvasUrl={setCanvasUrl}
        canvasToken={canvasToken}
        setCanvasToken={setCanvasToken}
        isAddingCanvas={isAddingCanvas}
        handleAddCanvas={handleAddCanvas}
        showUrlInfoAlert={showUrlInfoAlert}
        showTokenInfoAlert={showTokenInfoAlert}
      />
      <MoodleModal
        visible={showMoodleModal}
        onClose={() => setShowMoodleModal(false)}
        moodleDomain={moodleDomain}
        setMoodleDomain={setMoodleDomain}
        moodleUsername={moodleUsername}
        setMoodleUsername={setMoodleUsername}
        moodlePassword={moodlePassword}
        setMoodlePassword={setMoodlePassword}
        isAddingMoodle={isAddingMoodle}
        handleAddMoodle={handleAddMoodle}
        showMoodleDomainInfoAlert={showMoodleDomainInfoAlert}
        showMoodleCredentialsInfoAlert={showMoodleCredentialsInfoAlert}
      />
      {/* Custom Popup - Fixed to prevent re-renders */}
      <CustomPopup
        visible={popupVisible}
        title={popupTitle}
        message={popupMessage}
        type={popupType}
        onClose={hidePopup}
        onConfirm={popupOnConfirm}
        confirmText={popupConfirmText}
        cancelText={popupCancelText}
      />
    </View>
  )
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
  disabledButton: {
    backgroundColor: "#ccc",
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
  // Modal styles with simple fade
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
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
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
  // Canvas modal styles
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F1F47",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    color: "black",
    borderColor: "#E0E0F0",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: "#F6F6FC",
  },
  helpText: {
    fontSize: 12,
    color: "#777",
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 16,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#F6F6FC",
    borderRadius: 12,
    marginBottom: 10,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#666",
  },
  inputLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoButton: {
    padding: 4,
  },
  disabledIconButton: {
    opacity: 0.5,
  },
  // Custom Popup Styles
  popupOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  popupContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "85%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  popupHeader: {
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  popupTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
  },
  popupMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    padding: 20,
    lineHeight: 22,
  },
  popupButtons: {
    flexDirection: "row",
    padding: 20,
    paddingTop: 0,
  },
  popupButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  singleButton: {
    backgroundColor: colors.primary,
  },
  confirmButton: {
    backgroundColor: "#ff4757",
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: "#f1f2f6",
    marginRight: 10,
  },
  singleButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
})
