"use client"

import { View, Text, StyleSheet } from "react-native"

interface FeynmanWhyRendererProps {
  question: any
  showAnswer: boolean
  onAnswer: (isCorrect: boolean) => void
}

export function FeynmanWhyRenderer({ question }: FeynmanWhyRendererProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.icon}>🧠</Text>
        <Text style={styles.title}>Feynman Technique</Text>
        <Text style={styles.subtitle}>Think deeply about these questions</Text>
      </View>

      <View style={styles.questionsContainer}>
        {question.questions.map((q: string, index: number) => (
          <View key={index} style={styles.questionItem}>
            <View style={styles.questionNumber}>
              <Text style={styles.questionNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.questionText}>{q}</Text>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
  },
  questionsContainer: {
    gap: 16,
  },
  questionItem: {
    backgroundColor: "#F3E8FF",
    borderWidth: 1,
    borderColor: "#E9D5FF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  questionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  questionNumberText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    color: "#581C87",
    lineHeight: 22,
  },
})
