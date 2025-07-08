import { View, Text, StyleSheet } from "react-native"

interface AnalogyCardRendererProps {
  question: any
  showAnswer: boolean
  onAnswer: (isCorrect: boolean) => void
}

export function AnalogyCardRenderer({ question }: AnalogyCardRendererProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.icon}>💡</Text>
        <Text style={styles.title}>{question.title}</Text>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.description}>{question.description}</Text>

        <View style={styles.infosContainer}>
          {question.infos.map((info: string, index: number) => (
            <View key={index} style={styles.infoItem}>
              <View style={styles.bullet} />
              <Text style={styles.infoText}>{info}</Text>
            </View>
          ))}
        </View>
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
    textAlign: "center",
  },
  contentContainer: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 12,
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: "#92400E",
    marginBottom: 16,
    lineHeight: 22,
  },
  infosContainer: {
    gap: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D97706",
    marginTop: 6,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#92400E",
    lineHeight: 20,
  },
})
