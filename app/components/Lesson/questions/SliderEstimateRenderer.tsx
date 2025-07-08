"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import Slider from "@react-native-community/slider"

interface SliderEstimateRendererProps {
  question: any
  showAnswer: boolean
  onAnswer: (isCorrect: boolean) => void
}

export function SliderEstimateRenderer({ question, showAnswer, onAnswer }: SliderEstimateRendererProps) {
  const [sliderValue, setSliderValue] = useState(question.min_value)

  const handleSubmit = () => {
    // For slider estimates, we can consider it correct if it's within a reasonable range
    const tolerance = (question.max_value - question.min_value) * 0.1 // 10% tolerance
    const correct = Math.abs(sliderValue - question.correct_value) <= tolerance
    onAnswer(correct)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.questionTitle}>{question.question}</Text>

      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={question.min_value}
          maximumValue={question.max_value}
          step={question.step_size}
          value={sliderValue}
          onValueChange={setSliderValue}
          minimumTrackTintColor="#3B82F6"
          maximumTrackTintColor="#E2E8F0"
          thumbStyle={styles.thumb}
          disabled={showAnswer}
        />

        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>
            {question.min_value}
            {question.unit}
          </Text>
          <Text style={styles.currentValue}>
            Current: {sliderValue}
            {question.unit}
          </Text>
          <Text style={styles.sliderLabel}>
            {question.max_value}
            {question.unit}
          </Text>
        </View>
      </View>

      {showAnswer && (
        <View style={styles.answerContainer}>
          <View style={styles.answerHeader}>
            <Text style={styles.answerIcon}>🎯</Text>
            <Text style={styles.answerTitle}>
              Correct answer: {question.correct_value}
              {question.unit}
            </Text>
          </View>
        </View>
      )}

      {!showAnswer && (
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Estimate</Text>
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
    marginBottom: 32,
    lineHeight: 28,
  },
  sliderContainer: {
    marginBottom: 32,
  },
  slider: {
    width: "100%",
    height: 40,
    marginBottom: 16,
  },
  thumb: {
    backgroundColor: "#3B82F6",
    width: 20,
    height: 20,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sliderLabel: {
    fontSize: 14,
    color: "#64748B",
  },
  currentValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
  answerContainer: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  answerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  answerIcon: {
    fontSize: 20,
  },
  answerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E40AF",
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
