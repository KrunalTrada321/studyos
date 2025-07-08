"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native"

interface FIBRendererProps {
  question: any
  showAnswer: boolean
  onAnswer: (isCorrect: boolean) => void
}

export function FIBRenderer({ question, showAnswer, onAnswer }: FIBRendererProps) {
  const [inputValues, setInputValues] = useState<string[]>([])

  const handleInputChange = (text: string, index: number) => {
    const updated = [...inputValues]
    updated[index] = text
    setInputValues(updated)
  }

  const handleSubmit = () => {
    const correct = inputValues.every(
      (ans, idx) => ans?.trim().toLowerCase() === question.correct_answers[idx]?.trim().toLowerCase(),
    )
    onAnswer(correct)
  }

  // Parse the question text and replace blanks with interactive inputs
  const renderQuestionWithBlanks = () => {
    if (!question.question) return null

    // Split by blank patterns like {BLANK1}, {BLANK2}, etc.
    const parts = question.question.split(/\{BLANK\d+\}/g)
    const blanks = question.question.match(/\{BLANK\d+\}/g) || []
    
    const elements = []
    
    for (let i = 0; i < parts.length; i++) {
      // Add text part
      if (parts[i]) {
        elements.push(
          <Text key={`text-${i}`} style={styles.questionText}>
            {parts[i]}
          </Text>
        )
      }
      
      // Add blank input (except for the last iteration)
      if (i < blanks.length) {
        const blankIndex = i
        const isCorrect = showAnswer && inputValues[blankIndex]?.trim().toLowerCase() === question.correct_answers[blankIndex]?.trim().toLowerCase()
        const isIncorrect = showAnswer && inputValues[blankIndex] && !isCorrect
        
        elements.push(
          <View key={`blank-${i}`} style={styles.inlineBlankContainer}>
            <TextInput
              style={[
                styles.inlineBlankInput,
                showAnswer && styles.disabledInput,
                showAnswer && isCorrect && styles.correctInput,
                showAnswer && isIncorrect && styles.incorrectInput,
              ]}
              placeholder="____"
              value={inputValues[blankIndex] || ""}
              onChangeText={(text) => handleInputChange(text, blankIndex)}
              editable={!showAnswer}
              multiline={false}
              textAlign="center"
            />
            {showAnswer && (
              <View style={styles.answerTooltip}>
                <Text style={styles.answerTooltipText}>
                  ✓ {question.correct_answers[blankIndex]}
                </Text>
              </View>
            )}
          </View>
        )
      }
    }
    
    return <View style={styles.questionContainer}>{elements}</View>
  }

  // Fallback to separate blanks if inline rendering fails
  const renderSeparateBlanks = () => {
    return (
      <View style={styles.container}>
        <Text style={styles.questionTitle}>{question.question}</Text>

        <View style={styles.blanksContainer}>
          {question.blanks?.map((_: any, index: number) => (
            <View key={index} style={styles.blankContainer}>
              <Text style={styles.blankLabel}>Fill in blank {index + 1}</Text>
              <TextInput
                style={[styles.blankInput, showAnswer && styles.disabledInput]}
                placeholder={`Enter your answer here...`}
                value={inputValues[index] || ""}
                onChangeText={(text) => handleInputChange(text, index)}
                editable={!showAnswer}
                multiline={false}
              />
              {showAnswer && (
                <View style={styles.answerContainer}>
                  <Text style={styles.answerLabel}>Correct answer:</Text>
                  <View style={styles.answerBadge}>
                    <Text style={styles.answerText}>{question.correct_answers[index]}</Text>
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>

        {!showAnswer && (
          <TouchableOpacity
            style={[styles.submitButton, inputValues.length === 0 && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={inputValues.length === 0}
          >
            <Text style={styles.submitButtonText}>Submit Answer</Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }

  // Check if question has inline blanks
  const hasInlineBlanks = question.question?.includes('{BLANK')
  
  return (
    <View style={styles.container}>
      {hasInlineBlanks ? (
        <>
          {renderQuestionWithBlanks()}
          {!showAnswer && (
            <TouchableOpacity
              style={[styles.submitButton, inputValues.length === 0 && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={inputValues.length === 0}
            >
              <Text style={styles.submitButtonText}>Submit Answer</Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        renderSeparateBlanks()
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  questionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 24,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#1E293B",
    lineHeight: 28,
    flexShrink: 1,
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 24,
    lineHeight: 28,
  },
  inlineBlankContainer: {
    position: "relative",
    marginHorizontal: 4,
  },
  inlineBlankInput: {
    borderWidth: 2,
    borderColor: "#3B82F6",
    borderStyle: "dashed",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: "white",
    minWidth: 80,
    textAlign: "center",
  },
  correctInput: {
    borderColor: "#10B981",
    backgroundColor: "#F0FDF4",
    borderStyle: "solid",
  },
  incorrectInput: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
    borderStyle: "solid",
  },
  disabledInput: {
    backgroundColor: "#F9FAFB",
    color: "#6B7280",
  },
  answerTooltip: {
    position: "absolute",
    top: -32,
    left: "50%",
    transform: [{ translateX: -50 }],
    backgroundColor: "#10B981",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 1000,
  },
  answerTooltipText: {
    fontSize: 12,
    color: "white",
    fontWeight: "500",
    textAlign: "center",
    minWidth: 60,
  },
  blanksContainer: {
    gap: 20,
  },
  blankContainer: {
    gap: 8,
  },
  blankLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  blankInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "white",
  },
  answerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  answerLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  answerBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  answerText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
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
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})