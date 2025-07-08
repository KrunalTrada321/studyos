"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native"
import { validateTranslation } from "../../../utils/answerValidation"

interface TranslationRendererProps {
  question: any
  showAnswer: boolean
  onAnswer: (isCorrect: boolean) => void
}

export function TranslationRenderer({ question, showAnswer, onAnswer }: TranslationRendererProps) {
  const [inputValue, setInputValue] = useState("")
  const [isAnswered, setIsAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const handleSubmit = async () => {
    setIsValidating(true)
    try {
      const correct = await validateTranslation(question.text, inputValue, question.from_language, question.to_language)
      setIsCorrect(correct)
      setIsAnswered(true)
    } catch (error) {
      console.error("Error validating translation:", error)
      setIsCorrect(false)
      setIsAnswered(true)
    } finally {
      setIsValidating(false)
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
    setInputValue("")
    setIsValidating(false)
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
        style={[
          styles.textInput,
          (showAnswer || isAnswered) && styles.disabledInput,
          isAnswered && isCorrect && styles.correctInput,
          isAnswered && !isCorrect && styles.incorrectInput,
        ]}
        placeholder={`Type your translation in ${question.to_language}...`}
        value={inputValue}
        onChangeText={setInputValue}
        multiline={true}
        numberOfLines={4}
        textAlignVertical="top"
        editable={!showAnswer && !isAnswered && !isValidating}
      />

      {/* Loading indicator while validating */}
      {isValidating && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text style={styles.loadingText}>Validating translation...</Text>
        </View>
      )}

      {/* Show feedback after answering */}
      {isAnswered && (
        <View style={[styles.feedbackContainer, isCorrect ? styles.correctFeedback : styles.incorrectFeedback]}>
          <View style={styles.feedbackHeader}>
            <Text style={styles.feedbackIcon}>{isCorrect ? "✅" : "❌"}</Text>
            <Text style={[styles.feedbackTitle, isCorrect ? styles.correctText : styles.incorrectText]}>
              {isCorrect ? "Correct Translation!" : "Incorrect Translation"}
            </Text>
          </View>
          <Text style={styles.feedbackMessage}>
            {isCorrect
              ? "Great job! Your translation is correct."
              : "Your translation is not quite right. You can try again or continue to see the correct answer."}
          </Text>
        </View>
      )}

      {/* Submit button - only show when not answered */}
      {!showAnswer && !isAnswered && (
        <TouchableOpacity
          style={[styles.submitButton, (!inputValue.trim() || isValidating) && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={!inputValue.trim() || isValidating}
        >
          {isValidating ? (
            <View style={styles.submitButtonContent}>
              <ActivityIndicator size="small" color="white" />
              <Text style={styles.submitButtonText}>Validating...</Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>Submit Translation</Text>
          )}
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
    padding: 16,
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
    marginBottom: 16,
  },
  disabledInput: {
    backgroundColor: "#F9FAFB",
    color: "#6B7280",
  },
  correctInput: {
    borderColor: "#10B981",
    borderWidth: 2,
    backgroundColor: "#F0FDF4",
  },
  incorrectInput: {
    borderColor: "#EF4444",
    borderWidth: 2,
    backgroundColor: "#FEF2F2",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  feedbackContainer: {
    marginTop: 8,
    marginBottom: 16,
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
  submitButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: "#9CA3AF",
  },
  submitButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
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
