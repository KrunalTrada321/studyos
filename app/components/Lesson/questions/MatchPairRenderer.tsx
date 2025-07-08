"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"

interface MatchPairRendererProps {
  question: any
  showAnswer: boolean
  onAnswer: (isCorrect: boolean) => void
}

export function MatchPairRenderer({ question, showAnswer, onAnswer }: MatchPairRendererProps) {
  const [matches, setMatches] = useState<{ [key: string]: string }>({})
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [shuffledPairs, setShuffledPairs] = useState<{ left: string; right: string }[]>([])
  const [shuffledRightItems, setShuffledRightItems] = useState<string[]>([])

  // Shuffle function
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Shuffle pairs on component mount
  useEffect(() => {
    if (question?.pairs) {
      const shuffledLeft = shuffleArray(question.pairs)
      const rightItems = question.pairs.map((pair: any) => pair.right)
      const shuffledRight = shuffleArray(rightItems)
      
      setShuffledPairs(shuffledLeft)
      setShuffledRightItems(shuffledRight)
    }
  }, [question])

  const handleLeftSelect = (leftItem: string) => {
    if (showAnswer) return
    setSelectedLeft(selectedLeft === leftItem ? null : leftItem)
  }

  const handleRightSelect = (rightItem: string) => {
    if (showAnswer || !selectedLeft) return

    setMatches((prev) => ({
      ...prev,
      [selectedLeft]: rightItem,
    }))
    setSelectedLeft(null)
  }

  const handleSubmit = () => {
    const correct = question.pairs.every((pair: any) => matches[pair.left] === pair.right)
    onAnswer(correct)
  }

  const getQuestionTitle = () => {
    return question.question || question.statement || question.title || question.description || "Match the pairs"
  }

  return (
    <View style={styles.container}>
      <Text style={styles.questionTitle}>{getQuestionTitle()}</Text>

      <Text style={styles.instruction}>
        {selectedLeft ? "Now tap the matching item on the right" : "Tap an item on the left to start matching"}
      </Text>

      <View style={styles.matchContainer}>
        <View style={styles.column}>
          <Text style={styles.columnTitle}>Match these items:</Text>
          {shuffledPairs.map((pair, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.leftItem,
                selectedLeft === pair.left && styles.selectedItem,
                matches[pair.left] && styles.matchedItem,
              ]}
              onPress={() => handleLeftSelect(pair.left)}
              disabled={showAnswer}
            >
              <Text
                style={[
                  styles.itemText,
                  selectedLeft === pair.left && styles.selectedText,
                  matches[pair.left] && styles.matchedText,
                ]}
              >
                {pair.left}
              </Text>
              {matches[pair.left] && (
                <Text style={styles.matchIndicator}>→ {matches[pair.left]}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.column}>
          <Text style={styles.columnTitle}>With these items:</Text>
          {shuffledRightItems.map((rightItem, index) => {
            const isMatched = Object.values(matches).includes(rightItem)
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.rightItem,
                  isMatched && styles.matchedItem,
                  selectedLeft && !isMatched && styles.highlightedItem,
                ]}
                onPress={() => handleRightSelect(rightItem)}
                disabled={showAnswer || isMatched}
              >
                <Text style={[
                  styles.itemText,
                  isMatched && styles.matchedText,
                  selectedLeft && !isMatched && styles.highlightedText,
                ]}>
                  {rightItem}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      {showAnswer && (
        <View style={styles.answerContainer}>
          <Text style={styles.answerTitle}>Results:</Text>
          {question.pairs.map((pair: any, index: number) => {
            const userMatch = matches[pair.left]
            const isCorrect = userMatch === pair.right
            
            return (
              <View key={index} style={[
                styles.correctMatch,
                isCorrect ? styles.correctMatchBg : styles.incorrectMatchBg
              ]}>
                <Text style={[
                  styles.correctMatchText,
                  isCorrect ? styles.correctText : styles.incorrectText
                ]}>
                  {pair.left} → {pair.right}
                </Text>
                {!isCorrect && userMatch && (
                  <Text style={styles.userMatchText}>
                    (You matched: {userMatch})
                  </Text>
                )}
              </View>
            )
          })}
        </View>
      )}

      {!showAnswer && (
        <TouchableOpacity
          style={[
            styles.submitButton,
            Object.keys(matches).length !== question.pairs.length && styles.disabledButton
          ]}
          onPress={handleSubmit}
          disabled={Object.keys(matches).length !== question.pairs.length}
        >
          <Text style={styles.submitButtonText}>
            Submit Matches ({Object.keys(matches).length}/{question.pairs.length})
          </Text>
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
    fontSize: 22,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 16,
    lineHeight: 30,
    textAlign: "center",
  },
  instruction: {
    fontSize: 16,
    color: "#475569",
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "500",
  },
  matchContainer: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 24,
  },
  column: {
    flex: 1,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
    textAlign: "center",
  },
  leftItem: {
    backgroundColor: "#F8FAFC",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  rightItem: {
    backgroundColor: "#F8FAFC",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  selectedItem: {
    borderColor: "#3B82F6",
    backgroundColor: "#EBF8FF",
    borderWidth: 3,
  },
  matchedItem: {
    borderColor: "#10B981",
    backgroundColor: "#F0FDF4",
    borderStyle: "solid",
  },
  highlightedItem: {
    borderColor: "#F59E0B",
    backgroundColor: "#FFFBEB",
    borderStyle: "solid",
  },
  itemText: {
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "500",
    textAlign: "center",
  },
  selectedText: {
    color: "#1E40AF",
    fontWeight: "600",
  },
  matchedText: {
    color: "#166534",
    fontWeight: "600",
  },
  highlightedText: {
    color: "#D97706",
    fontWeight: "600",
  },
  matchIndicator: {
    fontSize: 14,
    color: "#10B981",
    marginTop: 8,
    fontWeight: "600",
    textAlign: "center",
  },
  answerContainer: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  answerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  correctMatch: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  correctMatchBg: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  incorrectMatchBg: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  correctMatchText: {
    fontSize: 14,
    fontWeight: "500",
  },
  correctText: {
    color: "#166534",
  },
  incorrectText: {
    color: "#DC2626",
  },
  userMatchText: {
    fontSize: 12,
    color: "#DC2626",
    fontStyle: "italic",
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    borderRadius: 12,
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