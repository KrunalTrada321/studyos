import { validateFreeText } from "@/app/utils/answerValidation"
import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native"

interface FreeTextRendererProps {
  question: any
  showAnswer: boolean
  onAnswer: (isCorrect: boolean) => void
}

export function FreeTextRenderer({ question, showAnswer, onAnswer }: FreeTextRendererProps) {
  const [inputValue, setInputValue] = useState("")
  const [isAnswered, setIsAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const getQuestionTitle = () => {
    return question.question || question.statement || question.title || question.description || "Question"
  }

  const onSubmit = async () => {
    setIsValidating(true)
    try {
      const correct = await validateFreeText(question.question, inputValue)
      setIsCorrect(correct)
      setIsAnswered(true)
    } catch (error) {
      console.error('Validation error:', error)
      // You might want to show an error message to the user here
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
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.questionTitle}>{getQuestionTitle()}</Text>

        {question.hint && (
          <View style={styles.hintContainer}>
            <View style={styles.hintHeader}>
              <Text style={styles.hintIcon}>💡</Text>
              <Text style={styles.hintLabel}>Hint</Text>
            </View>
            <Text style={styles.hintText}>{question.hint}</Text>
          </View>
        )}

        <TextInput
          style={[
            styles.textInput,
            (showAnswer || isAnswered) && styles.disabledInput,
            isAnswered && isCorrect && styles.correctInput,
            isAnswered && !isCorrect && styles.incorrectInput,
          ]}
          placeholder="Type your answer here..."
          value={inputValue}
          onChangeText={setInputValue}
          multiline={true}
          numberOfLines={6}
          textAlignVertical="top"
          editable={!showAnswer && !isAnswered && !isValidating}
        />

        {/* Loading indicator while validating */}
        {isValidating && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#3B82F6" />
            <Text style={styles.loadingText}>Checking your answer...</Text>
          </View>
        )}

        {/* Show feedback after answering */}
        {isAnswered && (
          <View style={[
            styles.feedbackContainer,
            isCorrect ? styles.correctFeedback : styles.incorrectFeedback
          ]}>
            <View style={styles.feedbackHeader}>
              <Text style={styles.feedbackIcon}>
                {isCorrect ? "✅" : "❌"}
              </Text>
              <Text style={[
                styles.feedbackTitle,
                isCorrect ? styles.correctText : styles.incorrectText
              ]}>
                {isCorrect ? "Correct!" : "Incorrect"}
              </Text>
            </View>
            <Text style={styles.feedbackMessage}>
              {isCorrect 
                ? "Great job! Your answer is correct." 
                : "Your answer is not quite right. You can try again or continue to see the correct answer."
              }
            </Text>
          </View>
        )}

        {/* Submit button - only show when not answered */}
        {!showAnswer && !isAnswered && (
          <TouchableOpacity
            style={[
              styles.submitButton, 
              (!inputValue.trim() || isValidating) && styles.disabledButton
            ]}
            onPress={() => onSubmit()}
            disabled={!inputValue.trim() || isValidating}
          >
            {isValidating ? (
              <View style={styles.submitButtonContent}>
                <ActivityIndicator size="small" color="white" />
                <Text style={styles.submitButtonText}>Checking...</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>Submit Answer</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Action buttons after answering */}
        {isAnswered && !showAnswer && (
          <View style={styles.actionButtons}>
            {!isCorrect && (
              <TouchableOpacity
                style={styles.tryAgainButton}
                onPress={resetAnswer}
              >
                <Text style={styles.tryAgainButtonText}>Try Again</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.continueButton}
              onPress={onContinue}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 24,
    lineHeight: 28,
  },
  hintContainer: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  hintHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  hintIcon: {
    fontSize: 16,
  },
  hintLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400E",
  },
  hintText: {
    fontSize: 14,
    color: "#92400E",
    lineHeight: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "white",
    minHeight: 120,
    maxHeight: 200,
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
    marginTop: 16,
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
    marginTop: 24,
    alignItems: "center",
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
    marginTop: 20,
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