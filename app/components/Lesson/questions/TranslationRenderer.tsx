"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native"
import { validateAnswerWithAPI } from "../../../utils/answerValidation"

interface TranslationRendererProps {
  question: any
  showAnswer: boolean
  onAnswer: (isCorrect: boolean) => void
}

export function TranslationRenderer({ question, showAnswer, onAnswer }: TranslationRendererProps) {
  const [inputValue, setInputValue] = useState("")
  const [isValidating, setIsValidating] = useState(false)

  const handleSubmit = async () => {
    setIsValidating(true)
    try {
      // Translation questions don't have predefined answers, so we use API validation
      const correct = await validateAnswerWithAPI(question, inputValue)
      onAnswer(correct)
    } catch (error) {
      console.error("Error validating translation:", error)
      onAnswer(false)
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Translation</Text>
        <Text style={styles.subtitle}>
          Translate from {question.from_language} to {question.to_language}
        </Text>
      </View>

      <View style={styles.sourceContainer}>
        <Text style={styles.sourceText}>{question.text}</Text>
      </View>

      <TextInput
        style={[styles.textInput, showAnswer && styles.disabledInput]}
        placeholder={`Type your translation in ${question.to_language}...`}
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
          <Text style={styles.submitButtonText}>{isValidating ? "Validating..." : "Submit Translation"}</Text>
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
    marginBottom: 24,
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
  sourceContainer: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  sourceText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#1E40AF",
    textAlign: "center",
    lineHeight: 26,
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
