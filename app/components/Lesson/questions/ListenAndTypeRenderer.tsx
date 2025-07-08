"use client"

import { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native"
import * as Speech from 'expo-speech'

interface ListenAndTypeRendererProps {
  question: {
    text: string
  }
  showAnswer: boolean
  onAnswer: (isCorrect: boolean) => void
}

export function ListenAndTypeRenderer({ question, showAnswer, onAnswer }: ListenAndTypeRendererProps) {
  const [inputValue, setInputValue] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    // Cleanup speech when component unmounts
    return () => {
      Speech.stop()
    }
  }, [])

  const playAudio = async () => {
    try {
      if (isPlaying) {
        // Stop current speech
        Speech.stop()
        setIsPlaying(false)
        return
      }

      setIsPlaying(true)

      // Configure speech options
      const speechOptions = {
        // language: 'en-US',
        pitch: 1.0,
        rate: 0.75, // Slightly slower for better comprehension
        voice: undefined, // Use default voice
        volume: 1.0,
        onStart: () => {
          setIsPlaying(true)
        },
        onDone: () => {
          setIsPlaying(false)
        },
        onStopped: () => {
          setIsPlaying(false)
        },
        onError: (error: any) => {
          console.error('TTS Error:', error)
          setIsPlaying(false)
          Alert.alert('Error', 'Failed to play audio. Please try again.')
        }
      }

      // Speak the text
      Speech.speak(question.text, speechOptions)

    } catch (error) {
      console.error('Error playing audio:', error)
      setIsPlaying(false)
      Alert.alert('Error', 'Text-to-speech is not available on this device.')
    }
  }

  const handleSubmit = async () => {
    setIsValidating(true)
    try {
      // Case-insensitive comparison with trimmed whitespace
      const userInput = inputValue.trim().toLowerCase()
      const correctAnswer = question.text.trim().toLowerCase()

      // More lenient comparison - remove extra spaces and punctuation
      const normalizeText = (text: string) => {
        return text
          .replace(/[^\w\s]/g, "") // Remove punctuation
          .replace(/\s+/g, " ") // Replace multiple spaces with single space
          .trim()
      }

      const normalizedInput = normalizeText(userInput)
      const normalizedCorrect = normalizeText(correctAnswer)

      const isCorrect = normalizedInput === normalizedCorrect
      onAnswer(isCorrect)
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
        <TouchableOpacity 
          style={[styles.playButton, isPlaying && styles.playingButton]} 
          onPress={playAudio}
        >
          <Text style={styles.playIcon}>{isPlaying ? "⏸️" : "▶️"}</Text>
          <Text style={styles.playText}>
            {isPlaying ? "Stop Audio" : "Play Audio"}
          </Text>
        </TouchableOpacity>
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
        autoCorrect={false}
        autoCapitalize="sentences"
      />

      {!showAnswer && (
        <TouchableOpacity
          style={[
            styles.submitButton, 
            (!inputValue.trim() || isValidating) && styles.disabledButton
          ]}
          onPress={handleSubmit}
          disabled={!inputValue.trim() || isValidating}
        >
          <Text style={styles.submitButtonText}>
            {isValidating ? "Checking..." : "Submit Answer"}
          </Text>
        </TouchableOpacity>
      )}

      {showAnswer && (
        <View style={styles.answerContainer}>
          <Text style={styles.answerLabel}>Correct answer:</Text>
          <Text style={styles.answerText}>{question.text}</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  playingButton: {
    backgroundColor: "#EF4444", // Red when playing/stopping
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
  answerContainer: {
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  answerLabel: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 8,
  },
  answerText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1E293B",
  },
})
