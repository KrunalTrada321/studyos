import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native"
import { useState, useRef } from "react"
import { Audio } from "expo-av"
import { getToken } from "@/app/utils/token"
import Constants from "@/app/utils/constants"

interface VoiceAnswerRendererProps {
  question: any
  showAnswer: boolean
  onAnswer: (isCorrect: boolean) => void
}

export function VoiceAnswerRenderer({ question, showAnswer, onAnswer }: VoiceAnswerRendererProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isAnswered, setIsAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const recordingRef = useRef<Audio.Recording | null>(null)

  const validateVoiceAnswer = async (audioUri: string) => {
    try {
      setIsProcessing(true)

      const formData = new FormData()
      formData.append("question", getQuestionTitle())
      formData.append("file", {
        uri: audioUri,
        type: "audio/wav",
        name: "audio.wav",
      } as any)

      const token = await getToken()
      const response = await fetch(`${Constants.api}/api/ai/validate-answer/voice-answer`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const result = await response.json()
      setIsCorrect(result.correct)
      setIsAnswered(true)
    } catch (error) {
      console.error("Error validating voice answer:", error)
      setIsCorrect(false)
      setIsAnswered(true)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRecordAnswer = async () => {
    if (isRecording) {
      // Stop recording
      try {
        setIsRecording(false)
        await recordingRef.current?.stopAndUnloadAsync()
        const uri = recordingRef.current?.getURI()
        if (uri) {
          await validateVoiceAnswer(uri)
        }
      } catch (error) {
        console.error("Failed to stop recording:", error)
        setIsCorrect(false)
        setIsAnswered(true)
      }
    } else {
      // Start recording
      try {
        const { status } = await Audio.requestPermissionsAsync()
        if (status !== "granted") {
          Alert.alert("Permission Required", "Please grant microphone permission.")
          return
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        })

        const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY)
        recordingRef.current = recording
        setIsRecording(true)
      } catch (error) {
        console.error("Failed to start recording:", error)
        Alert.alert("Error", "Failed to start recording.")
      }
    }
  }

  const onContinue = () => {
    if (isCorrect !== null) {
      onAnswer(isCorrect)
    }
  }

  const resetAnswer = () => {
    setIsAnswered(false)
    setIsCorrect(null)
    setIsProcessing(false)
    setIsRecording(false)
  }

  const getQuestionTitle = () => {
    return question.question || question.statement || question.title || question.description || "Question"
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🎤</Text>
        </View>
        <Text style={styles.questionTitle}>{getQuestionTitle()}</Text>
      </View>

      {/* Loading indicator while processing */}
      {isProcessing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text style={styles.loadingText}>Processing your answer...</Text>
        </View>
      )}

      {/* Show feedback after answering */}
      {isAnswered && (
        <View style={[styles.feedbackContainer, isCorrect ? styles.correctFeedback : styles.incorrectFeedback]}>
          <View style={styles.feedbackHeader}>
            <Text style={styles.feedbackIcon}>{isCorrect ? "✅" : "❌"}</Text>
            <Text style={[styles.feedbackTitle, isCorrect ? styles.correctText : styles.incorrectText]}>
              {isCorrect ? "Correct Answer!" : "Incorrect Answer"}
            </Text>
          </View>
          <Text style={styles.feedbackMessage}>
            {isCorrect
              ? "Great job! Your voice answer is correct."
              : "Your answer is not quite right. You can try recording again or continue to see the correct answer."}
          </Text>
        </View>
      )}

      {/* Record button - only show when not answered */}
      {!showAnswer && !isAnswered && (
        <TouchableOpacity
          style={[styles.recordButton, isRecording && styles.recordingButton, isProcessing && styles.processingButton]}
          onPress={handleRecordAnswer}
          disabled={isProcessing}
        >
          <Text style={styles.micIcon}>{isProcessing ? "⏳" : isRecording ? "⏹️" : "🎤"}</Text>
          <Text style={styles.recordButtonText}>
            {isProcessing ? "Processing..." : isRecording ? "Stop Recording" : "Record Answer"}
          </Text>
        </TouchableOpacity>
      )}

      {/* Action buttons after answering */}
      {isAnswered && !showAnswer && (
        <View style={styles.actionButtons}>
          {!isCorrect && (
            <TouchableOpacity style={styles.tryAgainButton} onPress={resetAnswer}>
              <Text style={styles.tryAgainButtonText}>Try Again</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: "#F3E8FF",
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  icon: {
    fontSize: 32,
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1E293B",
    textAlign: "center",
    lineHeight: 28,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  feedbackContainer: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  correctFeedback: {
    backgroundColor: "#F0FDF4",
    borderColor: "#10B981",
  },
  incorrectFeedback: {
    backgroundColor: "#FEF2F2",
    borderColor: "#EF4444",
  },
  feedbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  feedbackIcon: {
    fontSize: 16,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  correctText: {
    color: "#059669",
  },
  incorrectText: {
    color: "#DC2626",
  },
  feedbackMessage: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  recordButton: {
    backgroundColor: "#8B5CF6",
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  recordingButton: {
    backgroundColor: "#EF4444",
  },
  processingButton: {
    backgroundColor: "#6B7280",
  },
  micIcon: {
    fontSize: 24,
  },
  recordButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  tryAgainButton: {
    flex: 1,
    backgroundColor: "#F59E0B",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  tryAgainButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  continueButton: {
    flex: 1,
    backgroundColor: "#10B981",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  continueButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})
