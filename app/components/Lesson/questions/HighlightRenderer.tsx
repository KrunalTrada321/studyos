"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"

interface HighlightRendererProps {
  question: any
  showAnswer: boolean
  onAnswer: (isCorrect: boolean) => void
}

export function HighlightRenderer({ question, showAnswer, onAnswer }: HighlightRendererProps) {
  const [selectedWords, setSelectedWords] = useState<string[]>([])

  const words = question.text.split(" ")

  const toggleWord = (word: string, index: number) => {
    if (showAnswer) return

    const wordKey = `${word}_${index}`
    if (selectedWords.includes(wordKey)) {
      setSelectedWords((prev) => prev.filter((w) => w !== wordKey))
    } else {
      setSelectedWords((prev) => [...prev, wordKey])
    }
  }

  const handleSubmit = () => {
    // Check if selected words match the correct answers
    const selectedTexts = selectedWords.map((w) => w.split("_")[0])
    const correct = question.answer.every((ans: string) => selectedTexts.includes(ans))
    onAnswer(correct)
  }

  const getQuestionTitle = () => {
    return question.question || question.statement || question.title || question.description || "Question"
  }

  return (
    <View style={styles.container}>
      <Text style={styles.questionTitle}>{getQuestionTitle()}</Text>

      <View style={styles.textContainer}>
        <View style={styles.wordsContainer}>
          {words.map((word, index) => {
            const wordKey = `${word}_${index}`
            const isSelected = selectedWords.includes(wordKey)
            const isCorrect = showAnswer && question.answer.includes(word)

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.word,
                  isSelected && !showAnswer && styles.selectedWord,
                  showAnswer && isCorrect && styles.correctWord,
                ]}
                onPress={() => toggleWord(word, index)}
                disabled={showAnswer}
              >
                <Text
                  style={[
                    styles.wordText,
                    isSelected && !showAnswer && styles.selectedWordText,
                    showAnswer && isCorrect && styles.correctWordText,
                  ]}
                >
                  {word}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      <Text style={styles.instruction}>Tap on the words or phrases that should be highlighted</Text>

      {showAnswer && (
        <View style={styles.answerContainer}>
          <Text style={styles.answerTitle}>Correct highlights:</Text>
          <View style={styles.answersContainer}>
            {question.answer.map((highlight: string, index: number) => (
              <View key={index} style={styles.answerBadge}>
                <Text style={styles.answerText}>{highlight}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {!showAnswer && (
        <TouchableOpacity
          style={[styles.submitButton, selectedWords.length === 0 && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={selectedWords.length === 0}
        >
          <Text style={styles.submitButtonText}>Submit Selection</Text>
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
    marginBottom: 24,
    lineHeight: 28,
  },
  textContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  wordsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  word: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  selectedWord: {
    backgroundColor: "#3B82F6",
  },
  correctWord: {
    backgroundColor: "#10B981",
  },
  wordText: {
    fontSize: 16,
    color: "#1E293B",
    lineHeight: 24,
  },
  selectedWordText: {
    color: "white",
  },
  correctWordText: {
    color: "white",
  },
  instruction: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 20,
  },
  answerContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  answerTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#166534",
    marginBottom: 8,
  },
  answersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  answerBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  answerText: {
    fontSize: 12,
    color: "#166534",
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
