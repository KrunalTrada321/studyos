"use client"

import { View, Text, StyleSheet } from "react-native"

interface DerivationRendererProps {
  question: any
  showAnswer: boolean
  onAnswer: (isCorrect: boolean) => void
}

export function DerivationRenderer({ question }: DerivationRendererProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.icon}>🎯</Text>
        <Text style={styles.title}>Step-by-Step Derivation</Text>
      </View>

      <View style={styles.stepsContainer}>
        {question.steps.map((step: any, index: number) => (
          <View key={index} style={styles.stepItem}>
            <View style={styles.stepHeader}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
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
  icon: {
    fontSize: 32,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1E293B",
  },
  stepsContainer: {
    gap: 16,
  },
  stepItem: {
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
    borderRadius: 12,
    padding: 20,
  },
  stepHeader: {
    flexDirection: "row",
    gap: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EA580C",
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9A3412",
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: "#9A3412",
    lineHeight: 20,
  },
})
