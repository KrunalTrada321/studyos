"use client"

import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { validateAnswerWithAPI } from "../../../utils/answerValidation"

interface VoiceAnswerRendererProps {
  question: any
  showAnswer: boolean
  onAnswer: (isCorrect: boolean) => void
}

export function VoiceAnswerRenderer({ question, showAnswer, onAnswer }: VoiceAnswerRendererProps) {
  const handleRecordAnswer = async () => {
    try {
      const correct = await validateAnswerWithAPI(question, "voice_recording_placeholder")
      onAnswer(correct)
    } catch (error) {
      console.error("Error validating voice answer:", error)
      onAnswer(false)
    }
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

      {!showAnswer && (
        <TouchableOpacity style={styles.recordButton} onPress={handleRecordAnswer}>
          <Text style={styles.micIcon}>🎤</Text>
          <Text style={styles.recordButtonText}>Record Answer</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
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
  micIcon: {
    fontSize: 24,
  },
  recordButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
})
