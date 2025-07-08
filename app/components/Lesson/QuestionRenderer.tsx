import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { MCQRenderer } from "./questions/MCQRenderer"
import { FIBRenderer } from "./questions/FIBRenderer"
import { FreeTextRenderer } from "./questions/FreeTextRenderer"
import { HighlightRenderer } from "./questions/HighlightRenderer"
import { MatchPairRenderer } from "./questions/MatchPairRenderer"
import { ReorderListRenderer } from "./questions/ReorderListRenderer"
import { SliderEstimateRenderer } from "./questions/SliderEstimateRenderer"
import { SwipeCardsRenderer } from "./questions/SwipeCardsRenderer"
import { ListenAndTypeRenderer } from "./questions/ListenAndTypeRenderer"
import { TranslationRenderer } from "./questions/TranslationRenderer"
import { SpeakAndRepeatRenderer } from "./questions/SpeakAndRepeatRenderer"
import { VoiceAnswerRenderer } from "./questions/VoiceAnswerRenderer"
import { FeynmanWhyRenderer } from "./questions/FeynmanWhyRenderer"
import { MiniMindmapRenderer } from "./questions/MiniMindmapRenderer"
import { DerivationRenderer } from "./questions/DerivationRenderer"
import { AnalogyCardRenderer } from "./questions/AnalogyCardRenderer"
import { SpacedRecapRenderer } from "./questions/SpacedRecapRenderer"
import colors from "@/app/utils/colors"

interface QuestionRendererProps {
  question: any
  questionNumber: number
  showAnswer: boolean
  onAnswer: (isCorrect: boolean) => void
  onNext: () => void
}

// Separate question types from explanation types
const questionTypes = [
  "MCQ",
  "FIB",
  "FreeText",
  "VoiceAnswer",
  "Highlight",
  "MatchPair",
  "ReorderList",
  "SliderEstimate",
  "SwipeCards",
  "ListenAndType",
  "Translation",
  "SpeakAndRepeat",
]

const explanationTypes = ["FeynmanWhy", "MiniMindmap", "Derivation", "AnalogyCard", "SpacedRecap"]

// Map question types to user-friendly display names
const questionTypeDisplayNames = {
  MCQ: "Multiple Choice",
  FIB: "Fill in the Blank",
  FreeText: "Free Response",
  VoiceAnswer: "Voice Response",
  Highlight: "Text Highlighting",
  MatchPair: "Match Pairs",
  ReorderList: "Reorder Items",
  SliderEstimate: "Slider Estimate",
  SwipeCards: "Swipe Cards",
  ListenAndType: "Listen & Type",
  Translation: "Translation",
  SpeakAndRepeat: "Speak & Repeat",
}

// Map explanation types to user-friendly display names
const explanationTypeDisplayNames = {
  FeynmanWhy: "Think About This",
  MiniMindmap: "Concept Map",
  Derivation: "Step-by-Step Guide",
  AnalogyCard: "Understanding Through Analogy",
  SpacedRecap: "Key Points Review",
}

// Styling for question types
const questionTypeStyles = {
  MCQ: { backgroundColor: "#3B82F6", icon: "✓" },
  FIB: { backgroundColor: "#10B981", icon: "✏️" },
  FreeText: { backgroundColor: "#8B5CF6", icon: "📝" },
  VoiceAnswer: { backgroundColor: "#F59E0B", icon: "🎤" },
  Highlight: { backgroundColor: "#EF4444", icon: "🎯" },
  MatchPair: { backgroundColor: "#06B6D4", icon: "🔗" },
  ReorderList: { backgroundColor: "#84CC16", icon: "📋" },
  SliderEstimate: { backgroundColor: "#F97316", icon: "📊" },
  SwipeCards: { backgroundColor: "#EC4899", icon: "👆" },
  ListenAndType: { backgroundColor: "#14B8A6", icon: "👂" },
  Translation: { backgroundColor: "#6366F1", icon: "🌍" },
  SpeakAndRepeat: { backgroundColor: "#F59E0B", icon: "🗣️" },
}

// Styling for explanation types
const explanationTypeStyles = {
  FeynmanWhy: { backgroundColor: colors.lightPrimary, color: colors.primary, icon: "🤔" },
  MiniMindmap: { backgroundColor: "#E0F2FE", color: "#0891B2", icon: "🧠" },
  Derivation: { backgroundColor: "#ECFDF5", color: "#059669", icon: "🔬" },
  AnalogyCard: { backgroundColor: "#FEF3C7", color: "#D97706", icon: "💡" },
  SpacedRecap: { backgroundColor: "#F0FDF4", color: "#16A34A", icon: "🔄" },
}

export function QuestionRenderer({ question, questionNumber, showAnswer, onAnswer, onNext }: QuestionRendererProps) {
  const renderQuestion = () => {
    const commonProps = {
      question,
      showAnswer,
      onAnswer,
    }

    switch (question.type) {
      case "MCQ":
        return <MCQRenderer {...commonProps} />
      case "FIB":
        return <FIBRenderer {...commonProps} />
      case "FreeText":
        return <FreeTextRenderer {...commonProps} />
      case "VoiceAnswer":
        return <VoiceAnswerRenderer {...commonProps} />
      case "Highlight":
        return <HighlightRenderer {...commonProps} />
      case "MatchPair":
        return <MatchPairRenderer {...commonProps} />
      case "ReorderList":
        return <ReorderListRenderer {...commonProps} />
      case "SliderEstimate":
        return <SliderEstimateRenderer {...commonProps} />
      case "SwipeCards":
        return <SwipeCardsRenderer {...commonProps} />
      case "ListenAndType":
        return <ListenAndTypeRenderer {...commonProps} />
      case "Translation":
        return <TranslationRenderer {...commonProps} />
      case "SpeakAndRepeat":
        return <SpeakAndRepeatRenderer {...commonProps} />
      case "FeynmanWhy":
        return <FeynmanWhyRenderer {...commonProps} />
      case "MiniMindmap":
        return <MiniMindmapRenderer {...commonProps} />
      case "Derivation":
        return <DerivationRenderer {...commonProps} />
      case "AnalogyCard":
        return <AnalogyCardRenderer {...commonProps} />
      case "SpacedRecap":
        return <SpacedRecapRenderer {...commonProps} />
      default:
        return (
          <View style={styles.unsupportedContainer}>
            <Text style={styles.unsupportedText}>Unsupported question type: {question.type}</Text>
          </View>
        )
    }
  }

  const autoAnswerTypes = [
    "FeynmanWhy",
    "MiniMindmap",
    "Derivation",
    "AnalogyCard",
    "Highlight",
    "MatchPair",
    "ReorderList",
    "SpacedRecap",
  ]

  // Determine if this is a question or explanation
  const isQuestion = questionTypes.includes(question.type)
  const isExplanation = explanationTypes.includes(question.type)

  // Get appropriate display name and styling
  const displayName = isQuestion
    ? questionTypeDisplayNames[question.type]
    : explanationTypeDisplayNames[question.type] || question.type

  const typeStyle = isQuestion
    ? questionTypeStyles[question.type] || { backgroundColor: colors.primary }
    : explanationTypeStyles[question.type] || { backgroundColor: colors.lightPrimary, color: colors.primary }

  return (
    <View style={styles.container}>
      {/* Header - Different for Questions vs Explanations */}
      <View style={styles.questionHeader}>
        {isQuestion ? (
          // Question Header
          <>
            <View style={styles.questionBadge}>
              <Text style={styles.questionBadgeText}>Question {questionNumber}</Text>
            </View>
            <View style={[styles.typeBadge, { backgroundColor: typeStyle.backgroundColor }]}>
              {typeStyle.icon && <Text style={styles.typeIcon}>{typeStyle.icon}</Text>}
              <Text style={styles.typeBadgeText}>{displayName}</Text>
            </View>
          </>
        ) : (
          // Explanation Header
          <View style={styles.explanationHeader}>
            <View style={[styles.explanationBadge, { backgroundColor: typeStyle.backgroundColor }]}>
              {typeStyle.icon && (
                <Text style={[styles.explanationIcon, { color: typeStyle.color }]}>{typeStyle.icon}</Text>
              )}
              <Text style={[styles.explanationBadgeText, { color: typeStyle.color }]}>{displayName}</Text>
            </View>
          </View>
        )}
      </View>

      {renderQuestion()}

      {(showAnswer || autoAnswerTypes.includes(question.type)) && (
        <TouchableOpacity style={styles.nextButton} onPress={onNext}>
          <Text style={styles.nextButtonText}>{isExplanation ? "Continue Learning →" : "Continue →"}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  questionBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  questionBadgeText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "500",
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  typeBadgeText: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
  },
  // Explanation-specific styles
  explanationHeader: {
    width: "100%",
    alignItems: "center",
  },
  explanationBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  explanationIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  explanationBadgeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  unsupportedContainer: {
    padding: 32,
    alignItems: "center",
  },
  unsupportedText: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
    alignItems: "center",
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})
