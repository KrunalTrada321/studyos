"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native"

interface ListenAndTypeRendererProps {
  question: any
  showAnswer: boolean
  onAnswer: (isCorrect: boolean) => void
}

export function ListenAndTypeRenderer({ question, showAnswer, onAnswer }: ListenAndTypeRendererProps) {
  const [inputValue, setInputValue] = useState("")
  const [isValidating, setIsValidating] = useState(false)

  const handleSubmit = async () => {
    setIsValidating(true)
    try {
      // For ListenAndType, we have the correct text in question.text
      const correct = inputValue.trim().toLowerCase() === question.text.trim().toLowerCase()
      onAnswer(correct)
    } catch (error) {
      console.error("Error validating answer:", error)
      onAnswer(false)
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🔊</Text>
        </View>
        <Text style={styles.title}>Listen and Type</Text>
        <Text style={styles.subtitle}>Listen to the audio and type what you hear</Text>
      </View>

      <View style={styles.audioContainer}>
        <TouchableOpacity style={styles.playButton}>
          <Text style={styles.playIcon}>▶️</Text>
          <Text style={styles.playText}>Play Audio</Text>
        </TouchableOpacity>
        <Text style={styles.simulationText}>(Audio simulation: "{question.text}")</Text>
      </View>

      <TextInput
        style={[styles.textInput, showAnswer && styles.disabledInput]}
        placeholder="Type what you hear..."
        value={inputValue}
        onChangeText={setInputValue}
        multiline={true}
        numberOfLines={4}
        textAlignVertical="top"
        editable={!showAnswer}
      />

      {!showAnswer && (
        <TouchableOpacity
          style={[styles.submitButton, (!inputValue.trim() || isValidating) && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={!inputValue.trim() || isValidating}
        >
          <Text style={styles.submitButtonText}>{isValidating ? "Checking..." : "Submit Answer"}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: "#EFF6FF",
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
  },
  audioContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  playButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  playIcon: {
    fontSize: 16,
  },
  playText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  simulationText: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "white",
    minHeight: 100,
    marginBottom: 24,
  },
  disabledInput: {
    backgroundColor: "#F9FAFB",
    color: "#6B7280",
  },
  submitButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#9CA3AF",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})
