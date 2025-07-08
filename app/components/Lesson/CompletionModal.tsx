import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native"

interface CompletionModalProps {
  visible: boolean
  onClose: () => void
  lessonTitle: string
  totalQuestions: number
  correctAnswers: number
  isLoading: boolean
}

export function CompletionModal({
  visible,
  onClose,
  lessonTitle,
  totalQuestions,
  correctAnswers,
  isLoading,
}: CompletionModalProps) {
  const percentage = Math.round((correctAnswers / totalQuestions) * 100)

  const getPerformanceMessage = () => {
    if (percentage >= 90) return { message: "Outstanding!", emoji: "🏆", color: "#F59E0B" }
    if (percentage >= 80) return { message: "Excellent work!", emoji: "⭐", color: "#10B981" }
    if (percentage >= 70) return { message: "Good job!", emoji: "✅", color: "#3B82F6" }
    return { message: "Keep practicing!", emoji: "📚", color: "#6B7280" }
  }

  const performance = getPerformanceMessage()

  if (isLoading) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Completing lesson...</Text>
          </View>
        </View>
      </Modal>
    )
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Lesson Complete!</Text>

          <View style={styles.performanceContainer}>
            <Text style={styles.performanceEmoji}>{performance.emoji}</Text>
            <Text style={[styles.performanceMessage, { color: performance.color }]}>{performance.message}</Text>
            <Text style={styles.lessonTitle}>{lessonTitle}</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalQuestions}</Text>
              <Text style={styles.statLabel}>Questions</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: "#10B981" }]}>{correctAnswers}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: "#3B82F6" }]}>{percentage}%</Text>
              <Text style={styles.statLabel}>Score</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={onClose}>
              <Text style={styles.primaryButtonText}>Continue Learning →</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>Back to Lessons</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748B",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
    textAlign: "center",
    marginBottom: 24,
  },
  performanceContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  performanceEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  performanceMessage: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  lessonTitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    width: "100%",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: "column",
    gap: 12,
    width: "100%",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
  },
  secondaryButtonText: {
    color: "#64748B",
    fontSize: 16,
    fontWeight: "500",
  },
  primaryButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})