import { MaterialIcons } from "@expo/vector-icons"
import { Camera, CameraView } from "expo-camera"
import { useAudioRecorder, AudioModule, RecordingPresets } from "expo-audio"
import type React from "react"
import { useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ListRenderItem,
} from "react-native"
import { colors } from "../utils/colors"
import Constants from "../utils/constants"
import { getToken } from "../utils/token"

const { width } = Dimensions.get("window")

interface CapturedImage {
  id: number
  uri: string
  timestamp: string
}

interface RecordingState {
  isRecording: boolean
  isPaused: boolean
  duration: number
  uri: string | null
}

type Mode = "record" | "scan"

const CaptureScreen: React.FC = () => {
  const [mode, setMode] = useState<Mode>("record")
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [hasAudioPermission, setHasAudioPermission] = useState<boolean | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([])
  const [selectedImage, setSelectedImage] = useState<CapturedImage | null>(null)
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false)
  const [recording, setRecording] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    uri: null,
  })
  const [timer, setTimer] = useState<number>(0)
  const cameraRef = useRef<CameraView>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Use the audio recorder hook with low quality for smaller files
  const audioRecorder = useAudioRecorder(RecordingPresets.LOW_QUALITY)

  useEffect(() => {
    if (mode === "scan") {
      ;(async () => {
        const { status } = await Camera.requestCameraPermissionsAsync()
        setHasPermission(status === "granted")
      })()
    } else if (mode === "record") {
      ;(async () => {
        try {
          const status = await AudioModule.requestRecordingPermissionsAsync()
          if (!status.granted) {
            setHasAudioPermission(false)
            Alert.alert("Permission Required", "Permission to access microphone was denied")
          } else {
            setHasAudioPermission(true)
          }
        } catch (error) {
          console.error("Audio permission error:", error)
          setHasAudioPermission(false)
        }
      })()
    }
  }, [mode])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const startRecording = async (): Promise<void> => {
    try {
      // Check permissions first
      const status = await AudioModule.requestRecordingPermissionsAsync()
      if (!status.granted) {
        Alert.alert("Permission Required", "Audio recording permission is required")
        return
      }

      // Prepare and start recording
      await audioRecorder.prepareToRecordAsync()
      audioRecorder.record()
      
      setRecording((prev) => ({ ...prev, isRecording: true, isPaused: false }))
      setTimer(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev >= 21600) {
            // 6 hours limit
            stopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)
    } catch (err) {
      console.error("Failed to start recording", err)
      Alert.alert("Error", "Failed to start recording. Please try again.")
    }
  }

  const pauseRecording = async (): Promise<void> => {
    try {
      await audioRecorder.pause()
      setRecording((prev) => ({ ...prev, isPaused: true }))
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    } catch (err) {
      console.error("Failed to pause recording", err)
      Alert.alert("Error", "Failed to pause recording")
    }
  }

  const resumeRecording = async (): Promise<void> => {
    try {
      audioRecorder.record()
      setRecording((prev) => ({ ...prev, isPaused: false }))

      // Resume timer
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev >= 21600) {
            stopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)
    } catch (err) {
      console.error("Failed to resume recording", err)
      Alert.alert("Error", "Failed to resume recording")
    }
  }

  const stopRecording = async (): Promise<void> => {
    try {
      // Stop recording - the URI will be available on audioRecorder.uri
      await audioRecorder.stop()
      const uri = audioRecorder.uri

      setRecording({
        isRecording: false,
        isPaused: false,
        duration: timer,
        uri,
      })

      setTimer(0)

      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      if (uri) {
        await uploadRecording(uri)
      }
    } catch (err) {
      console.error("Failed to stop recording", err)
      Alert.alert("Error", "Failed to stop recording")
    }
  }

  const uploadRecording = async (uri: string): Promise<void> => {
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("file", {
        uri,
        name: "recording.mp3",
        type: "audio/mpeg",
      } as any)

      const token = await getToken()

      const response = await fetch(`${Constants.api}/api/ai/analyse-recording`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Recording Response:", data)

      Alert.alert("Success", data.message || "Recording processed successfully!")
      setTimer(0)
    } catch (err) {
      console.error("Upload recording error:", err)
      Alert.alert("Error", "Failed to upload recording. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const captureImage = async (): Promise<void> => {
    if (!cameraRef.current || capturedImages.length >= 100) return

    setLoading(true)

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.3,
        skipProcessing: true,
      })

      if (photo) {
        setCapturedImages((prev) => [
          ...prev,
          {
            id: Date.now(),
            uri: photo.uri,
            timestamp: new Date().toLocaleTimeString(),
          },
        ])
      }
    } catch (err) {
      console.error("Capture error:", err)
      Alert.alert("Error", "Failed to capture image")
    } finally {
      setLoading(false)
    }
  }

  const removeImage = (id: number): void => {
    setCapturedImages((prev) => prev.filter((img) => img.id !== id))
  }

  const uploadAllImages = async (): Promise<void> => {
    if (capturedImages.length === 0) {
      Alert.alert("No Images", "Please capture some images first")
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()

      capturedImages.forEach((image, index) => {
        formData.append("files", {
          uri: image.uri,
          name: `scan_${index + 1}.jpg`,
          type: "image/jpeg",
        } as any)
      })

      const token = await getToken()

      const response = await fetch(`${Constants.api}/api/ai/scan-notes`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Scan Response:", data)

      Alert.alert("Success", data.message || "All images processed successfully!")
      setCapturedImages([])
    } catch (err) {
      console.error("Upload error:", err)
      Alert.alert("Error", "Failed to upload images. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const renderCapturedImage: ListRenderItem<CapturedImage> = ({ item }) => (
    <TouchableOpacity style={styles.thumbnailContainer} onPress={() => setSelectedImage(item)}>
      <Image source={{ uri: item.uri }} style={styles.thumbnail} />
      <TouchableOpacity style={styles.deleteButton} onPress={() => removeImage(item.id)}>
        <MaterialIcons name="close" size={16} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.thumbnailTime}>{item.timestamp}</Text>
    </TouchableOpacity>
  )

  if (hasPermission === false || (mode === "record" && hasAudioPermission === false)) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <MaterialIcons name={mode === "record" ? "mic" : "camera-alt"} size={64} color="#ccc" />
          <Text style={styles.permissionText}>{mode === "record" ? "Microphone" : "Camera"} permission required</Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={async () => {
              if (mode === "record") {
                const status = await AudioModule.requestRecordingPermissionsAsync()
                setHasAudioPermission(status.granted)
              } else {
                const { status } = await Camera.requestCameraPermissionsAsync()
                setHasPermission(status === "granted")
              }
            }}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Mode Selector */}
      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.modeBtn, mode === "record" && styles.activeModeBtn]}
          onPress={() => setMode("record")}
        >
          <MaterialIcons name="mic" size={20} color={mode === "record" ? "#fff" : "#666"} />
          <Text style={mode === "record" ? styles.activeModeText : styles.inactiveModeText}>Record</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeBtn, mode === "scan" && styles.activeModeBtn]}
          onPress={() => setMode("scan")}
        >
          <MaterialIcons name="camera-alt" size={20} color={mode === "scan" ? "#fff" : "#666"} />
          <Text style={mode === "scan" ? styles.activeModeText : styles.inactiveModeText}>Scan</Text>
        </TouchableOpacity>
      </View>

      {/* Image Quota */}
      {mode === "scan" && (
        <View style={styles.quotaContainer}>
          <Text style={styles.quotaText}>{capturedImages.length} / 100 images</Text>
        </View>
      )}

      {/* Main Content */}
      <View style={styles.mainContent}>
        {mode === "record" ? (
          <View style={styles.recordSection}>
            {/* Recording Timer */}
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>{formatTime(timer)}</Text>
              <Text style={styles.timerLabel}>
                {recording.isRecording ? (recording.isPaused ? "Paused" : "Recording") : "Ready"}
              </Text>
            </View>

            {/* Recording Controls */}
            <View style={styles.recordingControls}>
              {!recording.isRecording ? (
                <TouchableOpacity style={styles.recordButton} onPress={startRecording} disabled={loading}>
                  <MaterialIcons name="mic" size={40} color="#fff" />
                </TouchableOpacity>
              ) : (
                <View style={styles.recordingButtonsContainer}>
                  <TouchableOpacity
                    style={styles.pauseButton}
                    onPress={recording.isPaused ? resumeRecording : pauseRecording}
                  >
                    <MaterialIcons name={recording.isPaused ? "play-arrow" : "pause"} size={32} color="#fff" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.stopButton} onPress={stopRecording} disabled={loading}>
                    {loading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <MaterialIcons name="stop" size={32} color="#fff" />
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <Text style={styles.recordText}>
              {!recording.isRecording
                ? "Tap to start recording"
                : recording.isPaused
                  ? "Recording paused"
                  : "Recording in progress..."}
            </Text>

            {/* Recording Info */}
            <View style={styles.recordingInfo}>
              <Text style={styles.infoText}>Max duration: 6 hours</Text>
            </View>
          </View>
        ) : (
          <View style={styles.scanSection}>
            {/* Camera Preview */}
            <View style={styles.cameraContainer}>
              <CameraView ref={cameraRef} style={styles.cameraPreview} facing="back" />
              <View style={styles.cameraOverlay}>
                {/* Focus Box */}
                <View style={styles.focusBox}>
                  <View style={[styles.focusCorner, styles.focusCornerTL]} />
                  <View style={[styles.focusCorner, styles.focusCornerTR]} />
                  <View style={[styles.focusCorner, styles.focusCornerBL]} />
                  <View style={[styles.focusCorner, styles.focusCornerBR]} />
                </View>
              </View>
            </View>

            {/* Capture Controls */}
            <View style={styles.captureControls}>
              <TouchableOpacity
                style={[
                  styles.captureButton,
                  (loading || capturedImages.length >= 100) && styles.captureButtonDisabled,
                ]}
                onPress={captureImage}
                disabled={loading || capturedImages.length >= 100}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="large" />
                ) : (
                  <MaterialIcons name="camera" size={32} color="#fff" />
                )}
              </TouchableOpacity>

              {capturedImages.length > 0 && (
                <TouchableOpacity style={styles.previewButton} onPress={() => setIsPreviewMode(true)}>
                  <MaterialIcons name="photo-library" size={24} color={colors.primary} />
                  <Text style={styles.previewButtonText}>Review ({capturedImages.length})</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Image Grid */}
            {capturedImages.length > 0 && (
              <View style={styles.imageGrid}>
                <FlatList
                  data={capturedImages.slice(-6)}
                  renderItem={renderCapturedImage}
                  keyExtractor={(item) => item.id.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.imageList}
                />
              </View>
            )}
          </View>
        )}
      </View>

      {/* Bottom Actions */}
      {mode === "scan" && capturedImages.length > 0 && (
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.clearButton} onPress={() => setCapturedImages([])}>
            <MaterialIcons name="clear-all" size={20} color="#ff4444" />
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.uploadButton, loading && styles.uploadButtonDisabled]}
            onPress={uploadAllImages}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <MaterialIcons name="cloud-upload" size={20} color="#fff" />
            )}
            <Text style={styles.uploadButtonText}>
              {loading ? "Processing..." : `Upload ${capturedImages.length} Images`}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Preview Modal */}
      <Modal visible={isPreviewMode} animationType="slide" onRequestClose={() => setIsPreviewMode(false)}>
        <View style={styles.previewModal}>
          <View style={styles.previewHeader}>
            <TouchableOpacity onPress={() => setIsPreviewMode(false)}>
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.previewTitle}>Review Images</Text>
            <Text style={styles.previewCounter}>{capturedImages.length} / 100</Text>
          </View>

          <FlatList
            data={capturedImages}
            renderItem={renderCapturedImage}
            keyExtractor={(item) => item.id.toString()}
            numColumns={3}
            contentContainerStyle={styles.previewGrid}
          />
        </View>
      </Modal>

      {/* Image Detail Modal */}
      <Modal visible={!!selectedImage} animationType="fade" transparent onRequestClose={() => setSelectedImage(null)}>
        <View style={styles.imageModal}>
          <TouchableOpacity style={styles.imageModalOverlay} onPress={() => setSelectedImage(null)}>
            <Image source={{ uri: selectedImage?.uri }} style={styles.fullImage} resizeMode="contain" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeModal} onPress={() => setSelectedImage(null)}>
            <MaterialIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingTop: 20,
  },
  modeSelector: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#E8E8E8",
    borderRadius: 12,
    padding: 4,
  },
  quotaContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  quotaText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  modeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  activeModeBtn: {
    backgroundColor: colors.primary,
  },
  activeModeText: {
    color: "#fff",
    fontWeight: "600",
  },
  inactiveModeText: {
    color: "#666",
    fontWeight: "600",
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "flex-start",
  },
  recordSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  timerText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#1A1A1A",
    fontFamily: "monospace",
  },
  timerLabel: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
    fontWeight: "500",
  },
  recordingControls: {
    marginBottom: 30,
  },
  recordingButtonsContainer: {
    flexDirection: "row",
    gap: 20,
    alignItems: "center",
  },
  pauseButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FF9500",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  stopButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#ff4444",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  recordingInfo: {
    marginTop: 30,
    alignItems: "center",
  },
  infoText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginBottom: 4,
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  recordText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  scanSection: {
    flex: 1,
  },
  cameraContainer: {
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
  },
  cameraPreview: {
    width: "100%",
    height: (width - 40) * (9 / 16),
  },
  cameraOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  focusBox: {
    width: width * 0.6,
    height: width * 0.6 * (9 / 16),
    position: "relative",
  },
  focusCorner: {
    position: "absolute",
    width: 20,
    height: 20,
    borderColor: colors.primary,
    borderWidth: 3,
  },
  focusCornerTL: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  focusCornerTR: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  focusCornerBL: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  focusCornerBR: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  captureControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  previewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    gap: 8,
  },
  previewButtonText: {
    color: colors.primary,
    fontWeight: "600",
  },
  imageGrid: {
    marginBottom: 20,
  },
  imageList: {
    paddingVertical: 8,
  },
  thumbnailContainer: {
    marginHorizontal: 4,
    position: "relative",
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  deleteButton: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#ff4444",
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnailTime: {
    fontSize: 8,
    color: "#666",
    textAlign: "center",
    marginTop: 2,
  },
  bottomActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 12,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    gap: 8,
  },
  clearButtonText: {
    color: "#ff4444",
    fontWeight: "600",
  },
  uploadButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    elevation: 4,
    gap: 8,
  },
  uploadButtonDisabled: {
    opacity: 0.7,
  },
  uploadButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  permissionText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginVertical: 20,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  previewModal: {
    flex: 1,
    backgroundColor: "#fff",
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  previewCounter: {
    fontSize: 14,
    color: "#666",
  },
  previewGrid: {
    padding: 20,
  },
  imageModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageModalOverlay: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "90%",
    height: "70%",
  },
  closeModal: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
})

export default CaptureScreen
