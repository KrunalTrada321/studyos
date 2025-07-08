import React, { useRef, useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Animated, PanResponder, Dimensions, Vibration } from "react-native"

interface Question {
  statement: string
  answer: boolean
}

interface SwipeCardsRendererProps {
  question: Question
  showAnswer: boolean
  onAnswer: (isCorrect: boolean) => void
}

const { width: screenWidth } = Dimensions.get('window')

export function SwipeCardsRenderer({ question, showAnswer, onAnswer }: SwipeCardsRendererProps) {
  const translateX = useRef(new Animated.Value(0)).current
  const rotate = useRef(new Animated.Value(0)).current
  const opacity = useRef(new Animated.Value(1)).current
  const scale = useRef(new Animated.Value(1)).current
  const feedbackOpacity = useRef(new Animated.Value(0)).current
  const feedbackScale = useRef(new Animated.Value(0.8)).current
  
  const [isAnswering, setIsAnswering] = useState(false)
  const [userAnswer, setUserAnswer] = useState<boolean | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

  const handleAnswer = (answer: boolean) => {
    if (isAnswering) return
    
    const correct = answer === question.answer
    setUserAnswer(answer)
    setIsCorrect(correct)
    setIsAnswering(true)
    
    // Haptic feedback
    if (correct) {
      Vibration.vibrate(50) // Success vibration
    } else {
      Vibration.vibrate([50, 50, 50]) // Error vibration pattern
    }
    
    // Show feedback animation
    Animated.parallel([
      Animated.spring(feedbackOpacity, {
        toValue: 1,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }),
      Animated.spring(feedbackScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }),
    ]).start()
    
    // Call onAnswer after feedback animation
    setTimeout(() => {
      onAnswer(correct)
    }, 1800)
  }

  const animateCardOut = (direction: 'left' | 'right') => {
    const targetX = direction === 'left' ? -screenWidth * 1.5 : screenWidth * 1.5
    const rotationValue = direction === 'left' ? -30 : 30
    
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: targetX,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(rotate, {
        toValue: rotationValue,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      const answer = direction === 'right'
      handleAnswer(answer)
    })
  }

  const resetCardPosition = () => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 120,
        friction: 8,
      }),
      Animated.spring(rotate, {
        toValue: 0,
        useNativeDriver: true,
        tension: 120,
        friction: 8,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 120,
        friction: 8,
      }),
    ]).start()
  }

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 5 && !showAnswer && !isAnswering
    },
    onPanResponderGrant: () => {
      // Don't use offset, just track the gesture directly
    },
    onPanResponderMove: (_, gestureState) => {
      if (showAnswer || isAnswering) return
      
      translateX.setValue(gestureState.dx)
      
      // Smooth rotation and scale based on swipe distance
      const rotationValue = Math.max(-20, Math.min(20, gestureState.dx / 8))
      const scaleValue = Math.max(0.92, 1 - Math.abs(gestureState.dx) / 1200)
      
      rotate.setValue(rotationValue)
      scale.setValue(scaleValue)
    },
    onPanResponderRelease: (_, gestureState) => {
      if (showAnswer || isAnswering) return
      
      const swipeThreshold = screenWidth * 0.2
      const velocityThreshold = 300
      
      const isSwipeLeft = gestureState.dx < -swipeThreshold || gestureState.vx < -velocityThreshold
      const isSwipeRight = gestureState.dx > swipeThreshold || gestureState.vx > velocityThreshold
      
      if (isSwipeLeft) {
        animateCardOut('left')
      } else if (isSwipeRight) {
        animateCardOut('right')
      } else {
        resetCardPosition()
      }
    },
  })

  // Reset animations when question changes
  useEffect(() => {
    translateX.setValue(0)
    rotate.setValue(0)
    opacity.setValue(1)
    scale.setValue(1)
    feedbackOpacity.setValue(0)
    feedbackScale.setValue(0.8)
    setIsAnswering(false)
    setUserAnswer(null)
    setIsCorrect(null)
  }, [question])

  const cardStyle = {
    transform: [
      { translateX },
      { 
        rotate: rotate.interpolate({
          inputRange: [-20, 0, 20],
          outputRange: ['-20deg', '0deg', '20deg'],
        }) 
      },
      { scale },
    ],
    opacity,
  }

  // Dynamic indicator opacity based on swipe
  const leftIndicatorOpacity = translateX.interpolate({
    inputRange: [-150, -30, 0],
    outputRange: [1, 0.3, 0],
    extrapolate: 'clamp',
  })

  const rightIndicatorOpacity = translateX.interpolate({
    inputRange: [0, 30, 150],
    outputRange: [0, 0.3, 1],
    extrapolate: 'clamp',
  })

  // Card background color changes based on swipe direction
  const cardBackgroundColor = translateX.interpolate({
    inputRange: [-100, 0, 100],
    outputRange: ['rgba(239, 68, 68, 0.05)', 'rgba(248, 250, 252, 1)', 'rgba(16, 185, 129, 0.05)'],
    extrapolate: 'clamp',
  })

  return (
    <View style={styles.container}>
      {/* Swipe Indicators - Only show during swipe, not during results */}
      {!isAnswering && (
        <>
          <Animated.View style={[styles.indicator, styles.leftIndicator, { opacity: leftIndicatorOpacity }]}>
            <Text style={styles.leftIndicatorText}>✗</Text>
          </Animated.View>
          
          <Animated.View style={[styles.indicator, styles.rightIndicator, { opacity: rightIndicatorOpacity }]}>
            <Text style={styles.rightIndicatorText}>✓</Text>
          </Animated.View>
        </>
      )}

      {/* Swipeable Card */}
      <Animated.View 
        style={[
          styles.cardContainer, 
          cardStyle,
          { backgroundColor: cardBackgroundColor }
        ]}
        {...((!showAnswer && !isAnswering) ? panResponder.panHandlers : {})}
      >
        <Text style={styles.statement}>{question.statement}</Text>
        
        {!showAnswer && !isAnswering && (
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>← FALSE • TRUE →</Text>
          </View>
        )}
      </Animated.View>

      {/* Feedback Overlay - Only show this, not the showAnswer part */}
      {isAnswering && (
        <Animated.View 
          style={[
            styles.feedbackContainer,
            {
              opacity: feedbackOpacity,
              transform: [{ scale: feedbackScale }]
            }
          ]}
        >
          <View style={[
            styles.feedbackCircle,
            { backgroundColor: isCorrect ? '#10B981' : '#EF4444' }
          ]}>
            <Text style={styles.feedbackIcon}>
              {isCorrect ? '✓' : '✗'}
            </Text>
          </View>
          <Text style={[
            styles.feedbackText,
            { color: isCorrect ? '#10B981' : '#EF4444' }
          ]}>
            {isCorrect ? 'Correct!' : 'Wrong!'}
          </Text>
          <Text style={styles.feedbackAnswer}>
            Answer: {question.answer ? 'True' : 'False'}
          </Text>
        </Animated.View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  cardContainer: {
    borderRadius: 24,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 280,
    width: screenWidth - 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  statement: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    lineHeight: 32,
    marginBottom: 40,
  },
  hintContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    borderRadius: 20,
  },
  hintText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    fontWeight: "600",
    letterSpacing: 1,
  },
  indicator: {
    position: 'absolute',
    top: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    transform: [{ translateY: -40 }],
  },
  leftIndicator: {
    left: 40,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  rightIndicator: {
    right: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  leftIndicatorText: {
    fontSize: 36,
    color: '#EF4444',
    fontWeight: 'bold',
  },
  rightIndicatorText: {
    fontSize: 36,
    color: '#10B981',
    fontWeight: 'bold',
  },
  feedbackContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  feedbackCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  feedbackIcon: {
    fontSize: 36,
    color: 'white',
    fontWeight: 'bold',
  },
  feedbackText: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  feedbackAnswer: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },
  finalAnswerContainer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  finalAnswerText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  finalAnswerDetail: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
})