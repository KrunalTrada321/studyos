"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"

interface MCQRendererProps {
  question: any
  showAnswer: boolean
  onAnswer: (isCorrect: boolean) => void
}

export function MCQRenderer({ question, showAnswer, onAnswer }: MCQRendererProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const getQuestionTitle = () => {
    return question.question || question.statement || question.title || question.description || "Question"
  }

  return (
    <View style={styles.container}>
      <Text style={styles.questionTitle}>{getQuestionTitle()}</Text>

      <View style={styles.optionsContainer}>
        {Object.entries(question.options).map(([key, value]: [string, any]) => {
          const isCorrect = key === question.answer
          const isSelected = key === selectedOption

          const buttonStyle = [styles.optionButton]
          const textStyle = [styles.optionText]

          if (showAnswer) {
            if (isCorrect) {
              buttonStyle.push(styles.correctOption)
              textStyle.push(styles.correctText)
            } else if (isSelected) {
              buttonStyle.push(styles.incorrectOption)
              textStyle.push(styles.incorrectText)
            }
          } else if (isSelected) {
            buttonStyle.push(styles.selectedOption)
            textStyle.push(styles.selectedText)
          }

          return (
            <TouchableOpacity
              key={key}
              style={buttonStyle}
              onPress={() => {
                if (!showAnswer) {
                  setSelectedOption(key)
                  onAnswer(isCorrect)
                }
              }}
              disabled={showAnswer}
            >
              <View style={styles.optionContent}>
                <View style={[styles.optionLetter, isSelected && !showAnswer && styles.selectedLetter]}>
                  <Text style={[styles.optionLetterText, isSelected && !showAnswer && styles.selectedLetterText]}>
                    {key.toUpperCase()}
                  </Text>
                </View>
                <Text style={textStyle}>{value}</Text>
                {showAnswer && isCorrect && <Text style={styles.checkmark}>✓</Text>}
                {showAnswer && isSelected && !isCorrect && <Text style={styles.crossmark}>✗</Text>}
              </View>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 24,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: "#F8FAFC",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 16,
  },
  selectedOption: {
    backgroundColor: "#EFF6FF",
    borderColor: "#3B82F6",
  },
  correctOption: {
    backgroundColor: "#F0FDF4",
    borderColor: "#22C55E",
  },
  incorrectOption: {
    backgroundColor: "#FEF2F2",
    borderColor: "#EF4444",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedLetter: {
    borderColor: "#3B82F6",
    backgroundColor: "#3B82F6",
  },
  optionLetterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  selectedLetterText: {
    color: "white",
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: "#1E293B",
    lineHeight: 22,
  },
  selectedText: {
    color: "#1E40AF",
  },
  correctText: {
    color: "#166534",
  },
  incorrectText: {
    color: "#DC2626",
  },
  checkmark: {
    fontSize: 20,
    color: "#22C55E",
    fontWeight: "bold",
  },
  crossmark: {
    fontSize: 20,
    color: "#EF4444",
    fontWeight: "bold",
  },
})
