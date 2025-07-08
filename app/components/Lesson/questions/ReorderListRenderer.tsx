"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"

interface ReorderListRendererProps {
  question: any
  showAnswer: boolean
  onAnswer: (isCorrect: boolean) => void
}

export function ReorderListRenderer({ question, showAnswer, onAnswer }: ReorderListRendererProps) {
  const [orderedSteps, setOrderedSteps] = useState<string[]>([...question.steps].sort(() => Math.random() - 0.5))
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const moveStep = (fromIndex: number, toIndex: number) => {
    if (showAnswer) return

    const newSteps = [...orderedSteps]
    const [movedStep] = newSteps.splice(fromIndex, 1)
    newSteps.splice(toIndex, 0, movedStep)
    setOrderedSteps(newSteps)
    setSelectedIndex(null)
  }

  const handleStepPress = (index: number) => {
    if (showAnswer) return

    if (selectedIndex === null) {
      setSelectedIndex(index)
    } else if (selectedIndex === index) {
      setSelectedIndex(null)
    } else {
      moveStep(selectedIndex, index)
    }
  }

  const handleSubmit = () => {
    const correct = orderedSteps.every((step, index) => step === question.steps[index])
    onAnswer(correct)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.questionTitle}>Arrange these steps in the correct order:</Text>

      <Text style={styles.instruction}>Tap a step to select it, then tap another position to move it there</Text>

      <View style={styles.stepsContainer}>
        {orderedSteps.map((step, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.stepItem, selectedIndex === index && styles.selectedStep, showAnswer && styles.disabledStep]}
            onPress={() => handleStepPress(index)}
            disabled={showAnswer}
          >
            <View style={styles.stepContent}>
              <View style={[styles.stepNumber, selectedIndex === index && styles.selectedStepNumber]}>
                <Text style={[styles.stepNumberText, selectedIndex === index && styles.selectedStepNumberText]}>
                  {index + 1}
                </Text>
              </View>
              <Text style={[styles.stepText, selectedIndex === index && styles.selectedStepText]}>{step}</Text>
              <Text style={styles.moveIcon}>⋮⋮</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {showAnswer && (
        <View style={styles.answerContainer}>
          <Text style={styles.answerTitle}>Correct Order:</Text>
          {question.steps.map((step: string, index: number) => (
            <View key={index} style={styles.correctStep}>
              <View style={styles.correctStepNumber}>
                <Text style={styles.correctStepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.correctStepText}>{step}</Text>
            </View>
          ))}
        </View>
      )}

      {!showAnswer && (
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Order</Text>
        </TouchableOpacity>
      )}
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
    marginBottom: 16,
    lineHeight: 28,
  },
  instruction: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 24,
  },
  stepsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  stepItem: {
    backgroundColor: "#F8FAFC",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 16,
  },
  selectedStep: {
    borderColor: "#3B82F6",
    backgroundColor: "#EFF6FF",
  },
  disabledStep: {
    opacity: 0.7,
  },
  stepContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedStepNumber: {
    backgroundColor: "#3B82F6",
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  selectedStepNumberText: {
    color: "white",
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: "#1E293B",
    lineHeight: 22,
  },
  selectedStepText: {
    color: "#1E40AF",
  },
  moveIcon: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  answerContainer: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  answerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#166534",
    marginBottom: 12,
  },
  correctStep: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  correctStepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  correctStepNumberText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  correctStepText: {
    flex: 1,
    fontSize: 14,
    color: "#166534",
  },
  submitButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})
