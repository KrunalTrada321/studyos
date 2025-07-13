"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { View, StyleSheet, Animated, Dimensions } from "react-native"
import { colors } from "../utils/colors"

const { width } = Dimensions.get("window")

interface VoiceWaveformProps {
  isActive: boolean
}

const VoiceWaveform: React.FC<VoiceWaveformProps> = ({ isActive }) => {
  const animatedValues = useRef(Array.from({ length: 15 }, () => new Animated.Value(0.2))).current

  useEffect(() => {
    if (isActive) {
      startWaveAnimation()
    } else {
      stopWaveAnimation()
    }
  }, [isActive])

  const startWaveAnimation = () => {
    const animations = animatedValues.map((animatedValue) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: Math.random() * 0.8 + 0.2,
            duration: 200 + Math.random() * 300,
            useNativeDriver: false,
          }),
          Animated.timing(animatedValue, {
            toValue: Math.random() * 0.8 + 0.2,
            duration: 200 + Math.random() * 300,
            useNativeDriver: false,
          }),
        ]),
      )
    })

    Animated.stagger(30, animations).start()
  }

  const stopWaveAnimation = () => {
    animatedValues.forEach((animatedValue) => {
      Animated.timing(animatedValue, {
        toValue: 0.2,
        duration: 300,
        useNativeDriver: false,
      }).start()
    })
  }

  return (
    <View style={styles.container}>
      <View style={styles.waveform}>
        {animatedValues.map((animatedValue, index) => (
          <Animated.View
            key={index}
            style={[
              styles.bar,
              {
                height: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [3, 30],
                }),
                backgroundColor: isActive ? colors.primary : colors.inactive,
                opacity: isActive ? 1 : 0.5,
              },
            ]}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    width: width * 0.6,
    marginVertical: 10,
  },
  waveform: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  bar: {
    width: 4,
    borderRadius: 2,
    marginHorizontal: 1,
  },
})

export default VoiceWaveform
