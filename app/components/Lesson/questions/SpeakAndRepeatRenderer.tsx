import { View, Text, TouchableOpacity, StyleSheet } from "react-native"

interface SpeakAndRepeatRendererProps {
  question: any
  showAnswer: boolean
  onAnswer: (isCorrect: boolean) => void
}

export function SpeakAndRepeatRenderer({ question, showAnswer, onAnswer }: SpeakAndRepeatRendererProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🎤</Text>
        </View>
        <Text style={styles.title}>Speak and Repeat</Text>
        <Text style={styles.subtitle}>Say the following phrase out loud</Text>
      </View>

      <View style={styles.phraseContainer}>
        <Text style={styles.phraseText}>{question.text}</Text>
      </View>

      {!showAnswer && (
        <TouchableOpacity style={styles.submitButton} onPress={() => onAnswer(true)}>
          <Text style={styles.micIcon}>🎤</Text>
          <Text style={styles.submitButtonText}>I've Said It</Text>
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
    marginBottom: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: "#F0FDF4",
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
  phraseContainer: {
    backgroundColor: "#F0FDF4",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    marginBottom: 32,
  },
  phraseText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#166534",
    textAlign: "center",
    lineHeight: 32,
  },
  submitButton: {
    backgroundColor: "#10B981",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  micIcon: {
    fontSize: 20,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})
