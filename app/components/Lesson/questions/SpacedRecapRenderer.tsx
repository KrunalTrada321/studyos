"use client"

import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native"
import { useState, useEffect, useRef } from "react"

interface Question {
  question: string
  answer: string
}

interface SpacedRecapRendererProps {
  question: {
    questions: Question[]
  }
  showAnswer: boolean
  onAnswer: (isCorrect: boolean) => void
}

export function SpacedRecapRenderer({ question, onAnswer }: SpacedRecapRendererProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [showCurrentAnswer, setShowCurrentAnswer] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [userThinking, setUserThinking] = useState(true)
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current

  const questions = question.questions || []
  const currentQuestion = questions[currentQuestionIndex]
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0

  useEffect(() => {
    // Animate in the current question
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start()
  }, [currentQuestionIndex])

  const handleShowAnswer = () => {
    setShowCurrentAnswer(true)
    setUserThinking(false)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      // Reset animations
      fadeAnim.setValue(0)
      slideAnim.setValue(50)
      scaleAnim.setValue(0.9)
      
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setShowCurrentAnswer(false)
      setUserThinking(true)
    } else {
      setIsComplete(true)
    }
  }

  const handleRestart = () => {
    setCurrentQuestionIndex(0)
    setShowCurrentAnswer(false)
    setIsComplete(false)
    setUserThinking(true)
    
    // Reset animations
    fadeAnim.setValue(0)
    slideAnim.setValue(50)
    scaleAnim.setValue(0.9)
  }

  if (questions.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.icon}>❓</Text>
          <Text style={styles.title}>No Questions Available</Text>
          <Text style={styles.subtitle}>No recap questions were provided for this session.</Text>
        </View>
      </View>
    )
  }

  if (isComplete) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.icon}>🎉</Text>
          <Text style={styles.title}>Recap Complete!</Text>
          <Text style={styles.subtitle}>You've reviewed all {questions.length} questions</Text>
        </View>
        
        <View style={styles.completionCard}>
          <Text style={styles.completionText}>
            Great job! You've completed the spaced recap session.
          </Text>
          <TouchableOpacity style={styles.restartButton} onPress={handleRestart}>
            <Text style={styles.restartButtonText}>Review Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.icon}>🧠</Text>
        <Text style={styles.title}>Spaced Recap</Text>
        <Text style={styles.subtitle}>
          Question {currentQuestionIndex + 1} of {questions.length}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
      </View>

      {/* Question Card */}
      <Animated.View 
        style={[
          styles.questionCard,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        <View style={styles.questionHeader}>
          <Text style={styles.questionLabel}>Question</Text>
        </View>
        
        <Text style={styles.questionText}>{currentQuestion?.question}</Text>
        
        {userThinking && (
          <View style={styles.thinkingSection}>
            <Text style={styles.thinkingText}>
              💭 Take a moment to think about your answer...
            </Text>
            <TouchableOpacity 
              style={styles.revealButton}
              onPress={handleShowAnswer}
            >
              <Text style={styles.revealButtonText}>Show Answer</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

      {/* Answer Card */}
      {showCurrentAnswer && (
        <Animated.View 
          style={[
            styles.answerCard,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.answerHeader}>
            <Text style={styles.answerLabel}>Answer</Text>
          </View>
          
          <Text style={styles.answerText}>{currentQuestion?.answer}</Text>
          
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={handleNextQuestion}
          >
            <Text style={styles.continueButtonText}>
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Complete'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FAFBFC',
    borderRadius: 20
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 40,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    minWidth: 40,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  questionHeader: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  questionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4338CA',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  questionText: {
    fontSize: 18,
    color: '#1E293B',
    lineHeight: 26,
    fontWeight: '500',
  },
  thinkingSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  thinkingText: {
    fontSize: 16,
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 16,
    textAlign: 'center',
  },
  revealButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  revealButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  answerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  answerHeader: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  answerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  answerText: {
    fontSize: 16,
    color: '#1E293B',
    lineHeight: 24,
    marginBottom: 24,
  },
  continueButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  completionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  completionText: {
    fontSize: 18,
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 26,
  },
  restartButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  restartButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
})