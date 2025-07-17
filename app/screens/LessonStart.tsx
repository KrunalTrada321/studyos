"use client";

import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CompletionModal } from "../components/Lesson/CompletionModal";
import { ProgressBar } from "../components/Lesson/ProgressBar";
import { QuestionRenderer } from "../components/Lesson/QuestionRenderer";
import Constants from "../utils/constants";
import { getToken } from "../utils/token";

const colors = {
  primary: "#5C6AC4",
  black: "#000000",
  white: "#FFFFFF",
  lightRed: "#FFDEDE",
  lightPrimary: "#DDE1FF",
};

const { width, height } = Dimensions.get("window");

interface Lesson {
  id: string;
  title: string;
  description: string;
  quiz: Question[];
  estimatedTime: number;
}

interface Question {
  type: string;
  difficulty: "Easy" | "Medium" | "Hard";
  question?: string;
  statement?: string;
  title?: string;
  description?: string;
  [key: string]: any;
}

export default function LessonScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { lessonId } = route.params as { lessonId: string };

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<boolean[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completingLesson, setCompletingLesson] = useState(false);

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${Constants.api}/api/lessons/${lessonId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch lesson");

      const data = await response.json();
      setLesson(data);
    } catch (error) {
      console.error("Error fetching lesson:", error);
      Alert.alert("Error", "Failed to load lesson. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (isCorrect: boolean) => {
    setUserAnswers((prev) => [...prev, isCorrect]);
    setShowAnswer(true);
  };

  const handleNext = () => {
    const autoAnswerTypes = [
      "FeynmanWhy",
      "MiniMindmap",
      "Derivation",
      "AnalogyCard",
      "Highlight",
      "MatchPair",
      "ReorderList",
      "SpacedRecap",
    ];

    if (
      !showAnswer &&
      lesson &&
      autoAnswerTypes.includes(lesson.quiz[currentIndex].type)
    ) {
      setUserAnswers((prev) => [...prev, true]);
    }

    if (lesson && currentIndex >= lesson.quiz.length - 1) {
      completeLesson();
    } else {
      setCurrentIndex((prev) => prev + 1);
      setShowAnswer(false);
    }
  };

  const completeLesson = async () => {
    setCompletingLesson(true);
    try {
      const token = await getToken();
      const response = await fetch(
        `${Constants.api}/api/lessons/${lessonId}/submit-results`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setIsCompleted(true);
      } else {
        Alert.alert("Error", "Failed to complete lesson. Please try again.");
      }
    } catch (error) {
      console.error("Error completing lesson:", error);
      Alert.alert("Error", "Failed to complete lesson. Please try again.");
    } finally {
      setCompletingLesson(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return { backgroundColor: "#E8F5E8", color: "#2E7D32" };
      case "Medium":
        return { backgroundColor: "#FFF3E0", color: "#F57C00" };
      case "Hard":
        return { backgroundColor: colors.lightRed, color: "#D32F2F" };
      default:
        return { backgroundColor: NaN, color: NaN };
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading lesson...</Text>
      </SafeAreaView>
    );
  }

  if (!lesson) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <Text style={styles.errorTitle}>Lesson Not Found</Text>
        <Text style={styles.errorText}>
          The lesson you're looking for doesn't exist.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const progress =
    ((currentIndex + (showAnswer ? 1 : 0)) / lesson.quiz.length) * 100;
  const currentQuestion = lesson.quiz[currentIndex];
  const correctCount = userAnswers.filter(Boolean).length;
  const difficultyStyle = getDifficultyColor(currentQuestion.difficulty);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Minimal Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButtonContainer}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.lessonTitle} numberOfLines={1}>
            {lesson.title}
          </Text>
          <View style={styles.headerInfo}>
            <Text style={styles.progressText}>
              {currentIndex + 1} of {lesson.quiz.length}
            </Text>
            <View
              style={[
                { backgroundColor: difficultyStyle.backgroundColor },
                styles.difficultyBadge,
              ]}
            >
              <Text
                style={[
                  styles.difficultyText,
                  { color: difficultyStyle.color },
                ]}
              >
                {currentQuestion.difficulty}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Text style={styles.timeText}>{lesson.estimatedTime}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <ProgressBar progress={progress} />
      </View>

      {/* Question Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.questionCard}>
          <QuestionRenderer
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            showAnswer={showAnswer}
            onAnswer={handleAnswer}
            onNext={handleNext}
          />
        </View>

        {/* Answer Explanation */}
        {showAnswer && currentQuestion.explanation && (
          <View style={styles.explanationCard}>
            <View style={styles.explanationHeader}>
              <Text style={styles.explanationIcon}>💡</Text>
              <Text style={styles.explanationTitle}>Explanation</Text>
            </View>
            <Text style={styles.explanationText}>
              {currentQuestion.explanation}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Completion Modal */}
      <CompletionModal
        visible={isCompleted}
        onClose={() => navigation.goBack()}
        lessonTitle={lesson.title}
        totalQuestions={lesson.quiz.length}
        correctAnswers={correctCount}
        isLoading={completingLesson}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.black,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backArrow: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: "600",
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 12,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.black,
    marginBottom: 4,
  },
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressText: {
    fontSize: 14,
    color: "#666666",
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: "600",
  },
  headerRight: {
    alignItems: "flex-end",
  },
  timeText: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "500",
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 16,
  },
  questionCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  explanationCard: {
    backgroundColor: colors.lightPrimary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#C5CAE9",
  },
  explanationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  explanationIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
  explanationText: {
    fontSize: 14,
    color: colors.primary,
    lineHeight: 20,
  },
});
